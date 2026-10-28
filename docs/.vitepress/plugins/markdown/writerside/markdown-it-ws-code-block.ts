import type { CodeBlockAttrs } from '../../../utils/code-block-attrs'

/**
 * Writerside `<code-block>` tags, highlighted at build time:
 *
 *   <code-block lang="kotlin" code="fun main() {&#10;}"/>
 *
 * (markdown-it-ws-codeblock-cdata turns the `<code-block>…</code-block>`
 * form into this one). The tags were left on the page for a component that
 * highlighted them in the browser, after Shiki and its grammars had loaded:
 * the code showed seconds late, and the server HTML had empty boxes.
 *
 * Each tag is replaced by what a Markdown fence with the same code renders
 * to, through the site's fence renderer: the same highlighting, copy button
 * and language label, and the Writerside attributes (`collapsible`, …) as on
 * a fence (`token.meta.wsAttrs`, see utils/code-block-attrs.ts).
 *
 * The tags sit inside larger HTML blocks (definition lists, procedures, tabs,
 * a table cell), so they are replaced in the rendered HTML of their block,
 * not as tokens: the rest of the block renders as before. VitePress
 * highlights asynchronously, filling in placeholders anywhere in the page
 * once it is rendered, so a fence rendered here is highlighted too.
 *
 * Registered after the other HTML block renderers, so that they see the tag
 * and not the code block.
 */
const CODE_BLOCK = /<code-block\b((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*\/>/g
const ATTR = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g

export default function markdownItWsCodeBlock(md) {
  for (const rule of ['html_block', 'html_inline']) {
    const render = md.renderer.rules[rule]
    md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
      const html = render(tokens, idx, options, env, self)
      if (!html.includes('<code-block')) return html
      return html.replace(CODE_BLOCK, (_tag, attrText: string) => renderCodeBlock(md, attrText, options, env, self))
    }
  }
}

function renderCodeBlock(md, attrText: string, options, env, self): string {
  const { code = '', lang = '', ...wsAttrs } = codeBlockTagAttrs(md, attrText)
  const Token = md.core.State.prototype.Token
  const fence = new Token('fence', 'code', 0)
  fence.markup = '```'
  fence.info = lang.trim().toLowerCase()
  fence.content = `${normalizeCode(code)}\n`
  fence.block = true
  fence.meta = { wsAttrs: wsAttrs as CodeBlockAttrs }
  return self.rules.fence([fence], 0, options, env, self)
}

/** The attributes of a `<code-block>` tag, with entities decoded. */
export function codeBlockTagAttrs(md, attrText: string): Record<string, string> {
  const decode = (value: string) => value.replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, (entity) => md.utils.unescapeAll(entity))
  return Object.fromEntries([...attrText.matchAll(ATTR)].map(([, name, double, single]) => [name, decode(double ?? single ?? '')]))
}

/** Without the blank lines around it, and indented as little as it can be. */
export function normalizeCode(code: string): string {
  const lines = code.replace(/^(?:[ \t]*\n)+/, '').replace(/(?:\n[ \t]*)+$/, '').split('\n')
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length))
  return Number.isFinite(indent) && indent > 0 ? lines.map((l) => l.slice(indent)).join('\n') : lines.join('\n')
}
