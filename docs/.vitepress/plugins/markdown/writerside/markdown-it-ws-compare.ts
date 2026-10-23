import { isWritersideDoc } from '../../../utils/doctype-utils'
import { pageMessage } from '../../../utils/page-messages'

/**
 * Writerside code comparisons:
 *
 *   <compare type="left-right" first-title="2.2.x" second-title="3.0.x">
 *   (two code blocks)
 *   </compare>
 *
 * kotlinlang.org and ktor.io show the two code blocks under their titles,
 * side by side (left-right, the default) or one above the other
 * (top-bottom); without titles they are "Before" and "After". Here the tag
 * was left on the page and the blocks stacked without titles. It is
 * rewritten to markup that styles/ws-compare.css lays out:
 *
 *   <div class="ws-compare ws-compare--left-right">
 *     <div class="ws-compare__item"><div class="ws-compare__title" v-pre>2.2.x</div>(code block)</div>
 *     <div class="ws-compare__item"><div class="ws-compare__title" v-pre>3.0.x</div>(code block)</div>
 *   </div>
 *
 * The default titles are in the page's language (`compare.before`,
 * `compare.after` in locales/*.json). The code blocks are either Markdown
 * fences (an HTML block opening the tag, the fences, an HTML block closing
 * it) or `<code-block>` tags (all in one HTML block). A comparison that does
 * not hold exactly two code blocks is left as it is.
 *
 * Static markup, not a component: Vue merges adjacent static code blocks into
 * one node, so a component could not tell the first block from the second.
 */
const OPEN = /^\s*<compare\b([^>]*)>\s*$/
const CLOSE = /^\s*<\/compare>\s*$/
const WHOLE = /<compare\b([^>]*)>([\s\S]*?)<\/compare>/g
const CODE_BLOCK = /<code-block\b[^>]*?(?:\/>|>[\s\S]*?<\/code-block>)/g
const ATTR = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
const CODE_TOKENS = ['fence', 'code_block']

export default function markdownItWsCompare(md) {
  // The opening tag and each item's start, for the attributes of one <compare>.
  function parts(attrText: string, env) {
    const attrs = Object.fromEntries([...attrText.matchAll(ATTR)].map((m) => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '']))
    const type = attrs.type?.trim().toLowerCase() === 'top-bottom' ? 'top-bottom' : 'left-right'
    const title = (name: string, key: string, fallback: string) =>
      md.utils.escapeHtml(md.utils.unescapeAll(attrs[name] ?? pageMessage(env.relativePath, key) ?? fallback))
    const titles = [title('first-title', 'compare.before', 'Before'), title('second-title', 'compare.after', 'After')]
    return {
      open: `<div class="ws-compare ws-compare--${type}">`,
      item: (k: number) => `<div class="ws-compare__item"><div class="ws-compare__title" v-pre>${titles[k]}</div>`,
    }
  }

  // An HTML block opening the tag, fences, an HTML block closing it.
  function wrapFences(state, start: number, attrText: string): number {
    const tokens = state.tokens
    const level = tokens[start].level
    let end = start + 1
    while (end < tokens.length && !(tokens[end].type === 'html_block' && tokens[end].level === level && CLOSE.test(tokens[end].content))) end++
    const inside = tokens.slice(start + 1, end)
    if (end === tokens.length || inside.length !== 2 || !inside.every((t) => CODE_TOKENS.includes(t.type))) return start

    const { open, item } = parts(attrText, state.env)
    const html = (content: string, near) => {
      const token = new state.Token('html_block', '', 0)
      Object.assign(token, { content, block: true, level: near.level, map: near.map })
      return token
    }
    tokens[start].content = `${open}\n`
    tokens[end].content = '</div>\n'
    // Last item first, so the indices of the earlier ones still hold.
    for (let k = 1; k >= 0; k--) {
      const code = tokens[start + 1 + k]
      tokens.splice(start + 1 + k, 1, html(`${item(k)}\n`, code), code, html('</div>\n', code))
    }
    return end + 4
  }

  md.core.ruler.push('ws_compare', (state) => {
    if (!isWritersideDoc(state.env)) return
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type !== 'html_block' || !token.content.includes('<compare')) continue
      const open = token.content.match(OPEN)
      if (open) {
        i = wrapFences(state, i, open[1])
        continue
      }
      // `<code-block>` tags: the whole comparison is in this HTML block.
      token.content = token.content.replace(WHOLE, (whole, attrText: string, inner: string) => {
        const blocks = inner.match(CODE_BLOCK)
        if (blocks?.length !== 2 || inner.replace(CODE_BLOCK, '').trim()) return whole
        const { open, item } = parts(attrText, state.env)
        return `${open}${blocks.map((block, k) => `${item(k)}${block}</div>`).join('')}</div>`
      })
    }
  })
}
