import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  ROOT_SIDEBAR_DOC_TYPES,
  collectSidebarLinks,
  findMissingSidebarPages,
  listSidebarIds,
  sidebarLinkCandidatePaths,
  sidebarPageExists,
} from '../shared/sidebar-links'
import { DEFAULT_LOCALE } from '../shared/locales'

const repoRoot = resolve(import.meta.dirname, '..')
const docsRoot = resolve(repoRoot, 'docs')
const sidebarDir = resolve(docsRoot, '.vitepress/sidebar')

describe('sidebar link helpers', () => {
  it('maps a link to default-locale markdown candidates', () => {
    expect(
      sidebarLinkCandidatePaths(DEFAULT_LOCALE, 'ktor', 'welcome')
    ).toEqual(['ktor/welcome.md', 'ktor/welcome/index.md'])
  })

  it('maps a link to localized markdown candidates', () => {
    expect(sidebarLinkCandidatePaths('ja', 'ktor', 'welcome')).toEqual([
      'ja/ktor/welcome.md',
      'ja/ktor/welcome/index.md',
    ])
  })

  it('finds an existing ktor welcome page', () => {
    const result = sidebarPageExists(
      docsRoot,
      DEFAULT_LOCALE,
      'ktor',
      'welcome'
    )
    expect(result.exists).toBe(true)
  })
})

describe('sidebar JSON inventory', () => {
  it('has a sidebar file for every root doc type', () => {
    const ids = listSidebarIds(sidebarDir)
    for (const docType of ROOT_SIDEBAR_DOC_TYPES) {
      expect(ids, `missing ${docType}.sidebar.json`).toContain(docType)
    }
  })

  it('collects internal links from root sidebars and includes', () => {
    const links = collectSidebarLinks(sidebarDir)
    expect(links.length).toBeGreaterThan(100)

    // Nested coroutines sidebar is included under kotlin content dir
    expect(
      links.some(
        (l) =>
          l.sidebarId === 'coroutines' &&
          l.contentDir === 'kotlin' &&
          l.link === 'coroutines-guide'
      )
    ).toBe(true)

    // Root ktor entry
    expect(
      links.some(
        (l) =>
          l.sidebarId === 'ktor' &&
          l.contentDir === 'ktor' &&
          l.link === 'welcome'
      )
    ).toBe(true)

    // No external hrefs should appear as link refs
    expect(links.every((l) => !/^https?:/i.test(l.link))).toBe(true)
  })

  it('does not expose empty Koog leaf items', () => {
    const sidebar = JSON.parse(
      readFileSync(resolve(sidebarDir, 'koog.sidebar.json'), 'utf8')
    )
    const emptyLeaves: string[] = []

    function visit(items: any[]) {
      for (const item of items) {
        if (!item.link && !item.href && !item.items) emptyLeaves.push(item.text)
        if (item.items) visit(item.items)
      }
    }

    visit(sidebar)
    expect(emptyLeaves).toEqual([])
  })
})

describe('sidebar links resolve to source pages (default locale)', () => {
  it('every sidebar link has a markdown page under docs/', () => {
    const missing = findMissingSidebarPages({
      docsRoot,
      sidebarDir,
      locales: [DEFAULT_LOCALE],
    })

    if (missing.length > 0) {
      const lines = missing.map(
        (m) =>
          `  - [${m.sidebarId} → ${m.contentDir}] ${m.link} (checked: ${m.checked.join(', ')})`
      )
      expect.fail(
        `${missing.length} sidebar link(s) have no source page:\n${lines.join('\n')}`
      )
    }
  })
})

describe('sidebar href entries', () => {
  it('keep a site path in the reader\'s language and leave URLs alone', async () => {
    const { localizeHref } = await import('../docs/.vitepress/config/sidebar.config')
    expect(localizeHref('ja', '/kotlin/wasm-get-started')).toBe('/ja/kotlin/wasm-get-started')
    expect(localizeHref('zh-Hans', '/kotlin/wasm-get-started')).toBe('/kotlin/wasm-get-started')
    expect(localizeHref('ko', 'https://kotlinlang.org/docs/x.html')).toBe('https://kotlinlang.org/docs/x.html')
    expect(localizeHref('ko', '//cdn.example.com/x')).toBe('//cdn.example.com/x')
  })

  it('link the KMP sidebar to the Kotlin Wasm page in the same language', async () => {
    const { default: generateSidebar } = await import('../docs/.vitepress/config/sidebar.config')
    const find = (nodes: any[]): any =>
      nodes.map((n) => (n.link?.endsWith('/kotlin/wasm-get-started') ? n : n.items && find(n.items))).find(Boolean)
    const sidebar = generateSidebar({ lang: 'ja' } as any, { path: 'kmp', framework: 'Writerside', type: 'kmp' } as any)
    expect(find(sidebar).link).toBe('/ja/kotlin/wasm-get-started')
  })
})
