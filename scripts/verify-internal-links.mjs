/**
 * Post-build crawl: every internal page href in docs/.vitepress/dist must
 * resolve to a rendered HTML file (or index.html). External URLs are ignored;
 * an href with a scheme a browser cannot follow (such as Koog's unresolved
 * `api:` links) is reported as dead, and so is `//server-plugins`: a host
 * without a dot is a site path that lost its doc name, not another site.
 *
 * A page's content (<main>) must also link to pages in its own language: a
 * Japanese page linking to /kotlin/… sends the reader to the Chinese page.
 *
 * Run after docs:build (wired into docs:verify). DIST_DIR overrides the
 * directory (tests).
 */
import { existsSync, readdirSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = process.env.DIST_DIR
  ? resolve(process.env.DIST_DIR)
  : resolve(__dirname, '../docs/.vitepress/dist')
// Not localhost: tutorials link to the reader's own server (http://localhost:8080/...).
const SITE_HOSTS = new Set(['openaidoc.org', 'www.openaidoc.org'])
const WEB_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:', 'data:', 'javascript:'])

if (!existsSync(distDir)) {
  console.error(
    `verify-internal-links: dist not found at ${distDir}. Run docs:build first.`
  )
  process.exit(1)
}

// Locale prefixes (ja, ko, zh-Hant): top-level directories holding a copy of
// the docs, such as ja/ktor next to ktor. The default locale has no prefix.
const topDirs = readdirSync(distDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
const localePrefixes = new Set(
  topDirs.filter((dir) => topDirs.some((doc) => doc !== dir && existsSync(resolve(distDir, dir, doc))))
)

const htmlFiles = await listFiles(distDir, '.html')
/** @type {Map<string, Set<string>>} */
const deadPages = new Map()
/** @type {Map<string, Set<string>>} target path → pages in another language linking to it */
const otherLanguageLinks = new Map()
let internalRefs = 0

for (const file of htmlFiles) {
  const rel = toPosix(relative(distDir, file))
  if (rel === '404.html') continue

  const html = await readFile(file, 'utf8')
  const hrefs = collectHrefs(html)
  const fromUrl = fileToUrl(file)

  for (const href of hrefs) {
    const resolved = resolveInternalPage(fromUrl, href)
    if (!resolved) continue
    internalRefs++
    if (!pageExists(resolved.candidates)) {
      if (!deadPages.has(resolved.path)) deadPages.set(resolved.path, new Set())
      deadPages.get(resolved.path).add(fromUrl)
    }
  }

  const pageLocale = localeOf(fromUrl)
  for (const href of collectHrefs(mainContent(html))) {
    const resolved = resolveInternalPage(fromUrl, href)
    if (!resolved || !resolved.candidates.length || localeOf(resolved.path) === pageLocale) continue
    if (!otherLanguageLinks.has(resolved.path)) otherLanguageLinks.set(resolved.path, new Set())
    otherLanguageLinks.get(resolved.path).add(fromUrl)
  }
}

if (otherLanguageLinks.size > 0) {
  const ranked = [...otherLanguageLinks.entries()].sort((a, b) => b[1].size - a[1].size)
  const pages = new Set(ranked.flatMap(([, sources]) => [...sources]))
  console.error(
    `Internal link verification failed: ${pages.size} page(s) link to ${ranked.length} page(s) in another language.\n`
  )
  for (const [path, sources] of ranked.slice(0, 80)) {
    console.error(`- ${path} (from ${sources.size} page(s), e.g. ${[...sources].slice(0, 5).join(', ')})`)
  }
  if (ranked.length > 80) {
    console.error(`… and ${ranked.length - 80} more`)
  }
}

if (deadPages.size > 0) {
  const ranked = [...deadPages.entries()]
    .map(([path, sources]) => ({
      path,
      sourceCount: sources.size,
      sources: [...sources].slice(0, 5),
    }))
    .sort((a, b) => b.sourceCount - a.sourceCount)

  console.error(
    `Internal link verification failed: ${ranked.length} dead page path(s), ` +
      `${internalRefs} internal page href(s) checked across ${htmlFiles.length} HTML files.\n`
  )
  for (const item of ranked.slice(0, 80)) {
    console.error(
      `- ${item.path} (${item.sourceCount} source page(s), e.g. ${item.sources.join(', ')})`
    )
  }
  if (ranked.length > 80) {
    console.error(`… and ${ranked.length - 80} more`)
  }
}

if (deadPages.size > 0 || otherLanguageLinks.size > 0) {
  process.exit(1)
}

console.log(
  `Internal link verification passed: ${htmlFiles.length} HTML pages, ` +
    `${internalRefs} internal page href(s), 0 dead targets.`
)

function collectHrefs(html) {
  const out = new Set()
  const re = /\bhref=["']([^"']+)["']/gi
  let match
  while ((match = re.exec(html)) !== null) {
    out.add(match[1])
  }
  return out
}

/** The page's own content: VitePress puts it in <main>, the nav and footer are outside. */
function mainContent(html) {
  const start = html.indexOf('<main')
  const end = html.lastIndexOf('</main>')
  return start === -1 || end === -1 ? '' : html.slice(start, end)
}

function localeOf(urlPath) {
  const first = urlPath.split('/')[1] ?? ''
  return localePrefixes.has(first) ? first : ''
}

function fileToUrl(file) {
  let rel = toPosix(relative(distDir, file))
  if (rel === 'index.html') return '/'
  if (rel.endsWith('/index.html')) {
    return `/${rel.slice(0, -'index.html'.length)}`
  }
  if (rel.endsWith('.html')) {
    return `/${rel.slice(0, -'.html'.length)}`
  }
  return `/${rel}`
}

/**
 * @returns {{ path: string, candidates: string[] } | null}
 */
function resolveInternalPage(fromUrl, href) {
  if (
    !href ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('data:') ||
    href.startsWith('javascript:')
  ) {
    return null
  }

  const scheme = /^([a-z][a-z0-9+.-]*:)/i.exec(href)
  if (scheme && !WEB_SCHEMES.has(scheme[1].toLowerCase())) {
    return { path: href, candidates: [] }
  }

  let pathWithQuery = href
  if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
    try {
      const url = new URL(href.startsWith('//') ? `https:${href}` : href)
      // `//server-plugins`: no such site; the browser cannot follow it.
      if (href.startsWith('//') && !url.hostname.includes('.')) {
        return { path: href, candidates: [] }
      }
      if (!SITE_HOSTS.has(url.hostname)) return null
      pathWithQuery = `${url.pathname}${url.search}${url.hash}`
    } catch {
      return null
    }
  }

  const cut = pathWithQuery.search(/[?#]/)
  const pathOnly = cut === -1 ? pathWithQuery : pathWithQuery.slice(0, cut)
  if (!pathOnly) return null

  const lastSeg = pathOnly.split('/').pop() || ''
  // Static assets and leftover .md refs are not page routes for this gate.
  if (lastSeg.includes('.') && !lastSeg.endsWith('.html')) {
    return null
  }

  let urlPath = pathOnly
  if (!urlPath.startsWith('/')) {
    const base = fromUrl.endsWith('/')
      ? fromUrl
      : `${fromUrl.split('/').slice(0, -1).join('/') || ''}/`
    urlPath = posixNormalize(`${base}${urlPath}`)
  } else {
    urlPath = posixNormalize(urlPath)
  }
  if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`

  const candidates = []
  if (urlPath.endsWith('/')) {
    candidates.push(resolve(distDir, `.${urlPath}`, 'index.html'))
  } else if (urlPath.endsWith('.html')) {
    candidates.push(resolve(distDir, `.${urlPath}`))
  } else {
    candidates.push(resolve(distDir, `.${urlPath}.html`))
    candidates.push(resolve(distDir, `.${urlPath}`, 'index.html'))
  }

  return { path: urlPath, candidates }
}

function pageExists(candidates) {
  return candidates.some((file) => existsSync(file))
}

function posixNormalize(path) {
  const trailingSlash = path.endsWith('/') && path !== '/'
  const parts = []
  for (const part of path.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      parts.pop()
      continue
    }
    parts.push(part)
  }
  const body = `/${parts.join('/')}`
  if (body === '/') return '/'
  return trailingSlash ? `${body}/` : body
}

function toPosix(value) {
  return value.replaceAll('\\', '/')
}

async function listFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const target = resolve(directory, entry.name)
      if (entry.isDirectory()) return listFiles(target, extension)
      return entry.isFile() && entry.name.endsWith(extension) ? [target] : []
    })
  )
  return nested.flat()
}
