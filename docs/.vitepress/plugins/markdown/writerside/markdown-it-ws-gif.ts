import fs from 'node:fs'
import path from 'node:path'
import type MarkdownIt from 'markdown-it'
import { getDocType, isWritersideDoc } from '../../../utils/doctype-utils'
import { imageFile, imageSize } from './markdown-it-ws-inline-icon'

/**
 * kotlinlang.org and ktor.io show a GIF still, with a "Gif" button over it,
 * and play it when it is clicked; clicked again, it is still again (P2-46).
 * The still is the image Writerside names in `preview-src`, else the GIF's
 * first frame, drawn in the browser. The GIF has a border, rounded with
 * `border-effect="rounded"`.
 *
 * Each GIF of a page, a Markdown image or an <img>, becomes a <GifPlayer>
 * (component/GifPlayer.vue) with its file's size, so that the page keeps its
 * place before the still is drawn. Its dark version (`data-dark-src`, from
 * markdown-it-ws-dark-image) goes to the player, which shows it in dark mode:
 * left on the <img>, theme/dark-images.ts would play it there.
 */
const GIF_RE = /\.gif(?:[?#].*)?$/i
const IMG_RE = /<img\b[^>]*>/gi
const ATTR_RE = /\s([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+))/g

type Attrs = Record<string, string | undefined>

/** The still named in preview-src, next to the GIF, when the site has it. */
function previewOf(src: string, preview: string | undefined, env: any): string | undefined {
  if (!preview) return undefined
  const still = src.replace(/[^/]*$/, '') + path.posix.basename(preview)
  const file = imageFile(still, env)
  return file && fs.existsSync(file) ? still : undefined
}

function player(attrs: Attrs, env: any, escape: (s: string) => string): string | null {
  const src = attrs.src
  if (!src || !GIF_RE.test(src)) return null
  const file = imageFile(src, env)
  const size = file ? imageSize(file) : undefined
  const props: [string, string | number | undefined][] = [
    ['src', src],
    ['preview', previewOf(src, attrs['preview-src'], env)],
    ['dark-src', attrs['data-dark-src']],
    ['alt', attrs.alt],
    ['width', attrs.width],
    ['natural-width', size?.[0]],
    ['natural-height', size?.[1]],
    ['site', getDocType(env) ?? undefined],
  ]
  const rounded = attrs['border-effect'] === 'rounded' ? ' rounded' : ''
  const text = props.filter(([, value]) => value !== undefined && value !== '').map(([name, value]) => ` ${name}="${escape(String(value))}"`).join('')
  return `<GifPlayer${text}${rounded}/>`
}

function markHtml(html: string, env: any, escape: (s: string) => string): string {
  return html.replace(IMG_RE, (tag) => {
    const attrs: Attrs = {}
    for (const [, name, double, single, bare] of tag.matchAll(ATTR_RE)) attrs[name.toLowerCase()] ??= double ?? single ?? bare
    return player(attrs, env, escape) ?? tag
  })
}

export default function markdownItWsGif(md: MarkdownIt) {
  const escape = md.utils.escapeHtml
  md.core.ruler.push('ws_gif', (state) => {
    const env = state.env
    if (!isWritersideDoc(env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        token.content = markHtml(token.content, env, escape)
      }
      const children = token.children ?? []
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.type === 'html_inline') {
          child.content = markHtml(child.content, env, escape)
        } else if (child.type === 'image') {
          const attrs: Attrs = Object.fromEntries(child.attrs ?? [])
          attrs.alt = md.renderer.renderInlineAsText(child.children ?? [], md.options, env)
          const html = player(attrs, env, escape)
          if (html === null) continue
          const replacement = new state.Token('html_inline', '', 0)
          replacement.content = html
          children[i] = replacement
        }
      }
    }
  })
}
