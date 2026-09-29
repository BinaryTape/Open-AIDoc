import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { reconcileSidebar } from '../tools/pipeline/processors/SidebarReconciler.mjs'
import { KOIN_HIDDEN_PAGES } from '../tools/pipeline/sync-strategies/strategy-koin.mjs'

const leaf = (link: string) => ({ text: `koin.${link.replaceAll('/', '.')}`, link })
const curated = () => [
  { text: 'koin.setup', collapsed: true, items: [leaf('setup/index'), leaf('setup/gradle')] },
  {
    text: 'koin.integrations',
    collapsed: true,
    items: [
      { text: 'koin.koin-for-compose', collapsed: true, items: [leaf('reference/koin-compose/compose')] },
      { text: 'koin.koin-for-ktor', collapsed: true, items: [leaf('reference/koin-ktor/ktor')] },
    ],
  },
  { text: 'koin.support', collapsed: true, items: [leaf('support/releases')] },
]
const upstream = ['setup/index', 'setup/gradle', 'reference/koin-compose/compose', 'reference/koin-ktor/ktor']

describe('reconcileSidebar', () => {
  it('leaves an up-to-date sidebar untouched', () => {
    const { sidebarNodes, added, removed } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: upstream,
      isServable: () => true,
    })
    expect(sidebarNodes).toEqual(curated())
    expect([added, removed]).toEqual([[], []])
  })

  it('files a new page with its siblings', () => {
    const { sidebarNodes, added } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: [...upstream, 'reference/koin-compose/navigation3'],
      isServable: () => true,
    })
    expect(added).toEqual(['reference/koin-compose/navigation3'])
    expect(sidebarNodes[1].items[0].items.map((n: any) => n.link)).toEqual([
      'reference/koin-compose/compose',
      'reference/koin-compose/navigation3',
    ])
  })

  it('drops pages that can no longer be served, and categories left empty', () => {
    const { sidebarNodes, removed } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: upstream.filter((id) => id !== 'reference/koin-ktor/ktor'),
      isServable: (id) => id !== 'reference/koin-ktor/ktor',
    })
    expect(removed).toEqual(['reference/koin-ktor/ktor'])
    expect(sidebarNodes[1].items.map((n: any) => n.text)).toEqual(['koin.koin-for-compose'])
  })

  it('keeps pages served from an existing translation although upstream lacks them', () => {
    const { sidebarNodes } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: upstream,
      isServable: (id) => upstream.includes(id) || id === 'support/releases',
    })
    expect(sidebarNodes[2].items.map((n: any) => n.link)).toEqual(['support/releases'])
  })

  it('does not add hidden pages', () => {
    const { added } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: [...upstream, 'reference/koin-android/r8-proguard'],
      hidden: ['reference/koin-android/r8-proguard'],
      isServable: () => true,
    })
    expect(added).toEqual([])
  })

  it('flags pages from a new directory for curation', () => {
    const { sidebarNodes, translateKeys, autoGroups } = reconcileSidebar(curated(), {
      docType: 'koin',
      docIds: [...upstream, 'reference/koin-wasm/setup', 'reference/koin-wasm/usage'],
      isServable: () => true,
    })
    expect(autoGroups).toEqual(['reference/koin-wasm'])
    expect(sidebarNodes.at(-1)).toEqual({
      text: 'koin.reference-koin-wasm',
      collapsed: true,
      autoGroup: 'reference/koin-wasm',
      items: [leaf('reference/koin-wasm/setup'), leaf('reference/koin-wasm/usage')],
    })
    expect(translateKeys.get('koin.reference-koin-wasm')).toBe('Koin Wasm')
  })
})

describe('committed Koin sidebar', () => {
  const sidebar = JSON.parse(readFileSync(resolve(import.meta.dirname, '../docs/.vitepress/sidebar/koin.sidebar.json'), 'utf8'))
  const nodes: any[] = []
  const walk = (list: any[]) => list.forEach((n) => { nodes.push(n); if (n.items) walk(n.items) })
  walk(sidebar)

  it('has no auto groups left to curate', () => {
    // A sync filed pages from a new upstream directory in an auto group: move
    // them to the right category (or add them to KOIN_HIDDEN_PAGES) and drop
    // the group.
    expect(nodes.filter((n) => n.autoGroup).map((n) => n.autoGroup)).toEqual([])
  })

  it('does not list hidden pages', () => {
    expect(nodes.filter((n) => KOIN_HIDDEN_PAGES.includes(n.link)).map((n) => n.link)).toEqual([])
  })

  it('only links pages that exist', () => {
    const missing = nodes.filter((n) => n.link && !existsSync(resolve(import.meta.dirname, `../docs/koin/${n.link}.md`)))
    expect(missing.map((n) => n.link)).toEqual([])
  })
})
