import { codeBlockAttrs } from '../../../utils/code-block-attrs'

/**
 * Writerside collapsible code blocks:
 *
 *   ```kotlin
 *   …
 *   ```
 *   {collapsible="true" initial-collapse-state="collapsed" collapsed-title="Example solution"}
 *
 * render as a <details> around the code block, closed when the initial state
 * is collapsed (`default-state` is the older name). Its summary is what
 * kotlinlang.org shows on the collapsed block: the collapsed title, or else
 * line `collapsed-title-line-number` of the code, or else its first line,
 * followed by " {...}". An `id` goes on the <details>, for links to it.
 */
export default function markdownItWsCollapsibleCode(md) {
  const renderFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const html = renderFence(tokens, idx, options, env, self)
    const attrs = codeBlockAttrs(tokens[idx])
    if (attrs.collapsible !== 'true') return html

    const collapsed = (attrs['initial-collapse-state'] ?? attrs['default-state']) === 'collapsed'
    const id = attrs.id ? ` id="${md.utils.escapeHtml(attrs.id)}"` : ''
    // v-pre: the summary is code-like text, `{{` in it is not a Vue interpolation.
    return `<details class="ws-code-collapse"${id}${collapsed ? '' : ' open'}>` +
      `<summary class="ws-code-collapse__summary" v-pre>${md.utils.escapeHtml(synopsis(tokens[idx].content, attrs))}</summary>` +
      `${html}</details>\n`
  }
}

/** The text of the collapsed block. */
export function synopsis(code: string, attrs: Record<string, string>): string {
  const title = attrs['collapsed-title']?.trim()
  if (title) return `${title} {...}`

  const lines = code.split('\n')
  const lineNumber = Number(attrs['collapsed-title-line-number'])
  const line = Number.isInteger(lineNumber) && lineNumber >= 1 && lines[lineNumber - 1]?.trim()
    ? lines[lineNumber - 1]
    : lines.find((l) => l.trim()) ?? ''
  return `${line.trim()} {...}`
}
