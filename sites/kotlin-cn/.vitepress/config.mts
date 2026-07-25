import { defineConfig } from 'vitepress'
import { resolve, dirname, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import matter from 'gray-matter'

import {
  registerMarkdownPlugins,
  markdownItMkLiquidCondition,
  shikiRemoveDiffMarker
} from '../../../docs/.vitepress/config/markdown.config'
import liquidIncludePlugin from '../../../docs/.vitepress/plugins/vite/vite-liquid-include'
import { installKotlinCnLinkRewrite } from './kotlin-cn-link-rewrite'
import { applyKotlinCnMetadata } from './kotlin-cn-metadata'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '../../..')
const sourceDocsRoot = resolve(repoRoot, 'docs')
const sidebarRoot = resolve(sourceDocsRoot, '.vitepress/sidebar')
const localePath = resolve(sourceDocsRoot, '.vitepress/locales/zh-Hans.json')
const locale = JSON.parse(readFileSync(localePath, 'utf-8')) as Record<string, string>
const kotlinVariablesPath = resolve(sourceDocsRoot, '.vitepress/variables/kotlin.v.list')
const mkDiffGrammarPath = resolve(sourceDocsRoot, '.vitepress/plugins/shiki/shiki-mk-diff.json')
const mkDiffGrammar = JSON.parse(readFileSync(mkDiffGrammarPath, 'utf-8'))

type SidebarNode = {
  text?: string
  link?: string
  href?: string
  include?: string
  items?: SidebarNode[]
  collapsed?: boolean
}

type CommunityDoc = {
  key: string
  label: string
  title: string
  home: string
  sourceType: string
  sidebar: SidebarNode[]
}

type HomeMeta = {
  updatedAt: string
  nextUpdateAt: string
}

const docsConfig = [
  {
    key: 'language',
    label: 'Language',
    title: 'Kotlin Language',
    sourceType: 'kotlin',
    sourceDir: resolve(sourceDocsRoot, 'kotlin'),
    base: '/docs/language/',
    home: '/docs/language/home'
  },
  {
    key: 'multiplatform',
    label: 'Multiplatform',
    title: 'Kotlin Multiplatform',
    sourceType: 'kmp',
    sourceDir: resolve(sourceDocsRoot, 'kmp'),
    base: '/docs/multiplatform/',
    home: '/docs/multiplatform/get-started'
  },
  {
    key: 'koog',
    label: 'Koog',
    title: 'Koog',
    sourceType: 'koog',
    sourceDir: resolve(sourceDocsRoot, 'koog'),
    base: '/docs/koog/',
    home: '/docs/koog/'
  }
] as const

function buildCommunityDocs(): CommunityDoc[] {
  return docsConfig.map((doc) => ({
    key: doc.key,
    label: doc.label,
    title: doc.title,
    sourceType: doc.sourceType,
    home: doc.home,
    sidebar: buildSidebar(doc.sourceType, doc.sourceDir, doc.base)
  }))
}

function buildSidebar(type: string, sourceDir: string, base: string): SidebarNode[] {
  const sidebarPath = resolve(sidebarRoot, `${type}.sidebar.json`)
  const sidebar = JSON.parse(readFileSync(sidebarPath, 'utf-8')) as SidebarNode[]
  return sidebar.map((node) => localizeNode(node, type, sourceDir, base)).filter(Boolean) as SidebarNode[]
}

