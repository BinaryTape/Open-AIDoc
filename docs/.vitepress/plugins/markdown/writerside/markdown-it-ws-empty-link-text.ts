import { slugify } from '@mdit-vue/shared'
import { isWritersideDoc } from '../../../utils/doctype-utils'
import { targetSource } from '../common/markdown-it-explicit-hash'

/**
 * Fills the text of a Writerside link written without one, as Writerside does:
 * `[](#guard-conditions)` shows the title of that heading, `[](typecasts.md)`
 * the title of that page, `[](typecasts.md#smart-casts)` the heading there.
 *
 * The title is read from the target page in the same language, so the link
 * shows the translated title. A target that has no such page or heading keeps
 * its address as the text, and is reported.
 *
 * Runs right after `inline`, before the link rewriter adds the locale and doc
 * prefix, so hrefs are still those of the source.
 */
export default function markdownItWsEmptyLinkText(md: any) {
  md.core.ruler.after('inline', 'ws_empty_link_text', (state: any) => {
    if (state.inlineMode || !isWritersideDoc(state.env)) return

    for (const token of state.tokens) {
      const children = token.type === 'inline' ? token.children : null
      if (!children) continue

      for (let i = children.length - 2; i >= 0; i--) {
        if (children[i].type !== 'link_open' || children[i + 1].type !== 'link_close') continue
        const href: string = children[i].attrGet('href') ?? ''
        if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) continue

        const title = linkTitle(href, state.env)
        if (title === null) {
          console.warn(`Empty link text: no title for ${href} in ${state.env.relativePath}`)
        }
        const text = md.parseInline(title ?? href, { ...state.env })[0]?.children ?? []
        children.splice(i + 1, 0, ...text.filter((t: any) => t.type !== 'link_open' && t.type !== 'link_close'))
      }
    }
  })
}

/** The title Writerside shows for a link to `href`, read from the target source; null when there is none. */
export function linkTitle(href: string, env: any): string | null {
  const at = href.indexOf('#')
  const linkPath = (at < 0 ? href : href.slice(0, at)).replace(/\?.*$/, '')
  const source = targetSource(linkPath, env)
  if (source === null) return null
  if (at < 0) return pageTitle(source)

  let id = href.slice(at + 1)
  try {
    id = decodeURI(id)
  } catch {}
  return headingTitle(source, id)
}

/** A page's title: its `[//]: # (title: …)` comment, else its first H1. */
export function pageTitle(source: string): string | null {
  const comment = /^\[\/\/\]: # \(title:\s*(.*)\)\s*$/m.exec(source)
  if (comment) return clean(comment[1])
  for (const heading of headings(source)) {
    if (heading.level === 1) return heading.text
  }
  return null
}

/** The text of the heading with this id, explicit (`{id="…"}`) or generated from its text. */
export function headingTitle(source: string, id: string): string | null {
  const all = headings(source)
  return (all.find((h) => h.id === id) ?? all.find((h) => h.id === null && slugify(plain(h.text)) === id))?.text ?? null
}

/** ATX headings outside code fences, with their `{id}` attribute if any. */
function headings(source: string): { level: number; text: string; id: string | null }[] {
  const found = []
  let fence: string | null = null
  for (const line of source.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (marker && (fence === null || marker.startsWith(fence))) {
      fence = fence === null ? marker : null
      continue
    }
    const m = fence === null && /^(#{1,6})\s+(.*?)\s*$/.exec(line)
    if (!m) continue
    const id = /\{[^}]*?\bid=["']?([^"'\s}]+)/.exec(m[2])?.[1] ?? null
    found.push({ level: m[1].length, text: clean(m[2]), id })
  }
  return found
}

/** Heading or title text without its trailing `{…}` attributes and self-closing tags (`<secondary-label …/>`). */
function clean(text: string): string {
  return text
    .replace(/(\s*\{[^}]*\})+\s*$/, '')
    .replace(/<[a-z][\w-]*\s[^>]*\/>/gi, '')
    .trim()
}

/** Text as VitePress slugifies it for a generated heading id: no Markdown marks. */
function plain(text: string): string {
  return text.replace(/[`*_]/g, '')
}
