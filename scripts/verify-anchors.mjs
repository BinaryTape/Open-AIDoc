/**
 * Post-build crawl: links in page content (<main>) to a section of a page,
 * `typecasts#smart-casts`, must find an element with that id on the target
 * page. A missing one sends the reader to the top of the page instead.
 *
 * Some such links are broken upstream too, or wait on a fix of their own, so
 * this gate fails only when the count rises above BASELINE: lower it whenever
 * a fix brings the count down. Links to a page that does not exist are
 * verify-internal-links' concern and are skipped here.
 *
 * Run after docs:build (wired into docs:verify). DIST_DIR overrides the
 * directory and ANCHOR_BASELINE the baseline (tests).
 */
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const BASELINE = 116

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = process.env.DIST_DIR
  ? resolve(process.env.DIST_DIR)
  : resolve(__dirname, '../docs/.vitepress/dist')
const baseline = process.env.ANCHOR_BASELINE ? Number(process.env.ANCHOR_BASELINE) : BASELINE

if (!existsSync(distDir)) {
  console.error(`verify-anchors: dist not found at ${distDir}. Run docs:build first.`)
  process.exit(1)
}

/** route (/ja/kotlin/typecasts, /kotlin/) → HTML file */
const pages = new Map()
for (const file of await listHtml(distDir)) {
  const rel = relative(distDir, file).replaceAll('\\', '/')
  pages.set('/' + rel.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, ''), file)
}

const idCache = new Map()
async function idsOf(route) {
  if (!idCache.has(route)) {
    const html = await readFile(pages.get(route), 'utf8')
    idCache.set(route, new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((m) => decodeEntities(m[1]))))
  }
  return idCache.get(route)
}

let checked = 0
/** @type {Map<string, Set<string>>} target route#hash → pages linking to it */
const broken = new Map()

for (const [route, file] of pages) {
  const html = await readFile(file, 'utf8')
  for (const [, rawHref] of mainContent(html).matchAll(/<a\s[^>]*?href="([^"]*#[^"]+)"/g)) {
    const href = decodeEntities(rawHref)
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) continue
    const at = href.indexOf('#')
    const target = resolveRoute(route, href.slice(0, at).split('?')[0])
    if (!pages.has(target)) continue
    const hash = safeDecode(href.slice(at + 1))
    checked++
    if ((await idsOf(target)).has(hash)) continue
    const key = `${target}#${hash}`
    if (!broken.has(key)) broken.set(key, new Set())
    broken.get(key).add(route)
  }
}

// Counted once per linking page: a page linking to one section twice is one fix.
const links = [...broken.values()].reduce((sum, from) => sum + from.size, 0)
const summary = `${links} link(s) to ${broken.size} missing section(s), of ${checked} section link(s) in ${pages.size} pages`

if (links > baseline) {
  console.error(`Anchor verification failed: ${summary}; the baseline is ${baseline}.\n`)
  const ranked = [...broken.entries()].sort((a, b) => b[1].size - a[1].size)
  for (const [key, from] of ranked.slice(0, 80)) {
    console.error(`- ${key} (from ${from.size} page(s), e.g. ${[...from].slice(0, 3).join(', ')})`)
  }
  if (ranked.length > 80) console.error(`… and ${ranked.length - 80} more`)
  process.exit(1)
}

console.log(
  `Anchor verification passed: ${summary}` +
    (links < baseline ? ` — below the baseline of ${baseline}: lower BASELINE in scripts/verify-anchors.mjs.` : '.')
)

function resolveRoute(from, path) {
  if (!path) return from
  let target = path.startsWith('/') ? path : (from.endsWith('/') ? from : from.replace(/[^/]*$/, '')) + path
  const parts = []
  for (const part of target.split('/')) {
    if (part === '..') parts.pop()
    else if (part !== '.') parts.push(part)
  }
  target = parts.join('/').replace(/\.html$/, '').replace(/(^|\/)index$/, '$1')
  return target.startsWith('/') ? target : `/${target}`
}

/** The page's own content: VitePress puts it in <main>, the nav and footer are outside. */
function mainContent(html) {
  const start = html.indexOf('<main')
  const end = html.lastIndexOf('</main>')
  return start === -1 || end === -1 ? '' : html.slice(start, end)
}

function decodeEntities(text) {
  return text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text)
  } catch {
    return text
  }
}

async function listHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = resolve(directory, entry.name)
      if (entry.isDirectory()) return entry.name === 'assets' ? [] : listHtml(target)
      return entry.isFile() && entry.name.endsWith('.html') ? [target] : []
    })
  )
  return nested.flat()
}
