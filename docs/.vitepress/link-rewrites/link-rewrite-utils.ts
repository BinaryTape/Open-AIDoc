/**
 * Shared helpers for LinkRewrite modules (docs/.vitepress/link-rewrites/).
 *
 * LinkRewrite runs at VitePress Markdown compile time and rewrites in-doc
 * hrefs to local routes. It is separate from SyncStrategy under
 * tools/pipeline/sync-strategies/, which only runs in the sync/translate pipeline.
 */
import { existsSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  findLocaleInPath,
  localeFsPrefix,
  normalizePosixPath,
  toContentUrl,
} from '../../../shared/content-paths'
import { CONTENT_LOCALES } from '../../../shared/locales'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export function getPageLocale(env: any) {
  return findLocaleInPath(env.relativePath, CONTENT_LOCALES)
}

export function splitHref(href: string) {
  const suffixIndex = href.search(/[?#]/)
  if (suffixIndex === -1) {
    return { pathname: href, suffix: '' }
  }

  return {
    pathname: href.slice(0, suffixIndex),
    suffix: href.slice(suffixIndex)
  }
}

export function isExternalOrFragment(href: string) {
  return /^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(href) ||
    href.startsWith('#')
}

export function normalizeDocTarget(target: string, docType: string) {
  let normalized = normalizePosixPath(target)
    .replace(new RegExp(`^/${docType}/?`), '')
    .replace(/^\/+/, '')
    .replace(/\.(?:md|topic)$/, '')

  normalized = posix.normalize(normalized)
  if (normalized === '.' || normalized === 'index') return ''
  return normalized.replace(/\/index$/, '')
}

export function resolveRelativeDocTarget(
  env: any,
  docType: string,
  target: string
) {
  if (target.startsWith('/')) {
    return normalizeDocTarget(target, docType)
  }

  const relativePath = normalizePosixPath(env.relativePath)
  const parts = relativePath.split('/')
  const docTypeIndex = parts.indexOf(docType)
  const currentDirectory = docTypeIndex === -1
    ? ''
    : posix.dirname(parts.slice(docTypeIndex + 1).join('/'))
  const fromCurrentDirectory = currentDirectory === '.'
    ? target
    : posix.join(currentDirectory, target)

  return normalizeDocTarget(fromCurrentDirectory, docType)
}

export function localDocExists(env: any, docType: string, target: string) {
  return localDocKind(env, docType, target) !== 'missing'
}

export function localDocKind(env: any, docType: string, target: string) {
  const locale = getPageLocale(env)
  const localePrefix = localeFsPrefix(locale)
  const normalizedTarget = normalizeDocTarget(target, docType)
  const directFile = normalizedTarget
    ? resolve(docsRoot, `${localePrefix}${docType}/${normalizedTarget}.md`)
    : ''
  const indexFile = resolve(
    docsRoot,
    `${localePrefix}${docType}/${normalizedTarget ? `${normalizedTarget}/` : ''}index.md`
  )

  if (directFile && existsSync(directFile)) return 'page'
  if (existsSync(indexFile)) return 'index'
  return 'missing'
}

export function localizedDocRoute(
  env: any,
  docType: string,
  target: string,
  suffix = ''
) {
  const locale = getPageLocale(env)
  const normalizedTarget = normalizeDocTarget(target, docType)
  const isIndex = !normalizedTarget
    ? true
    : localDocKind(env, docType, normalizedTarget) === 'index'

  // Directory index for empty target → trailing slash on docType root
  if (!normalizedTarget) {
    return toContentUrl(locale, docType, '', { suffix })
  }

  return toContentUrl(locale, docType, normalizedTarget, {
    index: isIndex,
    suffix,
  })
}
