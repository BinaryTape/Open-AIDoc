import type MarkdownIt from 'markdown-it'
import { isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * kotlinlang.org and ktor.io show an image in the box its width and height
 * attributes give: Ktor's Gradle icon, a 16×16 file written width="16"
 * height="26", is 16×26 there, the icon in the middle of the box (P2-44).
 *
 * VitePress gives every img `height: auto`, so the browser shows the file's
 * proportions instead. That rule is in VitePress's cascade layer: a
 * `height: revert-layer` in ours only rolls back to it. Give an image with both
 * attributes the aspect ratio they make: the width then sets its height, which
 * still scales down with the width in a narrow column.
 */
const NUMBER_RE = /^\d+(?:\.\d+)?$/

function aspectRatio(width: string | null | undefined, height: string | null | undefined): string | undefined {
  if (!width || !height || !NUMBER_RE.test(width) || !NUMBER_RE.test(height)) return undefined
  if (!parseFloat(width) || !parseFloat(height)) return undefined
  return `aspect-ratio: ${width} / ${height}`
}

// Writerside's style="inline" or "block" is not CSS: Vue drops it from the style.
function withRatio(style: string | null | undefined, ratio: string): string {
  const rest = style?.trim().replace(/;$/, '')
  return rest ? `${rest}; ${ratio}` : ratio
}

const IMG_RE = /<img\b[^>]*>/gi
const ATTR_RE = /\s([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
const STYLE_RE = /(\sstyle\s*=\s*)(?:"([^"]*)"|'([^']*)')/i

function markHtml(html: string): string {
  return html.replace(IMG_RE, (tag) => {
    const attrs: Record<string, string> = {}
    for (const [, name, double, single] of tag.matchAll(ATTR_RE)) attrs[name.toLowerCase()] ??= double ?? single
    const ratio = aspectRatio(attrs.width, attrs.height)
    if (!ratio || attrs.style?.includes('aspect-ratio')) return tag
    return attrs.style === undefined
      ? tag.replace(/\s*\/?>$/, (end) => ` style="${ratio}"${end}`)
      : tag.replace(STYLE_RE, (_, before) => `${before}"${withRatio(attrs.style, ratio)}"`)
  })
}

export default function markdownItWsImageRatio(md: MarkdownIt) {
  md.core.ruler.push('ws_image_ratio', (state) => {
    if (!isWritersideDoc(state.env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        token.content = markHtml(token.content)
      }
      for (const child of token.children ?? []) {
        if (child.type === 'html_inline') {
          child.content = markHtml(child.content)
        } else if (child.type === 'image') {
          const ratio = aspectRatio(child.attrGet('width'), child.attrGet('height'))
          const style = child.attrGet('style')
          if (ratio && !style?.includes('aspect-ratio')) child.attrSet('style', withRatio(style, ratio))
        }
      }
    }
  })
}
