import fs from 'node:fs'
import path from 'node:path'
import type MarkdownIt from 'markdown-it'
import { getDocType, isWritersideDoc } from '../../../utils/doctype-utils'

/**
 * Writerside shows a small image in the line of text, such as a toolbar
 * button in "click the rerun button (icon) to restart". kotlinlang.org and
 * ktor.io tell such an icon from a picture by its displayed height, not by
 * where it sits (P2-42):
 *
 *   - style="inline" or type="joined": in the line;
 *   - style="block": a block of its own;
 *   - any other image: in the line when it is at most 32px high. The height
 *     is the height attribute, else the file's height scaled to the width
 *     attribute, else the file's height.
 *
 * Checked against the 781 images of the zh pages found on those sites. A
 * picture 23px high stays in the line even alone in a paragraph, and a large
 * screenshot is a block even right after the text of a list item.
 *
 * VitePress shows every image as a block with 16px margins. Give each image in
 * the line a class, which style.css shows inline, as those sites do.
 */
export const INLINE_ICON_CLASS = 'ws-inline-icon'
const MAX_HEIGHT = 32

interface ImageAttrs {
  src?: string
  width?: string
  height?: string
  style?: string
  type?: string
}

export function isInlineIcon(attrs: ImageAttrs, size?: [number, number]): boolean {
  if (attrs.style === 'inline') return true
  if (attrs.style === 'block') return false
  if (attrs.type === 'joined') return true
  const height = displayedHeight(attrs, size)
  return height !== undefined && height <= MAX_HEIGHT
}

function displayedHeight(attrs: ImageAttrs, size?: [number, number]): number | undefined {
  const height = parseFloat(attrs.height ?? '')
  if (height >= 0) return height
  if (!size) return undefined
  const width = parseFloat(attrs.width ?? '')
  return width >= 0 ? size[1] * width / size[0] : size[1]
}

const sizes = new Map<string, [number, number] | undefined>()

/** Width and height of a PNG, GIF, JPEG or SVG file, the formats the Writerside pages use. */
export function imageSize(file: string): [number, number] | undefined {
  if (!sizes.has(file)) sizes.set(file, readSize(file))
  return sizes.get(file)
}

function readSize(file: string): [number, number] | undefined {
  let b: Buffer
  try {
    b = fs.readFileSync(file)
  } catch {
    return undefined
  }
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)]
  if (b.length >= 10 && b.toString('latin1', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)]
  if (b[0] === 0xff && b[1] === 0xd8) {
    // The frame header (SOFn, not DHT/JPG/DAC) holds the size, after other segments.
    for (let i = 2; i + 9 <= b.length; i += 2 + b.readUInt16BE(i + 2)) {
      const marker = b[i + 1]
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]
      }
    }
    return undefined
  }
  const svg = /<svg\b[^>]*>/.exec(b.toString('utf8', 0, 4000))?.[0]
  if (!svg) return undefined
  const length = (name: string) => {
    const value = new RegExp(`\\s${name}\\s*=\\s*["']([0-9.]+)(?:px)?["']`).exec(svg)?.[1]
    return value === undefined ? undefined : parseFloat(value)
  }
  const viewBox = /\sviewBox\s*=\s*["']([^"']+)["']/.exec(svg)?.[1].trim().split(/[\s,]+/).map(Number)
  const width = length('width') ?? viewBox?.[2]
  const height = length('height') ?? viewBox?.[3]
  return width !== undefined && height !== undefined ? [width, height] : undefined
}

/** The file of an image on the site: /ktor/icon.svg is docs/public/ktor/icon.svg. */
export function imageFile(src: string | undefined, env: any): string | undefined {
  if (!src || /^(?:[a-z]+:|\/\/)/i.test(src)) return undefined
  const srcDir = env.path ? env.path.slice(0, -env.relativePath.length) : path.resolve('docs')
  const file = decodeURI(src.replace(/[?#].*$/, ''))
  return path.join(srcDir, 'public', file.startsWith('/') ? file : `${getDocType(env)}/${file}`)
}

function inline(attrs: ImageAttrs, env: any): boolean {
  const file = imageFile(attrs.src, env)
  return isInlineIcon(attrs, file ? imageSize(file) : undefined)
}

const IMG_RE = /<img\b[^>]*>/gi
const ATTR_RE = /\s([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

function markHtml(html: string, env: any): string {
  return html.replace(IMG_RE, (tag) => {
    const attrs: Record<string, string> = {}
    for (const [, name, double, single] of tag.matchAll(ATTR_RE)) attrs[name.toLowerCase()] ??= double ?? single
    if (attrs.class?.split(/\s+/).includes(INLINE_ICON_CLASS) || !inline(attrs, env)) return tag
    return attrs.class === undefined
      ? tag.replace(/^<img\b/i, `<img class="${INLINE_ICON_CLASS}"`)
      : tag.replace(/(\sclass\s*=\s*["'])/i, `$1${INLINE_ICON_CLASS} `)
  })
}

export default function markdownItWsInlineIcon(md: MarkdownIt) {
  md.core.ruler.push('ws_inline_icon', (state) => {
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
          const attrs = Object.fromEntries(child.attrs ?? []) as ImageAttrs & { class?: string }
          if (!attrs.class?.split(/\s+/).includes(INLINE_ICON_CLASS) && inline(attrs, env)) {
            child.attrJoin('class', INLINE_ICON_CLASS)
          }
        }
      }
    }
  })
}
