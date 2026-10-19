import { readdir, readFile } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { visibleUndefined } from './lib/visible-undefined.mjs'

const distDir = resolve('docs/.vitepress/dist')
const siteOrigin = 'https://openaidoc.org'
const errors = []
/** Pages showing "undefined" (P0-13): a warning until the queued retranslations land. */
const undefinedPages = []

const criticalPages = new Map([
  ['index.html', `${siteOrigin}/`],
  ['kotlin/home.html', `${siteOrigin}/kotlin/home`],
  ['ktor/welcome.html', `${siteOrigin}/ktor/welcome`],
  ['kmp/get-started.html', `${siteOrigin}/kmp/get-started`],
  ['koog/index.html', `${siteOrigin}/koog/`],
  ['zh-Hant/index.html', `${siteOrigin}/zh-Hant/`],
  ['ja/index.html', `${siteOrigin}/ja/`],
  ['ko/index.html', `${siteOrigin}/ko/`]
])

const htmlFiles = await listFiles(distDir, '.html')
let renderedKoogDependency = false
for (const file of htmlFiles) {
  // POSIX separators, also on Windows: the checks below match paths like koog/…
  const relativeFile = relative(distDir, file).replaceAll('\\', '/')
  const html = await readFile(file, 'utf8')
  const bodyHtml = html.slice(html.indexOf('</head>') + '</head>'.length)

  if (isKoogOutput(relativeFile)) {
    assertNoRawMkDocsSyntax(bodyHtml, relativeFile)
    if (bodyHtml.includes('ai.koog:koog-agents')) renderedKoogDependency = true
  }

  if (bodyHtml.includes('<title>')) {
    errors.push(`${relativeFile}: contains an invalid <title> element in the page body`)
  }

  const placeholders = visibleUndefined(html)
  if (placeholders > 0) undefinedPages.push(`${relativeFile} (${placeholders})`)

  if (relativeFile !== '404.html') {
    assertIncludes(
      html,
      '<link rel="canonical"',
      `${relativeFile}: missing canonical URL`
    )
    assertIncludes(
      html,
      'hreflang="x-default"',
      `${relativeFile}: missing x-default language alternate`
    )
  }
}

if (!renderedKoogDependency) {
  errors.push('Koog pages: the quickstart dependency snippet was not rendered')
}

for (const [relativeFile, canonicalUrl] of criticalPages) {
  const file = resolve(distDir, relativeFile)
  let html = ''
  try {
    html = await readFile(file, 'utf8')
  } catch {
    errors.push(`${relativeFile}: critical route was not rendered`)
    continue
  }

  assertIncludes(
    html,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `${relativeFile}: canonical URL does not match ${canonicalUrl}`
  )
  assertIncludes(
    html,
    'googletagmanager.com/gtag/js?id=G-HLCXSW4HH1',
    `${relativeFile}: Google Analytics loader is missing`
  )
  assertIncludes(
    html,
    '<meta name="description" content="',
    `${relativeFile}: meta description is missing`
  )
}

const robots = await readFile(resolve(distDir, 'robots.txt'), 'utf8')
assertIncludes(robots, 'User-agent: *', 'robots.txt: missing user-agent rule')
assertIncludes(robots, 'Allow: /', 'robots.txt: site is not explicitly crawlable')
assertIncludes(
  robots,
  `Sitemap: ${siteOrigin}/sitemap.xml`,
  'robots.txt: sitemap declaration is missing'
)

const sitemap = await readFile(resolve(distDir, 'sitemap.xml'), 'utf8')
const sitemapUrls = sitemap.match(/<loc>[^<]+<\/loc>/g) ?? []
if (sitemapUrls.length < 3000) {
  errors.push(`sitemap.xml: expected at least 3000 URLs, found ${sitemapUrls.length}`)
}
for (const canonicalUrl of criticalPages.values()) {
  assertIncludes(
    sitemap,
    `<loc>${canonicalUrl}</loc>`,
    `sitemap.xml: missing critical URL ${canonicalUrl}`
  )
}

// A warning for now: the pages are queued for retranslation (pending files),
// and the next sync replaces them. Make it an error once this reaches zero.
if (undefinedPages.length > 0) {
  console.warn(`Warning: ${undefinedPages.length} page(s) show "undefined" where content is missing:`)
  for (const page of undefinedPages.slice(0, 40)) console.warn(`- ${page}`)
  if (undefinedPages.length > 40) console.warn(`… and ${undefinedPages.length - 40} more`)
}

if (errors.length > 0) {
  console.error(`Site verification failed with ${errors.length} issue(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Site verification passed: ${htmlFiles.length} HTML pages, ` +
  `${sitemapUrls.length} sitemap URLs, critical SEO metadata and GA present.`
)

function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) errors.push(message)
}

function isKoogOutput(relativeFile) {
  return /^(?:(?:zh-Hant|ja|ko)\/)?koog\//.test(relativeFile) &&
    !relativeFile.includes('/snippets/')
}

function assertNoRawMkDocsSyntax(html, relativeFile) {
  const sentinels = [
    ['--8&lt;--', 'snippet include'],
    ['<p>!!!', 'admonition'],
    ['??? ', 'collapsible admonition'],
    ['???+ ', 'expanded collapsible admonition'],
    ['=== &quot;', 'content tab'],
  ]

  for (const [sentinel, label] of sentinels) {
    if (html.includes(sentinel)) {
      errors.push(`${relativeFile}: contains unrendered MkDocs ${label} syntax`)
    }
  }
}

async function listFiles(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = resolve(directory, entry.name)
    if (entry.isDirectory()) return listFiles(target, extension)
    return entry.isFile() && entry.name.endsWith(extension) ? [target] : []
  }))
  return nested.flat()
}
