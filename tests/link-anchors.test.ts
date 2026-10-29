import { describe, expect, it } from 'vitest'
import {
  applySourceLinkAnchors,
  listLinks,
  restoredHref,
} from '../tools/pipeline/utils/link-anchors.mjs'

describe('listLinks', () => {
  it('finds Markdown and HTML link targets with their offsets', () => {
    const md = 'See [casts](typecasts.md#smart-casts) and <a href="#install">here</a>.\n[x](<a b.md#c> "title")'
    const links = listLinks(md)
    expect(links.map((l) => l.href)).toEqual(['typecasts.md#smart-casts', '#install', 'a b.md#c'])
    for (const { href, start } of links) expect(md.slice(start, start + href.length)).toBe(href)
  })

  it('skips links inside code', () => {
    const md = ['`[a](b.md#c)`', '```', '[d](e.md#f)', '```', '[g](h.md#i)'].join('\n')
    expect(listLinks(md).map((l) => l.href)).toEqual(['h.md#i'])
  })
})

describe('restoredHref', () => {
  it('puts back an anchor the translation translated', () => {
    expect(restoredHref('typecasts.md#smart-casts', 'typecasts.md#スマートキャスト')).toBe('typecasts.md#smart-casts')
    expect(restoredHref('#smart-casts', '#%E6%99%BA%E8%83%BD')).toBe('#smart-casts')
  })

  it('puts back the page a converted Writerside link lost', () => {
    expect(restoredHref('server-plugins.md#install', '#install')).toBe('server-plugins.md#install')
  })

  it('leaves other links alone', () => {
    expect(restoredHref('a.md#x', 'a.md#x')).toBeNull()
    expect(restoredHref('a.md#x', 'a.md#y')).toBeNull() // an ASCII anchor: a reordered link
    expect(restoredHref('a.md#x', 'b.md#智能')).toBeNull()
    expect(restoredHref('a.md', 'a.md#智能')).toBeNull()
  })
})

describe('applySourceLinkAnchors', () => {
  const source = [
    'Read about [smart casts](typecasts.md#smart-casts) and [null safety](null-safety.md).',
    '',
    'Also [checks](#is-and-is-operators).',
  ].join('\n')

  it('restores anchors link by link when the links line up', () => {
    const translated = [
      '[スマートキャスト](typecasts.md#スマートキャスト)と[null 安全性](null-safety.md)について。',
      '',
      '[チェック](#is-および-is-演算子)も参照。',
    ].join('\n')
    const { content, restored } = applySourceLinkAnchors(translated, source)
    expect(restored).toBe(2)
    expect(content).toBe(
      [
        '[スマートキャスト](typecasts.md#smart-casts)と[null 安全性](null-safety.md)について。',
        '',
        '[チェック](#is-and-is-operators)も参照。',
      ].join('\n')
    )
  })

  it('aligns by page when the translation dropped a link', () => {
    const translated = '[智能转换](typecasts.md#智能转换)。\n\n[检查](#is-与-is-操作符)。'
    expect(applySourceLinkAnchors(translated, source).content).toBe(
      '[智能转换](typecasts.md#smart-casts)。\n\n[检查](#is-and-is-operators)。'
    )
  })

  it('repairs a Ktor link that lost its page', () => {
    const { content } = applySourceLinkAnchors(
      '要安装插件，请参阅<a href="#install">安装</a>。',
      'To install the plugin, see <a href="server-plugins.md#install">Install</a>.'
    )
    expect(content).toBe('要安装插件，请参阅<a href="server-plugins.md#install">安装</a>。')
  })

  it('leaves a translation whose links are intact unchanged', () => {
    const translated = '[智能转换](typecasts.md#smart-casts)，[空安全](null-safety.md)。\n\n[检查](#is-and-is-operators)。'
    expect(applySourceLinkAnchors(translated, source)).toEqual({ content: translated, restored: 0 })
  })
})
