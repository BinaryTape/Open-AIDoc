import type { DefaultTheme } from 'vitepress'
import { splitLocalePath } from '../../../shared/content-paths'

export type Crumb = {
  /** The sidebar text (localized; may hold HTML, as the sidebar renders it). */
  text: string
  /** Only for an ancestor that has its own page; the current page has none. */
  link?: string
}

/**
 * Doc sets whose official site shows breadcrumbs: kotlinlang.org and ktor.io
 * (Writerside, which kotlin's included coroutines, serialization… share) and
 * insert-koin.io (Docusaurus). The MkDocs Material sites (Koog, Coil,
 * SQLDelight) show none.
 */
export const BREADCRUMB_DOC_TYPES: readonly string[] = ['kotlin', 'ktor', 'kmp', 'koin']

type Item = DefaultTheme.SidebarItem

/** `/ja/kotlin/x`, `ja/kotlin/x.md`, `/koin/index` → one comparable form. */
function normalizePath(path: string): string {
  return ('/' + decodeURI(path).replace(/[?#].*$/, '').replace(/^\/+/, ''))
    .replace(/\.(md|html)$/, '')
    .replace(/(^|\/)index$/, '$1')
}

/** The sidebar VitePress shows for this page: the longest matching key, as its getSidebar does. */
function sidebarOf(sidebar: DefaultTheme.Sidebar | undefined, path: string): Item[] {
  if (!sidebar) return []
  if (Array.isArray(sidebar)) return sidebar
  const key = Object.keys(sidebar)
    .sort((a, b) => b.split('/').length - a.split('/').length)
    .find((dir) => path.startsWith(dir.startsWith('/') ? dir : `/${dir}`))
  const found = key ? sidebar[key] : []
  return Array.isArray(found) ? found : found.items
}

/** The items from the top of the sidebar down to the page, or undefined. */
function trailTo(items: Item[] | undefined, path: string): Item[] | undefined {
  for (const item of items ?? []) {
    if (item.link && normalizePath(item.link) === path) return [item]
    const below = trailTo(item.items, path)
    if (below) return [item, ...below]
  }
  return undefined
}

/**
 * The breadcrumbs of the page at `relativePath` (`ja/ktor/x.md`): the sidebar
 * groups above it, then the page under its sidebar title (kotlinlang shows
 * `basic-syntax` as "Language guide / Basic syntax / Overview"). Empty for a
 * page at the top of the sidebar, a page not in it, and the doc sets whose
 * official site has no breadcrumbs.
 */
export function breadcrumbTrail(sidebar: DefaultTheme.Sidebar | undefined, relativePath: string): Crumb[] {
  const docType = splitLocalePath(relativePath).contentPath.split('/')[0]
  if (!BREADCRUMB_DOC_TYPES.includes(docType)) return []
  const path = normalizePath(relativePath)
  const trail = trailTo(sidebarOf(sidebar, path), path)
  if (!trail || trail.length < 2) return []
  return trail.map((item, index) => {
    const crumb: Crumb = { text: item.text ?? '' }
    if (item.link && index < trail.length - 1) crumb.link = item.link
    return crumb
  })
}
