import matter from 'gray-matter'
import { DOCS_TYPES } from '../../../docs.config'
import { isMkDocsDoc, isWritersideDoc } from '../../../utils/doctype-utils'
import { getSidebarTitle } from '../../../utils/sidebar-utils'
import { evaluateLiquidConditions } from '../mkdocs/markdown-it-mk-liquid-condition'
import { splitLocalePath } from '../../../../../shared/content-paths'

/**
 * The title MkDocs gives a page with neither a nav title nor an H1, from its
 * file name (Material shows it as the H1): `common/index_schema_sq.md` →
 * "Index schema sq"; an index page is named after its directory, the home
 * page "Home". SQLDelight publishes its include files (common/) this way.
 * @param relativePath - `sqldelight/common/index_schema_sq.md`, `ja/sqldelight/…`
 */
export function mkDocsFileTitle(relativePath: string): string {
  const parts = splitLocalePath(relativePath).contentPath.replace(/\.md$/, '').split('/').slice(1)
  let name = parts.at(-1) ?? ''
  if (name === 'index') {
    if (parts.length < 2) return 'Home'
    name = parts.at(-2)!
  }
  const title = name.replace(/[-_]/g, ' ')
  return title.toLowerCase() === title ? title.charAt(0).toUpperCase() + title.slice(1) : title
}

/**
 * Markdown-it plugin for auto-titling
 * Automatically prepends H1 heading based on frontmatter title or sidebar title
 * Skips Writerside docs (Kotlin, KMP, Ktor) and index pages: a Writerside
 * topic has its own title (a `[//]: # (title: …)` comment, `<topic title>` or
 * a starting page's `<title>`), so another heading would duplicate it.
 */
export default function markdownItAutoTitle(md: any) {
  const originalParse = md.parse

  md.parse = function (src: string, env: any) {
    const parts = env.relativePath.split('/')
    const docType = parts.find((p: string) => DOCS_TYPES.includes(p))

    if (docType === undefined || isWritersideDoc(env)) {
      return originalParse.call(this, src, env)
    }

    // The page as it renders: its Jinja conditions (MkDocs) evaluated with
    // its front matter, as markdown-it-mk-liquid-condition does later. A
    // foreign keys page of SQLDelight has its H1 in an {% else %} branch.
    const parsed = matter(src)
    const rendered = evaluateLiquidConditions(src, parsed.data).text

    const lines = rendered.trim().split(/\r?\n/)
    let hasH1 = false

    // Check if document already has a level-1 heading
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      if (lines[i].trim().startsWith('# ')) {
        hasH1 = true
        break
      }
    }

    // If no H1 heading found, prepend one automatically. The front matter
    // goes, so the conditions are evaluated here, while it is known.
    if (!hasH1) {
      const title = parsed.data?.title || getSidebarTitle(env.relativePath) ||
        (isMkDocsDoc(env) ? mkDocsFileTitle(env.relativePath) : undefined)

      if (title) {
        return originalParse.call(this, `# ${title}\n\n${rendered.replace(/^---[\s\S]*?---\n*/, '')}`, env)
      }
    }

    return originalParse.call(this, src, env)
  }
}
