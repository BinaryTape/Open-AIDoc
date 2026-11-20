import { slugify } from '@mdit-vue/shared'
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

// ws_render_inline renders the content of a <tldr> and the like with the
// page's env: the page is the first source rendered with it.
const DONE = Symbol('ws-show-structure')
// Whether the page's <show-structure for> names "procedure"
const PROCEDURES = Symbol('ws-show-structure-procedures')

/** The first <show-structure> tag in the source, not in a fenced code block */
function showStructure(src: string): string | undefined {
  let fence: string | undefined
  for (const line of src.split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length && !line.slice(line.indexOf(marker) + marker.length).trim()) fence = undefined
    } else if (marker) {
      fence = marker
    } else {
      const tag = /<show-structure\b[^>]*>/.exec(line)?.[0]
      if (tag) return tag
    }
  }
}

export default function markdownItWsShowStructure(md) {
  md.core.ruler.before('normalize', 'ws_show_structure', (state) => {
    const env = state.env
    if (!isWritersideDoc(env) || env[DONE]) return
    env[DONE] = true
    const tag = showStructure(state.src)
    env[PROCEDURES] = !!tag && /\sfor="[^"]*\bprocedure\b/.test(tag)

    const frontmatter = (env.frontmatter ??= {})
    if ('outline' in frontmatter) return
    const depthAttr = tag && /\sdepth="(\d+)"/.exec(tag)?.[1]
    const depth = depthAttr ? Number(depthAttr) : tag ? SITE_DEPTH : DOCS_DEPTH[getDocType(env)!] ?? SITE_DEPTH
    if (depth !== SITE_DEPTH && depth >= 1) frontmatter.outline = [2, Math.min(depth + 1, 6)]
  })

  /**
   * A procedure's title is an h3 on ktor.io (Procedure.vue), in the outline
   * only when <show-structure for> names "procedure": server-create-website
   * lists "Create the initial project with plugins", server-create-a-new-project
   * (for="chapter") does not list "Add a new dependency" (P2-37). The outline
   * takes the headings that have an id: `in-toc` tells Procedure.vue to put
   * the id on the title. A title without an id gets one from its text, as a
   * chapter does.
   */
  md.core.ruler.after('inline', 'ws_procedure_title', (state) => {
    if (!isWritersideDoc(state.env) || !state.src.includes('<procedure')) return
    const inToc = state.env[PROCEDURES]
    // A tag may span lines: <procedure title="…"\n    id="…">
    const rewrite = (content: string) => content.replace(/<procedure\b([^>]*)>/g, (tag: string, attrs: string) => {
      const title = /\stitle="([^"]*)"/.exec(attrs)?.[1]
      if (!title) return tag
      let added = ''
      if (!/\sid=/.test(attrs)) added += ` id="${slugify(md.utils.unescapeAll(title))}"`
      if (inToc && !/\sin-toc\b/.test(attrs)) added += ' in-toc'
      return added ? `<procedure${added}${attrs}>` : tag
    })
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') token.content = rewrite(token.content)
      else if (token.type === 'inline') {
        for (const child of token.children ?? []) {
          if (child.type === 'html_inline') child.content = rewrite(child.content)
        }
      }
    }
  })
}
