import type MarkdownIt from 'markdown-it'
import { isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * kotlinlang.org and ktor.io nest a Markdown heading one level below the
 * nearest heading above it written shallower, whatever level it is written
 * at (P2-39):
 *
 *   [//]: # (title: FAQ)     h1
 *   ### What is Kotlin?      h2, not h3
 *   ### Is Kotlin free?      h2
 *   ## Next steps            h2
 *   #### Read more           h3
 *
 * Checked against the pages of those sites with as many headings as ours: the
 * 21 pages that skip a level (96 headings) all match, and no other changes.
 *
 * Before the rules that read a heading's level after `inline`: the title with
 * a label (ws_topic_title), the level a chapter starts from (ws_chapter_level)
 * and the collapsible sections.
 */
export default function markdownItWsHeadingLevel(md: MarkdownIt) {
  md.core.ruler.after('block', 'ws_heading_level', (state) => {
    if (!isWritersideDoc(state.env)) return
    // The page title is the h1 above every heading, whether or not it is a token here.
    const open = [{ written: 1, level: 1 }]
    let level = 0
    for (const token of state.tokens) {
      if (token.type === 'heading_open') {
        const written = Number(token.tag.slice(1))
        while (open.length && open[open.length - 1].written >= written) open.pop()
        level = (open.length ? open[open.length - 1].level : 0) + 1
        open.push({ written, level })
        token.tag = `h${level}`
      } else if (token.type === 'heading_close') {
        token.tag = `h${level}`
      }
    }
  })
}
