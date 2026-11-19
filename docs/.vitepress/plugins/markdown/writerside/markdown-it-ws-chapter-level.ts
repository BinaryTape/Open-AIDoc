import { slugify } from '@mdit-vue/shared'
import { isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * Writerside chapters on a Markdown page:
 *
 *   ### In code
 *   <chapter title="Netty"> … </chapter>
 *
 * A chapter heads a section one level below the Markdown heading it follows:
 * ktor.io's server-engines has "In code" as an h3 and its chapters Netty,
 * Jetty, CIO and Tomcat as h4. Chapter.vue counts chapters only, so they
 * were h2s, larger than the heading above them; a chapter written without
 * an id had a "#undefined" anchor (client-dependencies' "Using the Ktor BOM
 * dependency", which ktor.io gives an id of its own) (P2-20).
 *
 * A chapter outside any other chapter gets the level of the Markdown heading
 * before it (`base-level`), and one without an id an id from its title;
 * chapters inside it go on from its level (Chapter.vue).
 */
export default function markdownItWsChapterLevel(md) {
  // After `inline`: a chapter tag inside a paragraph is an html_inline child by then
  md.core.ruler.after('inline', 'ws_chapter_level', (state) => {
    if (!isWritersideDoc(state.env) || !state.src.includes('<chapter')) return
    let depth = 0
    let headingLevel = 0

    const rewrite = (content: string) => content.replace(/<chapter\b([^>]*)>|<\/chapter\s*>/g, (tag: string, attrs?: string) => {
      if (attrs === undefined) {
        depth = Math.max(0, depth - 1)
        return tag
      }
      let added = ''
      if (depth === 0 && headingLevel > 0 && !/\sbase-level=/.test(attrs)) added += ` base-level="${headingLevel}"`
      const title = attrs.match(/\stitle="([^"]*)"/)?.[1]
      if (!/\sid=/.test(attrs) && title) added += ` id="${slugify(md.utils.unescapeAll(title))}"`
      if (!/\/\s*$/.test(attrs)) depth++
      return added ? `<chapter${added}${attrs}>` : tag
    })

    for (const token of state.tokens) {
      // The page title (h1) is above every chapter anyway
      if (token.type === 'heading_open' && depth === 0 && token.tag !== 'h1') headingLevel = Number(token.tag.slice(1))
      else if (token.type === 'html_block' && token.content.includes('chapter')) token.content = rewrite(token.content)
      else if (token.type === 'inline' && token.children) {
        for (const child of token.children) {
          if (child.type === 'html_inline' && child.content.includes('chapter')) child.content = rewrite(child.content)
        }
      }
    }
  })
}
