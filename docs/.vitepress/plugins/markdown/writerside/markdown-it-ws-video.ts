import fs from 'node:fs'
import type MarkdownIt from 'markdown-it'
import { getDocType, isWritersideDoc } from '../../../utils/doctype-utils'
import { youtubeId } from '../../../utils/video'
import { imageFile, imageSize } from './markdown-it-ws-inline-icon'

/**
 * Writerside writes a video as `<video src="…" width="700" title="…"/>`, a
 * YouTube address or a file of the docs with its cover in `preview-src`.
 * kotlinlang.org shows its cover with a play button and loads the video once
 * it is clicked (P1-12).
 *
 * Each video becomes a <YouTubeVideo> (component/YouTubeVideo.vue) with what
 * it needs: the YouTube id, or the file's address on the site with its
 * cover's and the cover's size, which gives the video its height. A relative
 * path is the doc's (`/kmp/…`): left relative, it would be looked up under
 * the locale on translated pages, where there is no such file.
 */
const VIDEO_RE = /<video\b((?:[^>"']|"[^"]*"|'[^']*')*?)\s*(?:\/>|>\s*<\/video\s*>)/gi
const ATTR_RE = /\s([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>/]+))/g

type Attrs = Record<string, string | undefined>

const isRemote = (src: string) => /^(?:[a-z]+:|\/\/)/i.test(src)

/** Where the site serves a file the page names. */
function siteUrl(src: string, env: any): string {
  return isRemote(src) || src.startsWith('/') ? src : `/${getDocType(env)}/${src}`
}

function player(attrs: Attrs, env: any, escape: (s: string) => string): string {
  const id = youtubeId(attrs.src)
  const props: [string, string | number | undefined][] = [['title', attrs.title ?? attrs.alt], ['width', attrs.width]]
  if (id) {
    props.unshift(['youtube', id])
  } else {
    const cover = attrs['preview-src']
    const file = cover ? imageFile(cover, env) : undefined
    const size = file && fs.existsSync(file) ? imageSize(file) : undefined
    props.unshift(
      ['src', attrs.src && siteUrl(attrs.src, env)],
      ['poster', cover && (size || isRemote(cover)) ? siteUrl(cover, env) : undefined],
    )
    props.push(['natural-width', size?.[0]], ['natural-height', size?.[1]])
  }
  const text = props.filter(([, value]) => value !== undefined && value !== '').map(([name, value]) => ` ${name}="${escape(String(value))}"`).join('')
  return `<YouTubeVideo${text}/>`
}

function markHtml(html: string, env: any, escape: (s: string) => string): string {
  return html.replace(VIDEO_RE, (_, body: string) => {
    const attrs: Attrs = {}
    for (const [, name, double, single, bare] of ` ${body}`.matchAll(ATTR_RE)) attrs[name.toLowerCase()] ??= double ?? single ?? bare
    return player(attrs, env, escape)
  })
}

export default function markdownItWsVideo(md: MarkdownIt) {
  const escape = md.utils.escapeHtml
  md.core.ruler.push('ws_video', (state) => {
    const env = state.env
    if (!isWritersideDoc(env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') token.content = markHtml(token.content, env, escape)
      for (const child of token.children ?? []) {
        if (child.type === 'html_inline') child.content = markHtml(child.content, env, escape)
      }
    }
  })
}
