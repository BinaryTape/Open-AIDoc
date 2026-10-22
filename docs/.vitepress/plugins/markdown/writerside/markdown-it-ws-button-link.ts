import { isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * Writerside button links:
 *
 *   <a href="kotlin-tour-collections.md" as="button" mode="classic" icon="arrow-right" icon-position="right">Next step</a>
 *
 * kotlinlang.org draws these as Rescui buttons; here the attributes were left
 * on a plain link. The opening tag is rewritten to classes that
 * styles/ws-button.css draws:
 *
 *   <a href="/kotlin/kotlin-tour-collections" class="ws-button ws-button--classic ws-button--arrow-right ws-button--icon-right no-icon">
 *
 * Without a mode the button is a rock one, as on kotlinlang.org. An icon the
 * stylesheet has no picture for is dropped, the button stays. Other
 * attributes (href, id, progress-aware) are kept as written.
 *
 * Runs after the link rewriters, on HTML blocks and on inline HTML, so the
 * href is already the site's.
 */
const MODES = ['classic', 'rock', 'outline']
const ICONS = ['arrow-left', 'arrow-right', 'download']
const BUTTON_ATTRS = ['as', 'mode', 'icon', 'icon-position']

const BUTTON_LINK = /<a(?=\s)(?=[^>]*\sas\s*=\s*["']?button\b)[^>]*>/gi
const ATTR = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

export default function markdownItWsButtonLink(md) {
  md.core.ruler.push('ws_button_link', (state) => {
    if (!isWritersideDoc(state.env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        token.content = rewriteButtonLinks(token.content)
      } else if (token.type === 'inline' && token.children) {
        for (const child of token.children) {
          if (child.type === 'html_inline') child.content = rewriteButtonLinks(child.content)
        }
      }
    }
  })
}

export function rewriteButtonLinks(html: string): string {
  return html.replace(BUTTON_LINK, buttonLinkTag)
}

function buttonLinkTag(tag: string): string {
  const inner = tag.slice(2, tag.endsWith('/>') ? -2 : -1)
  const attrs = [...inner.matchAll(ATTR)].map((m) => ({
    name: m[1].toLowerCase(),
    value: m[2] ?? m[3] ?? m[4] ?? '',
    source: m[0],
  }))
  const value = (name: string) => attrs.find((a) => a.name === name)?.value.trim() ?? ''
  if (value('as').toLowerCase() !== 'button') return tag

  const mode = value('mode').toLowerCase()
  const classes = ['ws-button', `ws-button--${MODES.includes(mode) ? mode : 'rock'}`]
  const icon = value('icon').toLowerCase()
  if (ICONS.includes(icon)) {
    const position = value('icon-position').toLowerCase() === 'right' ? 'right' : 'left'
    classes.push(`ws-button--${icon}`, `ws-button--icon-${position}`)
  }
  // VitePress's opt-out from its external-link arrow, which would take over
  // the icon's ::after; kotlinlang.org shows no such arrow on buttons either.
  classes.push('no-icon')
  if (value('class')) classes.push(...value('class').split(/\s+/))

  const kept = attrs
    .filter((a) => !BUTTON_ATTRS.includes(a.name) && a.name !== 'class')
    .map((a) => a.source)
  return `<a ${[...kept, `class="${classes.join(' ')}"`].join(' ')}>`
}
