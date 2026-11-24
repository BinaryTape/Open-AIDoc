import fs from 'node:fs'
import type MarkdownIt from 'markdown-it'
import { isWritersideDoc } from '../../../utils/doctype-utils'
import { imageFile } from './markdown-it-ws-inline-icon'

/**
 * Writerside shows the dark version of an image in dark mode: the file of the
 * same name with `_dark` before the extension, such as
 * intellij_idea_rerun_icon_dark.svg next to intellij_idea_rerun_icon.svg.
 * ktor.io names it in `data-dark-src` on every image that has one (in
 * `data-dark-gif-src` on a GIF), and a script shows it in dark mode (P2-43).
 * Checked against the 671 Kotlin, Ktor and KMP pages found on those sites: the
 * same 111 images on 12 pages have a dark version, none more, none fewer.
 *
 * theme/dark-images.ts swaps the src in dark mode.
 */
const darkSources = new Map<string, boolean>()

function darkSrc(src: string | undefined, env: any): string | undefined {
  const dark = src?.replace(/(\.[a-z]+)([?#].*)?$/i, '_dark$1$2')
  if (!dark || dark === src) return undefined
  const file = imageFile(dark, env)
  if (!file) return undefined
  if (!darkSources.has(file)) darkSources.set(file, fs.existsSync(file))
  return darkSources.get(file) ? dark : undefined
}

const IMG_RE = /<img\b[^>]*>/gi
const SRC_RE = /(\ssrc\s*=\s*)(?:"([^"]*)"|'([^']*)')/i

function markHtml(html: string, env: any): string {
  return html.replace(IMG_RE, (tag) => {
    if (/\sdata-dark-src\s*=/i.test(tag)) return tag
    const match = SRC_RE.exec(tag)
    const dark = match && darkSrc(match[2] ?? match[3], env)
    if (!dark) return tag
    const end = match.index + match[0].length
    return `${tag.slice(0, end)} data-dark-src="${dark}"${tag.slice(end)}`
  })
}

export default function markdownItWsDarkImage(md: MarkdownIt) {
  md.core.ruler.push('ws_dark_image', (state) => {
    const env = state.env
    if (!isWritersideDoc(env)) return
    for (const token of state.tokens) {
      if (token.type === 'html_block' || token.type === 'html_inline') {
        token.content = markHtml(token.content, env)
      }
      for (const child of token.children ?? []) {
        if (child.type === 'html_inline') {
          child.content = markHtml(child.content, env)
        } else if (child.type === 'image' && !child.attrGet('data-dark-src')) {
          const dark = darkSrc(child.attrGet('src') ?? undefined, env)
          if (dark) child.attrSet('data-dark-src', dark)
        }
      }
    }
  })
}