function localizeNode(node: SidebarNode, type: string, sourceDir: string, base: string): SidebarNode | null {
  const includedSidebarPath = node.include
    ? resolve(sidebarRoot, `${node.include}.sidebar.json`)
    : undefined
  const fallbackDocPath = node.include
    ? resolve(sourceDir, `${node.include}.md`)
    : undefined
  const includedItems = includedSidebarPath && existsSync(includedSidebarPath)
    ? buildSidebar(node.include!, sourceDir, base)
    : undefined
  const childItems = node.items?.map((child) => localizeNode(child, type, sourceDir, base)).filter(Boolean) as SidebarNode[] | undefined
  const text = localizeText(node, sourceDir)

  if (!text && !node.link && !node.href && !includedItems?.length && !childItems?.length) return null

  if (node.include && !includedItems?.length && !fallbackDocPath) {
    throw new Error(`Sidebar "${type}" includes missing sidebar "${node.include}".`)
  }

  if (node.include && !includedItems?.length && fallbackDocPath && !existsSync(fallbackDocPath)) {
    throw new Error(
      `Sidebar "${type}" includes missing sidebar "${node.include}" ` +
      `and no fallback document exists at "${fallbackDocPath}".`
    )
  }

  const out: SidebarNode = {
    text,
    link: node.link
      ? normalizeDocLink(base, node.link)
      : node.include && !includedItems?.length
        ? normalizeDocLink(base, node.include)
        : undefined,
    href: node.href,
    collapsed: node.collapsed
  }

  if (includedItems?.length) out.items = includedItems
  else if (childItems?.length) out.items = childItems

  return out
}

function localizeText(node: SidebarNode, sourceDir: string): string {
  if (node.text && locale[node.text]) return locale[node.text]
  if (node.link) return getTitleFromMarkdown(sourceDir, node.link) || node.text || ''
  return node.text || ''
}

function normalizeDocLink(base: string, link: string): string {
  const clean = link.replace(/\.md$/, '').replace(/\/index$/, '/')
  if (!clean || clean === '/') return base
  return posix.join(base, clean)
}

