import { isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * Writerside collapsible sections:
 *
 *   ### Earlier KGP versions {initial-collapse-state="collapsed" collapsible="true" id="earlier-kgp-versions"}
 *
 * kotlinlang.org folds such a heading's section (up to the next heading of
 * the same or a higher level) under the heading, with a ⊕ to open it. Here
 * the attributes ended up on the <h3> and the section stayed open. The
 * section is wrapped in a <details> whose summary is the heading itself, so
 * the heading keeps its id and stays in the page outline:
 *
 *   <details class="ws-collapse"><summary class="ws-collapse__summary">
 *   <h3 id="earlier-kgp-versions" tabindex="-1">Earlier KGP versions …</h3>
 *   </summary>
 *   …the section…
 *   </details>
 *
 * Open unless the initial state is collapsed (`default-state` is the older
 * name). Sections nest; one also ends where the block holding its heading
 * ends (a list item, a blockquote). theme/open-anchor-target.ts opens the
 * sections around a link's target; styles/ws-collapse-section.css draws them.
 */
const STATE_ATTRS = ['collapsible', 'initial-collapse-state', 'default-state']

interface Section { depth: number; rank: number }

export default function markdownItWsCollapsibleSection(md) {
  md.core.ruler.push('ws_collapsible_section', (state) => {
    if (!isWritersideDoc(state.env)) return
    const html = (content: string, near) => {
      const token = new state.Token('html_block', '', 0)
      Object.assign(token, { content, block: true, level: near.level, map: near.map })
      return token
    }

    const out = []
    const open: Section[] = []
    const close = (until: (s: Section) => boolean, near) => {
      while (open.length && until(open[open.length - 1])) {
        open.pop()
        out.push(html('</details>\n', near))
      }
    }

    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      // Leaving the block that holds a section's heading ends the section.
      close((s) => token.level < s.depth, token)

      if (token.type !== 'heading_open') {
        out.push(token)
        continue
      }
      const rank = Number(token.tag.slice(1))
      // A heading ends the sections of the same or a lower rank at its depth.
      close((s) => s.depth === token.level && s.rank >= rank, token)

      if (token.attrGet('collapsible') !== 'true') {
        out.push(token)
        continue
      }
      const collapsed = (token.attrGet('initial-collapse-state') ?? token.attrGet('default-state')) === 'collapsed'
      token.attrs = token.attrs.filter(([name]) => !STATE_ATTRS.includes(name))
      // The heading, its inline content and its closing tag go in the summary.
      out.push(
        html(`<details class="ws-collapse"${collapsed ? '' : ' open'}><summary class="ws-collapse__summary">\n`, token),
        token, tokens[i + 1], tokens[i + 2],
        html('</summary>\n', token),
      )
      i += 2
      open.push({ depth: token.level, rank })
    }
    close(() => true, tokens[tokens.length - 1] ?? { level: 0, map: null })
    state.tokens = out
  })
}
