import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { rewriteButtonLinks } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-button-link'

async function render(markdown: string, relativePath = 'kotlin/kotlin-tour-basic-types.md') {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  const html = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  expect(parse(`<template><div>${html}</div></template>`).errors).toEqual([])
  return html
}

const tourNav =
  '<list columns="2" id="tour-nav">\n' +
  '  <li>\n' +
  '    <a as="button" href="kotlin-tour-hello-world.md" mode="outline" icon="arrow-left" icon-position="left">上一步</a>\n' +
  '  </li>\n' +
  '  <li>\n' +
  '    <a as="button" href="kotlin-tour-collections.md" mode="classic" icon="arrow-right" icon-position="right">下一步</a>\n' +
  '  </li>\n' +
  '</list>\n'

describe('Writerside button links', () => {
  it('draws the tour navigation as buttons', async () => {
    // Were plain links carrying as="button" mode=… icon=… for nothing to read.
    const html = await render(tourNav)
    expect(html).toContain('<a href="/kotlin/kotlin-tour-hello-world" class="ws-button ws-button--outline ws-button--arrow-left ws-button--icon-left no-icon">上一步</a>')
    expect(html).toContain('<a href="/kotlin/kotlin-tour-collections" class="ws-button ws-button--classic ws-button--arrow-right ws-button--icon-right no-icon">下一步</a>')
    expect(html).not.toMatch(/\s(as|mode|icon|icon-position)="/)
  })

  it('handles a button in a paragraph', async () => {
    const html = await render(
      'Text.\n\n<a href="native-get-started.md" as="button" mode="rock" icon="arrow-right" icon-position="right">Kotlin/Native 快速入门</a>\n\n## Next\n',
      'kotlin/native-overview.md'
    )
    expect(html).toContain('<a href="/kotlin/native-get-started" class="ws-button ws-button--rock ws-button--arrow-right ws-button--icon-right no-icon">Kotlin/Native 快速入门</a>')
  })

  it('handles a button in a list item, inside a sentence', async () => {
    const html = await render(
      '* 加入社区：\n\n  <a href="https://slack-chats.kotlinlang.org/c/webassembly" as="button" mode="rock" icon="arrow-right" icon-position="right">加入</a>\n',
      'kotlin/wasm-get-started.md'
    )
    expect(html).toContain('<a href="https://slack-chats.kotlinlang.org/c/webassembly" class="ws-button ws-button--rock ws-button--arrow-right ws-button--icon-right no-icon">加入</a>')
  })

  it('handles a button in a topic paragraph, with an escaped href', async () => {
    const html = await render(
      '<topic title="T">\n<p><a as="button" href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" mode="rock" icon="arrow-right" icon-position="right">探索</a></p>\n</topic>\n',
      'kmp/kmp-for-ios.md'
    )
    expect(html).toContain('<a href="https://kotlinlang.org/case-studies/?type=multiplatform&amp;platforms=ios" class="ws-button ws-button--rock ws-button--arrow-right ws-button--icon-right no-icon">')
  })

  it('makes a button without a mode a rock one, as kotlinlang.org does', async () => {
    const html = await render('<a href="https://kotlinlang.org/api/core/kotlin-stdlib/" as="button" icon="arrow-right" icon-position="right">Browse API</a>\n', 'kotlin/api-references.md')
    expect(html).toContain('class="ws-button ws-button--rock ws-button--arrow-right ws-button--icon-right no-icon"')
  })

  it("keeps VitePress's external-link arrow off a button that leaves the site", async () => {
    // The arrow is an ::after on links to other sites; it took the place of the
    // download icon on kotlin-pdf. `no-icon` is VitePress's opt-out.
    const html = await render(
      '<a href="https://kotlinlang.org/assets/kotlin-reference.pdf" as="button" mode="classic" icon="download" icon-position="right">下载</a>\n',
      'kotlin/kotlin-pdf.md'
    )
    expect(html).toContain('class="ws-button ws-button--classic ws-button--download ws-button--icon-right no-icon"')
  })

  it('keeps other attributes as written', async () => {
    const html = await render(
      '<a href="kotlin-tour-hello-world.md" as="button" icon="arrow-right" icon-position="right" progress-aware="true" id="kotlin-tour-start-beginner">开始</a>\n',
      'kotlin/kotlin-tour-welcome.md'
    )
    expect(html).toContain('<a href="/kotlin/kotlin-tour-hello-world" progress-aware="true" id="kotlin-tour-start-beginner" class="ws-button ws-button--rock ws-button--arrow-right ws-button--icon-right no-icon">开始</a>')
  })

  it('renders the same from LF and CRLF sources', async () => {
    expect(await render(tourNav.replace(/\n/g, '\r\n'))).toBe(await render(tourNav))
  })

  it('applies on every language of the Writerside docs', async () => {
    const html = await render(tourNav, 'ja/kotlin/kotlin-tour-basic-types.md')
    expect(html).toContain('<a href="/ja/kotlin/kotlin-tour-collections" class="ws-button ws-button--classic')
  })

  it('leaves the other docs alone', async () => {
    const html = await render('<a href="x.md" as="button" mode="classic">X</a>\n', 'koog/index.md')
    expect(html).toContain('as="button"')
    expect(html).not.toContain('ws-button')
  })
})

describe('rewriteButtonLinks', () => {
  it('drops an icon it has no picture for and keeps the button', () => {
    expect(rewriteButtonLinks('<a href="/x" as="button" mode="classic" icon="rocket" icon-position="right">X</a>'))
      .toBe('<a href="/x" class="ws-button ws-button--classic no-icon">X</a>')
  })

  it('puts the icon on the left unless told otherwise, and reads the download icon', () => {
    expect(rewriteButtonLinks('<a as="button" href="/x.pdf" mode="classic" icon="download">PDF</a>'))
      .toBe('<a href="/x.pdf" class="ws-button ws-button--classic ws-button--download ws-button--icon-left no-icon">PDF</a>')
  })

  it('reads single quotes and other spellings, and keeps a class of its own', () => {
    expect(rewriteButtonLinks(`<a\n  href='/x' AS='button' Mode="OUTLINE" class="extra">X</a>`))
      .toBe(`<a href='/x' class="ws-button ws-button--outline no-icon extra">X</a>`)
  })

  it('makes an unknown mode a rock button', () => {
    expect(rewriteButtonLinks('<a href="/x" as="button" mode="tinted">X</a>')).toBe('<a href="/x" class="ws-button ws-button--rock no-icon">X</a>')
  })

  it('leaves other links alone', () => {
    const html = '<a href="/x">X</a> <a href="/y" data-as="button">Y</a> <a href="/z" as="link">Z</a> <abbr as="button">A</abbr>'
    expect(rewriteButtonLinks(html)).toBe(html)
  })
})
