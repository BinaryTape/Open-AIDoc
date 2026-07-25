import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

const distDir = resolve('sites/kotlin-cn/.vitepress/dist')
const errors = []
const criticalPages = new Map([
  ['index.html', 'Kotlin 中文社区'],
  ['docs/language/home.html', 'Kotlin 文档'],
  ['docs/multiplatform/get-started.html', 'Kotlin Multiplatform 入门'],
  ['docs/koog/index.html', '概览']
])
const repairedRoutes = [
  'docs/language/functions.html',
  'docs/language/control-flow.html',
  'docs/multiplatform/quickstart.html',
  'docs/koog/a2a-client.html',
  'docs/koog/agents/graph-based-agents.html',
  'docs/koog/tools/index.html',
  'docs/koog/features/open-telemetry/index.html'
]

const htmlFiles = await listFiles(distDir, '.html')
for (const file of htmlFiles) {
  const relativeFile = relative(distDir, file)
  const html = await readFile(file, 'utf8')
  const bodyHtml = html.slice(html.indexOf('</head>') + '</head>'.length)

  if (bodyHtml.includes('<title>')) {
    errors.push(`${relativeFile}: contains an invalid <title> element in the page body`)
  }
  if (/href="\/(?:kotlin|kmp|koog)(?:\/|")/.test(html)) {
    errors.push(`${relativeFile}: contains a legacy Open AIDoc route`)
  }
}

for (const [relativeFile, expectedTitle] of criticalPages) {
  const html = await readOutput(relativeFile)
  if (!html) continue

  assertIncludes(
    html,
    expectedTitle,
    `${relativeFile}: expected page-specific title "${expectedTitle}"`
  )
  assertIncludes(
    html,
    '<meta name="description" content="',
    `${relativeFile}: meta description is missing`
  )
}

for (const relativeFile of repairedRoutes) {
  await readOutput(relativeFile)
}

if (errors.length > 0) {
  console.error(`Kotlin CN verification failed with ${errors.length} issue(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(
  `Kotlin CN verification passed: ${htmlFiles.length} HTML pages, ` +
  'strict internal links, critical routes, metadata, and body semantics.'
)

async function readOutput(relativeFile) {
  try {
    return await readFile(resolve(distDir, relativeFile), 'utf8')
  } catch {
    errors.push(`${relativeFile}: expected output was not rendered`)
    return ''
  }
}

function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) errors.push(message)
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
