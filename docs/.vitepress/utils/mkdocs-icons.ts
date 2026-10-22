/**
 * Material for MkDocs icon shortcodes, as Koog and SQLDelight write them:
 *
 *   :material-rocket-launch:   Material Design Icons      (@iconify-json/mdi, Apache-2.0)
 *   :octicons-arrow-right-24:  GitHub Octicons            (@iconify-json/octicon, MIT)
 *   :simple-sqlite:            Simple Icons, brand logos  (@iconify-json/simple-icons, CC0-1.0)
 *
 * The icon sets are Iconify's JSON packages, read when a page is built. A
 * shortcode whose icon is not in its set gives null and stays as text.
 */
import { createRequire } from 'node:module'

interface IconifyIcon { body: string, width?: number, height?: number, left?: number, top?: number }
interface IconifySet {
  icons: Record<string, IconifyIcon>
  aliases?: Record<string, { parent: string } & Partial<IconifyIcon>>
  width?: number
  height?: number
}

const require = createRequire(import.meta.url)

// Shortcode prefix → Iconify package. MkDocs also has `fontawesome-`; no
// mirrored document uses it.
const PACKAGES: Record<string, string> = {
  material: '@iconify-json/mdi/icons.json',
  octicons: '@iconify-json/octicon/icons.json',
  simple: '@iconify-json/simple-icons/icons.json',
}

const loaded = new Map<string, IconifySet>()

function iconSet(prefix: string): IconifySet | null {
  const pkg = PACKAGES[prefix]
  if (!pkg) return null
  if (!loaded.has(prefix)) loaded.set(prefix, require(pkg))
  return loaded.get(prefix)!
}

function findIcon(set: IconifySet, name: string): IconifyIcon | null {
  // Aliases point at another icon, and may override its size.
  for (let current = name, overrides = {}, depth = 0; depth < 5; depth++) {
    const icon = set.icons[current]
    if (icon) return { ...icon, ...overrides }
    const alias = set.aliases?.[current]
    if (!alias) return null
    const { parent, ...rest } = alias
    overrides = { ...rest, ...overrides }
    current = parent
  }
  return null
}

/** The SVG of `material-rocket-launch`, or null when there is no such icon. */
export function mkdocsIconSvg(shortcode: string): string | null {
  const dash = shortcode.indexOf('-')
  if (dash < 0) return null
  const set = iconSet(shortcode.slice(0, dash))
  const icon = set && findIcon(set, shortcode.slice(dash + 1))
  if (!icon) return null
  const width = icon.width ?? set.width ?? 16
  const height = icon.height ?? set.height ?? 16
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.left ?? 0} ${icon.top ?? 0} ${width} ${height}">${icon.body}</svg>`
}

/** `{ .lg .middle }` after a shortcode → "lg middle". */
export function mkdocsIconClasses(attrs: string | undefined): string {
  return (attrs?.match(/\.[\w-]+/g) ?? []).map((cls) => cls.slice(1)).join(' ')
}
