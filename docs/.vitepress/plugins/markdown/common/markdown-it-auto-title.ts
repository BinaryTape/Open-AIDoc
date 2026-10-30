import matter from 'gray-matter'
import { DOCS_TYPES } from '../../../docs.config'
import { isWritersideDoc } from '../../../utils/doctype-utils'
import { getSidebarTitle } from '../../../utils/sidebar-utils'
import { evaluateLiquidConditions } from '../mkdocs/markdown-it-mk-liquid-condition'

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
      const title = parsed.data?.title || getSidebarTitle(env.relativePath)

      if (title) {
        return originalParse.call(this, `# ${title}\n\n${rendered.replace(/^---[\s\S]*?---\n*/, '')}`, env)
      }
    }

    return originalParse.call(this, src, env)
  }
}
