/**
 * Sidebar link collection and source-page existence checks.
 * Mirrors docs/.vitepress/config/sidebar.config.ts path rules:
 *   - root sidebars map 1:1 to content dirs (ktor → docs/ktor/)
 *   - included sidebars keep the parent content dir (coroutines under kotlin)
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import {
  CONTENT_LOCALES,
  DEFAULT_LOCALE,
  isDefaultLocale,
  type ContentLocale,
  toContentRelPath,
} from './content-paths'

/** Top-level doc types that own a VitePress sidebar root (see DocsTypeConfig). */
export const ROOT_SIDEBAR_DOC_TYPES = [
  'koin',
  'kotlin',
  'sqldelight',
  'ktor',
  'kmp',
  'koog',
  'coil',
] as const

export type RootSidebarDocType = (typeof ROOT_SIDEBAR_DOC_TYPES)[number]

export type SidebarLinkRef = {
  /** Sidebar file id, e.g. `ktor` or nested `coroutines`. */
  sidebarId: string
  /** Content directory under docs/, e.g. `kotlin` for included coroutines. */
  contentDir: string
  /** Raw sidebar `link` slug (no locale / doc-type prefix). */
  link: string
}

export type MissingSidebarPage = SidebarLinkRef & {
  locale: ContentLocale
  /** Docs-relative paths that were checked. */
  checked: string[]
}

type SidebarNode = {
  link?: string
  href?: string
  include?: string
  items?: SidebarNode[]
}

function readSidebarJson(sidebarDir: string, sidebarId: string): SidebarNode[] {
  const filePath = join(sidebarDir, `${sidebarId}.sidebar.json`)
  return JSON.parse(readFileSync(filePath, 'utf8')) as SidebarNode[]
}

function sidebarFileExists(sidebarDir: string, sidebarId: string): boolean {
  return existsSync(join(sidebarDir, `${sidebarId}.sidebar.json`))
}

/**
 * Collect every internal `link` from root sidebars, following `include`
 * the same way generateSidebar does (parent contentDir is preserved).
 */
export function collectSidebarLinks(
  sidebarDir: string,
  rootTypes: readonly string[] = ROOT_SIDEBAR_DOC_TYPES
): SidebarLinkRef[] {
  const out: SidebarLinkRef[] = []

  const walk = (
    nodes: SidebarNode[],
    sidebarId: string,
    contentDir: string
  ) => {
    for (const node of nodes) {
      if (node.include) {
        if (sidebarFileExists(sidebarDir, node.include)) {
          walk(
            readSidebarJson(sidebarDir, node.include),
            node.include,
            contentDir
          )
        } else {
          // Fallback leaf: include name becomes a page link under contentDir
          out.push({
            sidebarId,
            contentDir,
            link: node.include,
          })
        }
        continue
      }

      if (node.link && !isExternalHref(node.link)) {
        out.push({
          sidebarId,
          contentDir,
          link: normalizeSidebarLink(node.link),
        })
      }

      // href-only entries are external (or absolute off-site); skip
      if (Array.isArray(node.items)) {
        walk(node.items, sidebarId, contentDir)
      }
    }
  }

  for (const docType of rootTypes) {
    if (!sidebarFileExists(sidebarDir, docType)) {
      throw new Error(`Missing root sidebar: ${docType}.sidebar.json`)
    }
    walk(readSidebarJson(sidebarDir, docType), docType, docType)
  }

  return out
}

export function normalizeSidebarLink(link: string): string {
  return link
    .replaceAll('\\', '/')
    .replace(/^\/+/, '')
    .replace(/\.md$/i, '')
    .replace(/\.html$/i, '')
}

export function isExternalHref(href: string): boolean {
  return /^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(href)
}

/**
 * Candidate docs-relative paths for a sidebar link in a locale.
 * e.g. link `welcome`, contentDir `ktor`, locale zh-Hans
 *   → [`ktor/welcome.md`, `ktor/welcome/index.md`]
 */
export function sidebarLinkCandidatePaths(
  locale: string,
  contentDir: string,
  link: string
): string[] {
  const normalized = normalizeSidebarLink(link)
  const base = toContentRelPath(locale, contentDir, normalized)
  return [`${base}.md`, joinPosix(base, 'index.md')]
}

export function sidebarPageExists(
  docsRoot: string,
  locale: string,
  contentDir: string,
  link: string
): { exists: boolean; checked: string[] } {
  const checked = sidebarLinkCandidatePaths(locale, contentDir, link)
  const exists = checked.some((rel) => existsSync(join(docsRoot, rel)))
  return { exists, checked }
}

export function findMissingSidebarPages(options: {
  docsRoot: string
  sidebarDir: string
  /** Defaults to default locale only (source of truth for sidebar entries). */
  locales?: readonly ContentLocale[]
  rootTypes?: readonly string[]
}): MissingSidebarPage[] {
  const locales = options.locales ?? [DEFAULT_LOCALE]
  const links = collectSidebarLinks(options.sidebarDir, options.rootTypes)
  const missing: MissingSidebarPage[] = []

  for (const ref of links) {
    for (const locale of locales) {
      const { exists, checked } = sidebarPageExists(
        options.docsRoot,
        locale,
        ref.contentDir,
        ref.link
      )
      if (!exists) {
        missing.push({ ...ref, locale, checked })
      }
    }
  }

  return missing
}

export function listSidebarIds(sidebarDir: string): string[] {
  return readdirSync(sidebarDir)
    .filter((name) => name.endsWith('.sidebar.json'))
    .map((name) => name.replace(/\.sidebar\.json$/, ''))
    .sort()
}

export { CONTENT_LOCALES, DEFAULT_LOCALE, isDefaultLocale }

function joinPosix(...parts: string[]): string {
  return parts
    .map((part) => part.replaceAll('\\', '/').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
}
