import { getDocType, isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * The depth of a Writerside page's outline (P2-36). On kotlinlang.org and
 * ktor.io the outline beside a page shows its h2s down to h(depth + 1):
 *
 *   <show-structure for="chapter" depth="3"/>   h2 to h4 (ktor.io server-engines)
 *   <show-structure for="chapter"/>             depth 2: h2 and h3
 *   no <show-structure>                         the depth of the docs
 *
 * Kotlin and KMP set a depth of 2 for their docs in writerside.cfg
 * (`<default-property element-name="chapter" property-name="show-structure-depth" value="2"/>`);
 * Ktor sets none and gets Writerside's 1, only h2s. Checked against the
 * outline data (`virtual-toc-data`) of the 669 pages on both sites.
 *
 * Depth 2 is the outline of the site ([2, 3] in config.mts), so only other
 * depths go into the page's frontmatter, unless the page sets an outline.
 */
const DOCS_DEPTH: Record<string, number> = { ktor: 1 }
const SITE_DEPTH = 2

export default function markdownItWsShowStructure(md) {
  md.core.ruler.push('ws_show_structure', (state) => {
    if (!isWritersideDoc(state.env)) return
    const frontmatter = (state.env.frontmatter ??= {})
    if ('outline' in frontmatter) return

    // The first <show-structure> in the page's HTML, not in a code sample.
    // One on a line of its own is a top-level html_inline (VitePress's
    // component rule), one inside a paragraph an html_inline child.
    let tag: string | undefined
    for (const token of state.tokens) {
      const html = token.type === 'html_block' || token.type === 'html_inline' ? [token.content]
        : token.type === 'inline' ? (token.children ?? []).filter((t) => t.type === 'html_inline').map((t) => t.content)
          : []
      tag = html.map((s) => /<show-structure\b[^>]*>/.exec(s)?.[0]).find(Boolean)
      if (tag) break
    }

    const depthAttr = tag && /\sdepth="(\d+)"/.exec(tag)?.[1]
    const depth = depthAttr ? Number(depthAttr) : tag ? SITE_DEPTH : DOCS_DEPTH[getDocType(state.env)!] ?? SITE_DEPTH
    if (depth !== SITE_DEPTH && depth >= 1) frontmatter.outline = [2, Math.min(depth + 1, 6)]
  })
}
