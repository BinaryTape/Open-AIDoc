import type MarkdownIt from 'markdown-it'
import { getDocType, isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * kotlinlang.org and ktor.io draw a 1px border round an image written
 * `border-effect="line"`, and round its corners with "rounded" (P2-50); the
 * attribute did nothing on our pages. styles/ws-image-border.css has the
 * measured border.
 *
 * kotlinlang.org counts the border in the image's width, ktor.io adds it
 * outside: a 400px Ktor image is 402px wide there. Both sites' stylesheet
 * rounds an image 9px; ktor.io's script then gives a rounded image a radius of
 * its own, 10 to 12px, from the width it is first shown at (9px again on a
 * phone, and on its GIFs). We keep the stylesheet's 9px.
 *
 * The attribute, which is not HTML, becomes classes on the <img>, of a Markdown
 * image or of HTML. A GIF is a <GifPlayer> by now (markdown-it-ws-gif), which
 * has its own border.
 */
const IMG_RE = /<img\b[^>]*>/gi
const EFFECT_RE = /\sborder-effect\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+))/i
const CLASS_RE = /(\sclass\s*=\s*)(?:"([^"]*)"|'([^']*)')/i

function borderClasses(effect: string | null | undefined, env: any): string | undefined {
  if (effect !== 'line' && effect !== 'rounded') return undefined
  const classes = ['ws-bordered']
  if (effect === 'rounded') classes.push('ws-bordered--rounded')
  if (getDocType(env) === 'ktor') classes.push('ws-bordered--outside')
  return classes.join(' ')
}

function markHtml(html: string, env: any): string {
  return html.replace(IMG_RE, (tag) => {
    const effect = EFFECT_RE.exec(tag)
    const added = effect && borderClasses(effect[1] ?? effect[2] ?? effect[3], env)
    if (!added) return tag
    const rest = tag.slice(0, effect.index) + tag.slice(effect.index + effect[0].length)
    return CLASS_RE.test(rest)
      ? rest.replace(CLASS_RE, (_, before, double, single) => `${before}"${`${double ?? single} ${added}`.trim()}"`)
      : rest.replace(/^<img\b/i, `<img class="${added}"`)
  })
}

export default function markdownItWsImageBorder(md: MarkdownIt) {
  md.core.ruler.push('ws_image_border', (state) => {
    const env = state.env
    if (!isWritersideDoc(env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        token.content = markHtml(token.content, env)
      }
      for (const child of token.children ?? []) {
        if (child.type === 'html_inline') {
          child.content = markHtml(child.content, env)
        } else if (child.type === 'image') {
          const added = borderClasses(child.attrGet('border-effect'), env)
          if (!added) continue
          child.attrs = child.attrs!.filter(([name]) => name !== 'border-effect')
          child.attrJoin('class', added)
        }
      }
    }
  })
}
