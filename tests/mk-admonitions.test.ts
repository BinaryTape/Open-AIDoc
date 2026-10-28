import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

// The production build runs on LF sources, the Windows checkout has CRLF:
// both must give the same page, and the page must compile as a Vue template.
async function render(markdown: string, relativePath = 'koog/example.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  return lf
}

const boxes = (html: string) =>
  [...html.matchAll(/<(div|details)( open)? class="mk-admonition mk-admonition--([\w-]+)">\s*(?:<(?:p|summary) class="mk-admonition__title">([^<]*)<)?/g)]
    .map((m) => `${m[1]}${m[2] ?? ''} ${m[3]}: ${m[4] ?? '(no title)'}`)

describe('MkDocs admonitions (Material for MkDocs)', () => {
  it('keeps each type, with its own colour and icon, and the given title', async () => {
    // Were VitePress blocks: note and info both "info", and warning red (the Writerside warning).
    const html = await render([
      '!!! note "Java 实现"', '    A.', '',
      '!!! info "SQLDelight 2.0"', '    B.', '',
      '!!! warning "实验性 API"', '    C.', '',
      '!!! example "Example"', '    D.', '',
      '!!! beta "Beta"', '    E.', '',
    ].join('\n'))
    expect(boxes(html)).toEqual([
      'div note: Java 实现',
      'div info: SQLDelight 2.0',
      'div warning: 实验性 API',
      'div example: Example',
      'div beta: Beta',
    ])
    expect(html).not.toContain('custom-block')
  })

  it.each([
    ['koog/example.md', ['注意', '提示', '警告']],
    ['zh-Hant/koog/example.md', ['注意', '提示', '警告']],
    ['ja/coil/example.md', ['注記', 'ヒント', '警告']],
    ['ko/sqldelight/example.md', ['참고', '팁', '경고']],
  ])('titles a block without a title in the page language (%s)', async (relativePath, titles) => {
    const html = await render('!!! note\n    A.\n\n!!! tip\n    B.\n\n!!! warning\n    C.\n', relativePath)
    expect(boxes(html)).toEqual([`div note: ${titles[0]}`, `div tip: ${titles[1]}`, `div warning: ${titles[2]}`])
  })

  it('reads the type case-insensitively, follows Material aliases, and styles unknown types as notes', async () => {
    // Coil writes `!!! Note`; Material shows a block of an unknown class as a note, titled after it.
    const html = await render('!!! Note\n    A.\n\n!!! hint\n    B.\n\n!!! Notes\n    C.\n')
    expect(boxes(html)).toEqual(['div note: 注意', 'div tip: 提示', 'div note: Notes'])
  })

  it('leaves out the title bar for an empty title', async () => {
    const html = await render('!!! note ""\n    Only the text.\n')
    expect(html).toBe('<div class="mk-admonition mk-admonition--note">\n<p>Only the text.</p>\n</div>\n')
  })

  it('escapes the title', async () => {
    const html = await render('!!! tip "Use <b> & co"\n    A.\n')
    expect(html).toContain('<p class="mk-admonition__title">Use &lt;b&gt; &amp; co</p>')
  })

  it('renders ??? closed and ???+ open, a typeless one as a note', async () => {
    const html = await render([
      '??? tip "Module Versioning"', '    A.', '',
      '???+ note "Prerequisites"', '    - JDK 17', '',
      '??? "OpenAI 模型"', '    | Model | Tools |', '    |---|---|', '    | GPT-4o | ✓ |', '',
    ].join('\n'))
    expect(boxes(html)).toEqual(['details tip: Module Versioning', 'details open note: Prerequisites', 'details note: OpenAI 模型'])
    expect(html).toContain('<summary class="mk-admonition__title">OpenAI 模型</summary>\n<table tabindex="0">')
    expect(html).toContain('<li>JDK 17</li>')
  })

  it('renders Markdown and code inside, and the text after the block outside it', async () => {
    const html = await render([
      '!!! tip', '    Use **this**:', '', '    ```kotlin', '    val x = 1', '    ```', '',
      'After.',
    ].join('\n'))
    expect(html).toMatch(/^<div class="mk-admonition mk-admonition--tip">\n<p class="mk-admonition__title">提示<\/p>\n<p>Use <strong>this<\/strong>:<\/p>\n<div class="language-kotlin">[\s\S]*<\/div><\/div>\n<p>After.<\/p>\n$/)
  })

  it('works inside a list item and inside a content tab', async () => {
    const html = await render([
      '1. Step', '', '    !!! warning', '        Careful.', '',
      '=== "Kotlin"', '', '    !!! note', '        In a tab.', '',
    ].join('\n'))
    expect(boxes(html)).toEqual(['div warning: 警告', 'div note: 注意'])
    expect(html).toMatch(/<li>[\s\S]*mk-admonition--warning[\s\S]*<\/li>/)
    expect(html).toMatch(/ws-tabcontent[\s\S]*mk-admonition--note/)
  })

  it('leaves other documentation alone', async () => {
    const html = await render('!!! note\n    Text.\n', 'kotlin/example.md')
    expect(html).not.toContain('mk-admonition')
  })
})

describe('MkDocs sidebar status (navigation.status)', () => {
  const find = (nodes: any[], link: string): any =>
    nodes.map((n) => (n.link === link ? n : n.items && find(n.items, link))).find(Boolean)

  it('puts a β after the title of a page with status: beta, in the sidebar language', async () => {
    const { default: generateSidebar } = await import('../docs/.vitepress/config/sidebar.config')
    const koog = { path: 'koog/', framework: 'MKDocs', type: 'koog' } as any
    const zh = generateSidebar({ lang: 'zh-Hans' } as any, koog)
    const beta = '<span class="mk-status mk-status--beta" role="img" title="Beta — 实验性 API，未来版本中可能会变化" aria-label="Beta — 实验性 API，未来版本中可能会变化"></span>'
    expect(find(zh, '/koog/model-context-protocol').text).toMatch(new RegExp(`^[^<]+${beta}$`))
    // A group whose overview page is beta.
    expect(find(zh, '/koog/a2a/index').text).toContain('mk-status--beta')
    expect(find(zh, '/koog/quickstart').text).not.toContain('mk-status')

    const ja = generateSidebar({ lang: 'ja' } as any, koog)
    expect(find(ja, '/ja/koog/model-context-protocol').text).toContain('title="Beta — 実験的な API です')
  })

  it('gives plain titles for page headings', async () => {
    const { default: generateSidebar } = await import('../docs/.vitepress/config/sidebar.config')
    const sidebar = generateSidebar({ lang: 'zh-Hans' } as any, { path: 'koog/', framework: 'MKDocs', type: 'koog' } as any, { withStatus: false })
    expect(find(sidebar, '/koog/model-context-protocol').text).not.toContain('<')
  })
})
