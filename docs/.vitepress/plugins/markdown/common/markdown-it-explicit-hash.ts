import { readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { slugify } from '@mdit-vue/shared'

/**
 * Keeps the `#hash` of a Markdown link that points to an id written in the
 * target page's source: `[Install](#install_plugin)` to
 * `## Install routing {id="install_plugin"}`.
 *
 * VitePress's link renderer slugifies every link hash (`_` becomes `-`, a
 * leading digit gets a `_`, upper case is lowered), which matches the ids it
 * generates for headings but not an explicit id, which stays as written. So
 * the link pointed nowhere. Links to a generated id still need the slug: their
 * hash may be the heading text (`#コルーチンとスレッドのデバッグ`), so the hash
 * is kept only when the target source has that very id.
 *
 * Wraps VitePress's `link_open` rule in place: it runs first and does the rest
 * (page path, base, dead-link list), then the hash is put back.
 */
export default function markdownItExplicitHash(md: any) {
  const linkOpen = md.renderer.rules.link_open
  if (!linkOpen) return

  md.renderer.rules.link_open = (tokens: any[], idx: number, options: any, env: any, self: any) => {
    const token = tokens[idx]
    const href: string | null = token.attrGet('href')
    const html = linkOpen(tokens, idx, options, env, self)
    const hash = href && explicitHash(href, env)
    if (!hash) return html

    const rendered: string = token.attrGet('href')
    if (rendered.includes(':~:') || !rendered.includes('#')) return html
    token.attrSet('href', rendered.slice(0, rendered.indexOf('#') + 1) + hash)
    return self.renderToken(tokens, idx, options)
  }
}

/** The hash of an internal link when the target source has it as an id and slugify would change it. */
function explicitHash(href: string, env: any): string | null {
  const at = href.indexOf('#')
  if (at < 0 || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null
  let hash = href.slice(at + 1)
  try {
    hash = decodeURI(hash)
  } catch {}
  if (!hash || slugify(hash) === hash) return null

  const source = targetSource(href.slice(0, at).replace(/\?.*$/, ''), env)
  if (!source) return null
  const id = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\bid\\s*=\\s*["']${id}["']|\\{#${id}[\\s}]`).test(source) ? hash : null
}

/** The Markdown source of the page a link path points to (an empty path: this page). */
function targetSource(linkPath: string, env: any): string | null {
  if (!env?.relativePath) return null
  const srcDir = env.path ? env.path.slice(0, -env.relativePath.length) : path.resolve('docs')
  const page = !linkPath
    ? env.relativePath
    : linkPath.startsWith('/')
      ? linkPath.slice(1)
      : path.posix.join(path.posix.dirname(env.relativePath), linkPath)
  const base = page.replace(/\.(md|html)$/, '')
  const candidates = base === '' || base.endsWith('/') ? [base + 'index.md'] : [base + '.md', base + '/index.md']
  for (const candidate of candidates) {
    const text = readSource(path.join(srcDir, candidate))
    if (text !== null) return text
  }
  return null
}

const sources = new Map<string, { mtimeMs: number; text: string }>()

/** Cached per file and dropped when the file changes (dev server). */
function readSource(file: string): string | null {
  let mtimeMs: number
  try {
    mtimeMs = statSync(file).mtimeMs
  } catch {
    return null
  }
  const cached = sources.get(file)
  if (cached?.mtimeMs === mtimeMs) return cached.text
  const text = readFileSync(file, 'utf8')
  sources.set(file, { mtimeMs, text })
  return text
}
