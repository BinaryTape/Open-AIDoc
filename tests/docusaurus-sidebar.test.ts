import { describe, expect, it } from 'vitest'
import {
  appendUnlistedDocs,
  docusaurusToSidebarNodes,
  findMetadataChunkFile,
  parseMetadataChunk,
} from '../tools/pipeline/processors/DocusaurusSidebarProcessor.mjs'

const link = (docId: string, label = docId) => ({ type: 'link', label, href: `/docs/${docId}`, docId })
const category = (label: string, items: object[]) => ({ type: 'category', label, collapsed: true, items })

describe('locating the docs metadata chunk', () => {
  const mainJs =
    '"1a46b50d":[()=>n.e(7612).then(n.t.bind(n,4928,19)),"@generated/docusaurus-plugin-content-docs/default/p/docs-4-0-23f.json",4928],' +
    '"0058b4c6":[()=>n.e(849).then(n.t.bind(n,6164,19)),"@generated/docusaurus-plugin-content-docs/default/p/docs-175.json",6164]'

  it('picks the current version and resolves its named chunk file', () => {
    const runtimeJs = 'r.u=e=>"assets/js/"+({12:"abc",849:"0058b4c6"}[e]||e)+"."+{12:"1111aaaa",849:"ef87ef2c",1849:"99999999"}[e]+".js"'
    expect(findMetadataChunkFile(mainJs, runtimeJs)).toBe('0058b4c6.ef87ef2c.js')
  })

  it('resolves an unnamed chunk file', () => {
    const runtimeJs = 'r.u=e=>"assets/js/"+e+"."+{12:"1111aaaa",849:"ef87ef2c"}[e]+".js"'
    expect(findMetadataChunkFile(mainJs, runtimeJs)).toBe('849.ef87ef2c.js')
  })
})

describe('parseMetadataChunk', () => {
  it('decodes the escaped JSON literal', () => {
    const json = JSON.stringify({
      version: { docsSidebars: { docs: [link('intro/index', 'Koin\'s "intro"')] } },
    })
    const literal = json.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    const chunk = `"use strict";(globalThis.webpackChunk||=[]).push([[849],{6164(e){e.exports=JSON.parse('${literal}')}}]);`
    expect(parseMetadataChunk(chunk).docs[0].label).toBe('Koin\'s "intro"')
  })
})

describe('docusaurusToSidebarNodes', () => {
  const sidebars = {
    start: [
      category('Setup', [link('setup/koin'), link('setup/index')]),
      category('Getting Started', [link('quickstart/kotlin'), link('quickstart/android')]),
    ],
    docs: [
      category('Setup', [link('setup/index'), link('setup/gone')]),
      category('Tutorials', [link('quickstart/kotlin')]),
      category('Reference', [category('DSL Reference', [link('reference/dsl')])]),
    ],
  }
  const hasDoc = (docId: string) => docId !== 'setup/gone'

  it('keeps the primary structure with translatable category keys', () => {
    const { sidebarNodes, translateKeys } = docusaurusToSidebarNodes(sidebars, { docType: 'koin', hasDoc })
    expect(sidebarNodes.map((n: any) => n.text)).toEqual(['koin.setup', 'koin.tutorials', 'koin.reference'])
    expect(sidebarNodes[2].items[0]).toEqual({
      text: 'koin.dsl-reference',
      collapsed: true,
      items: [{ text: 'koin.reference.dsl', link: 'reference/dsl' }],
    })
    expect(translateKeys.get('koin.dsl-reference')).toBe('DSL Reference')
  })

  it('skips pages that cannot be served and reports them', () => {
    const { sidebarNodes, skipped } = docusaurusToSidebarNodes(sidebars, { docType: 'koin', hasDoc })
    expect(sidebarNodes[0].items.map((n: any) => n.link)).not.toContain('setup/gone')
    expect(skipped).toEqual(['setup/gone'])
  })

  it('files pages only other sidebars list under the matching category', () => {
    const { sidebarNodes } = docusaurusToSidebarNodes(sidebars, { docType: 'koin', hasDoc })
    // same label → Setup; no label match → Tutorials, which holds a sibling
    expect(sidebarNodes[0].items.map((n: any) => n.link)).toEqual(['setup/index', 'setup/koin'])
    expect(sidebarNodes[1].items.map((n: any) => n.link)).toEqual(['quickstart/kotlin', 'quickstart/android'])
    expect(sidebarNodes).toHaveLength(3)
  })
})

describe('appendUnlistedDocs', () => {
  it('adds one category per directory for pages the sidebar lacks', () => {
    const current = [{ text: 'koin.setup', items: [{ text: 'koin.setup.index', link: 'setup/index' }] }]
    const { sidebarNodes, translateKeys } = appendUnlistedDocs(
      current,
      ['setup/index', 'reference/koin-compose/compose-scopes', 'reference/koin-compose/navigation3'],
      'koin'
    )
    expect(sidebarNodes).toHaveLength(2)
    expect(sidebarNodes[1].items.map((n: any) => n.link)).toEqual([
      'reference/koin-compose/compose-scopes',
      'reference/koin-compose/navigation3',
    ])
    expect([...translateKeys.values()]).toEqual(['Koin Compose'])
  })
})
