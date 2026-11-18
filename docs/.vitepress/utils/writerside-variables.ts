import fs from 'node:fs'
import path from 'node:path'
import { localePageRelPath, splitLocalePath } from '../../../shared/content-paths'
import { parseVariables, substituteVariables, VARIABLE_FILES } from './variable-text'

export { substituteVariables }

/** The Writerside variables (`<var name value/>`) of a doc type, by name (variable-text.ts). */
export function writersideVariables(docType: string | undefined): Record<string, string> {
  const sources = (VARIABLE_FILES[docType ?? ''] ?? []).map((file) => {
    try {
      const resolved = path.resolve('docs/.vitepress/variables', file)
      return fs.existsSync(resolved) ? fs.readFileSync(resolved, 'utf-8') : ''
    } catch (error) {
      console.error(`Error reading XML variable file:`, error)
      return ''
    }
  })
  return parseVariables(...sources)
}

/**
 * The variables a page defines itself (`<var name="plugin_name" value="CallId"/>`),
 * as its opening text (title, first paragraph, `<tldr>`) uses them: a page
 * can define one again further down for a section of its own, as
 * server-compression does for its zstd artifact, so the first one wins.
 */
export function pageVariables(source: string): Record<string, string> {
  const variables: Record<string, string> = Object.create(null)
  for (const m of source.matchAll(/<var\s+name="([^"]+)"\s+value="([^"]+)"[^>]*>/gi)) {
    if (!(m[1] in variables)) variables[m[1]] = m[2]
  }
  return variables
}

/** The source file (`ja/ktor/server-cors.md`) a link of the page at `relativePath` points at. */
function linkTarget(relativePath: string, href: string): string {
  const target = href.replace(/[?#].*$/, '').replace(/\.(md|html)$/, '')
  // `//server-cors`: the sync pipeline's form of a page of the same doc set
  if (target.startsWith('//')) return path.posix.join(path.posix.dirname(relativePath), `${target.slice(2)}.md`)
  if (target.startsWith('/')) {
    return localePageRelPath(splitLocalePath(relativePath).locale, `${splitLocalePath(target.slice(1)).contentPath}.md`)
  }
  return path.posix.join(path.posix.dirname(relativePath), `${target}.md`)
}

/** Text out of Writerside or Markdown markup, for an attribute. */
function plainText(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, '')
    .replace(/!?\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_\s][^*_]*?)[*_](?=\s|$|[.,;:!?)])/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/"/g, '&quot;')
}

/** The first paragraph of a page's text, past its metadata, or null. */
function firstParagraph(source: string): string | null {
  const body = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/<(tldr|link-summary|card-summary|web-summary)\b[\s\S]*?<\/\1>/g, '\n\n')
    .replace(/```[\s\S]*?```/g, '\n\n')
    .replace(/^\[\/\/\]: #.*$/gm, '')
    .replace(/<(topic|show-structure|primary-label|secondary-label|var)\b[^>]*>/g, '\n\n')
  for (const block of body.split(/\n\s*\n/)) {
    const text = block.trim()
    if (!text) continue
    const p = text.match(/^<p>([\s\S]*?)<\/p>/)?.[1]
    if (p !== undefined) return p
    // A heading, another element, an attribute line, a list, a quote, a table
    if (/^(#|<|\{|[-*+]\s|\d+\.\s|>|\|)/.test(text)) continue
    // The paragraph ends where a list starts
    const lines = text.split('\n')
    const end = lines.findIndex((line) => /^\s*([-*+]|\d+\.)\s/.test(line))
    return (end < 0 ? lines : lines.slice(0, end)).join('\n').replace(/\{[^}\n]*}\s*$/, '')
  }
  return null
}

/**
 * The tooltip ktor.io shows for a link to a page: its `<link-summary>`, else
 * the first paragraph of its `<tldr>`, else its first paragraph (checked
 * against all 823 tooltips of ktor.io), with its variables filled in. Null
 * for a page with no text for it.
 */
export function linkSummaryOf(page: string): string | null {
  const variables = pageVariables(page)
  const markup = page.match(/<link-summary>([\s\S]*?)<\/link-summary>/)?.[1]
    ?? page.match(/<tldr>([\s\S]*?)<\/tldr>/)?.[1]?.match(/<p>([\s\S]*?)<\/p>/)?.[1]
    ?? firstParagraph(page)
  const text = markup === null || markup === undefined ? '' : plainText(substituteVariables(markup, variables))
  return text || null
}

/**
 * The tooltip of each `<Links>` of a page, taken from the page it links to as
 * ktor.io takes it (linkSummaryOf). The sync pipeline wrote it in from that
 * page when it translated the linking one: the whole `<tldr>` ("Required
 * dependencies … Code example … Native server support …", P2-33), nothing for
 * a page without one, and the page's variables left as they were
 * ("io.ktor:%artifact_name%", P2-32). Kept when the linked page has no text.
 * @param source - A page
 * @param relativePath - Its path under docs/ (`ja/ktor/FAQ.md`)
 * @param readPage - The source of a page under docs/, or null
 */
export function resolveLinkSummaries(
  source: string,
  relativePath: string,
  readPage: (relativePath: string) => string | null = readDocsPage,
): string {
  return source.replace(/<Links\b[^>]*>/g, (tag) => {
    const summary = tag.match(/\ssummary="([^"]*)"/)
    const href = tag.match(/\shref="([^"]*)"/)?.[1]
    if (!summary || !href || /^[a-z]+:/i.test(href)) return tag
    const target = readPage(linkTarget(relativePath, href))
    if (!target) return tag
    // A value holds no '"' (pageVariables), so the attribute stays well-formed
    const text = linkSummaryOf(target) ?? substituteVariables(summary[1], pageVariables(target))
    return tag.replace(summary[0], () => ` summary="${text}"`)
  })
}

// Pages by path, read again when the file changes (dev server)
const pages = new Map<string, { mtime: number, source: string }>()
function readDocsPage(relativePath: string): string | null {
  const file = path.resolve('docs', relativePath)
  if (!fs.existsSync(file)) return null
  const mtime = fs.statSync(file).mtimeMs
  const cached = pages.get(relativePath)
  if (cached?.mtime === mtime) return cached.source
  const source = fs.readFileSync(file, 'utf-8')
  pages.set(relativePath, { mtime, source })
  return source
}
