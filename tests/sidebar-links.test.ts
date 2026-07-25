import { describe, expect, it } from 'vitest'
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