function getTitleFromMarkdown(rootDir: string, filePath: string): string | null {
  const fullPath = resolve(rootDir, `${filePath}.md`)
  if (!existsSync(fullPath)) return null
  const content = readFileSync(fullPath, 'utf-8')
  const parsed = matter(content)
  if (parsed.data?.title) return parsed.data.title

  const topicMatch = content.match(/<topic\s*([^>]*)>/)
  const topicTitleMatch = topicMatch?.[1]?.match(/title="([^"]+)"/)
  if (topicTitleMatch) return topicTitleMatch[1]

  const markdownTitleMatch = content.match(/\[\/\/\]: # \(title:\s*(.*?)\)/i)
  if (markdownTitleMatch) return markdownTitleMatch[1]

  const markdownHeaderMatch = content.match(/^# (.+)$/m)
  return markdownHeaderMatch?.[1] || null
}

function readWritersideVar(filePath: string, name: string): string | null {
  if (!existsSync(filePath)) return null
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(new RegExp(`<var\\s+name="${name}"\\s+value="([^"]+)"`))
  return match?.[1] || null
}

function buildHomeMeta(): HomeMeta {
  const lastUpdated = readDocsUpdateDate() || new Date()
  const nextUpdated = getNextScheduledDocsUpdate(lastUpdated)

  return {
    updatedAt: formatGmtDate(lastUpdated),
    nextUpdateAt: formatGmtDate(nextUpdated)
  }
}

function readDocsUpdateDate(): Date | null {
  const fromDocsSyncCommit = readGitDate([
    'log',
    '-1',
    '--grep=^docs: .*Sync and translate upstream documentation',
    '--format=%cI'
  ])
  if (fromDocsSyncCommit) return fromDocsSyncCommit

  return readGitDate([
    'log',
    '-1',
    '--format=%cI',
    '--',
    'docs/kotlin',
    'docs/kmp',
    'docs/koog',
    'docs/.vitepress/sidebar/kotlin.sidebar.json',
    'docs/.vitepress/sidebar/kmp.sidebar.json',
    'docs/.vitepress/sidebar/koog.sidebar.json',
    'docs/.vitepress/variables/kotlin.v.list',
    'docs/.vitepress/variables/kmp.v.list'
  ]) || readGitDate(['show', '-s', '--format=%cI', 'HEAD'])
}

function readGitDate(args: string[]): Date | null {
  try {
    const output = execFileSync('git', args, { cwd: repoRoot, encoding: 'utf-8' }).trim()
    if (!output) return null
    const date = new Date(output.split('\n')[0])
    return Number.isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

function getNextScheduledDocsUpdate(from: Date): Date {
  const next = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0, 0))
  const daysUntilSunday = (7 - next.getUTCDay()) % 7
  next.setUTCDate(next.getUTCDate() + daysUntilSunday)
  if (next <= from) next.setUTCDate(next.getUTCDate() + 7)
  return next
}

function formatGmtDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = padDatePart(date.getUTCMonth() + 1)
  const day = padDatePart(date.getUTCDate())
  return `${year}-${month}-${day}`
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

function installKotlinCnMarkdownEnvAlias(md: any) {
  const originalParse = md.parse
  const originalRender = md.render
  const originalRenderAsync = md.renderAsync

  md.parse = function (src: string, env: any) {
    return withSourceRelativePath(env, () => originalParse.call(this, src, env))
  }

  md.render = function (src: string, env: any) {
    return withSourceRelativePath(env, () => originalRender.call(this, src, env))
  }

  if (originalRenderAsync) {
    md.renderAsync = function (src: string, env: any) {
      return withSourceRelativePath(env, () => originalRenderAsync.call(this, src, env))
    }
  }
}

function withSourceRelativePath<T>(env: any, callback: () => T): T {
  const originalRelativePath = env?.relativePath
  const aliasedRelativePath = toSourceRelativePath(originalRelativePath)

  if (!aliasedRelativePath) return callback()

  env.relativePath = aliasedRelativePath
  env.kotlinCnPublicRelativePath = originalRelativePath

  try {
    return callback()
  } finally {
    env.relativePath = originalRelativePath
  }
}

function toSourceRelativePath(relativePath?: string): string | null {
  if (!relativePath) return null
  if (relativePath.startsWith('docs/language/')) {
    return relativePath.replace(/^docs\/language\//, 'docs/kotlin/')
  }
  if (relativePath.startsWith('docs/multiplatform/')) {
    return relativePath.replace(/^docs\/multiplatform\//, 'docs/kmp/')
  }
  return null
}

export default defineConfig({
  lang: 'zh-Hans',
  title: 'Kotlin 中文社区',
  description: '社区维护的 Kotlin 中文官方网站',
  cleanUrls: true,
  lastUpdated: false,
  // Localhost URLs are runnable examples. Every other internal link must
  // resolve after the satellite route mapping pass.
  ignoreDeadLinks: 'localhostLinks',
  metaChunk: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/assets/kotlin-mark.svg' }],
    ['meta', { name: 'theme-color', content: '#19191c' }]
  ],
  vite: {
    resolve: {
      alias: {
        '@kotlin-cn': resolve(__dirname, 'theme'),
        '@open-docs': resolve(sourceDocsRoot, '.vitepress')
      }
    },
    server: {
      fs: {
        allow: [repoRoot]
      }
    },
    plugins: [liquidIncludePlugin()]
  },
  themeConfig: {
    kotlinVersion: readWritersideVar(kotlinVariablesPath, 'kotlinVersion'),
    homeMeta: buildHomeMeta(),
    communityDocs: buildCommunityDocs()
  },
  transformPageData(pageData) {
    applyKotlinCnMetadata(pageData)
  },
  markdown: {
    attrs: {
      leftDelimiter: '{',
      rightDelimiter: '}',
      allowedAttributes: []
    },
    preConfig: (md) => {
      md.use(markdownItMkLiquidCondition)
    },
    shikiSetup: (shiki) => {
      shiki.loadLanguage(mkDiffGrammar)
    },
    codeTransformers: [
      shikiRemoveDiffMarker()
    ],
    config: (md) => {
      registerMarkdownPlugins(md)
      installKotlinCnLinkRewrite(md)
      installKotlinCnMarkdownEnvAlias(md)
    }
  }
})
