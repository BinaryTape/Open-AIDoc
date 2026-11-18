import fs from 'node:fs'
import path from 'node:path'
import { localePageRelPath, splitLocalePath } from '../../../shared/content-paths'

// Writerside variable files (docs/.vitepress/variables/) of each doc type,
// copied there by the docs pipeline
const VARIABLE_FILES: Record<string, string[]> = {
  kotlin: ['kotlin.v.list', 'serialization.v.list'],
  ktor: ['ktor.v.list'],
  kmp: ['kmp.v.list'],
}

/**
 * The Writerside variables (`<var name value/>`) of a doc type, by name. The
 * first file defining a variable wins: kotlin-web-site's own variables over
 * those of kotlinx.serialization, whose pages also go to kotlin/.
 */
export function writersideVariables(docType: string | undefined): Record<string, string> {
  const variables: Record<string, string> = Object.create(null)
  for (const file of VARIABLE_FILES[docType ?? ''] ?? []) {
    let source = ''
    try {
      const resolved = path.resolve('docs/.vitepress/variables', file)
      if (fs.existsSync(resolved)) source = fs.readFileSync(resolved, 'utf-8')
    } catch (error) {
      console.error(`Error reading XML variable file:`, error)
    }
    for (const m of source.matchAll(/<var\s+name="(?<name>[^"]+)"\s+value="(?<value>[^"]+)"[^>]*>/gi)) {
      if (!(m.groups!.name in variables)) variables[m.groups!.name] = m.groups!.value
    }
  }
  return variables
}

/** `%name%` replaced by the variable's value; a name without a variable is left as it is, as in the page text. */
export function substituteVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/%([\w.-]+)%/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : whole)
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

/**
 * Fill in the variables of a `<Links summary>` tooltip from the page it links
 * to. The sync pipeline copied the summary from that page with its own
 * variables, which the linking page does not define: ktor.io shows
 * "Required dependencies: io.ktor:ktor-server-forwarded-header" where the
 * tooltip showed "io.ktor:%artifact_name%" (P2-32).
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
    if (!summary || !href || !/%[\w.-]+%/.test(summary[1]) || /^[a-z]+:/i.test(href)) return tag
    const target = readPage(linkTarget(relativePath, href))
    if (!target) return tag
    // A value holds no '"' (pageVariables), so the attribute stays well-formed
    return tag.replace(summary[0], () => ` summary="${substituteVariables(summary[1], pageVariables(target))}"`)
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
