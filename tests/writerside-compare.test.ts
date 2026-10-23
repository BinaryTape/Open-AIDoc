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
async function render(markdown: string, relativePath = 'ktor/migrating-3.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  return lf
}

const titles = (html: string) => [...html.matchAll(/<div class="ws-compare__title" v-pre>([^<]*)<\/div>/g)].map((m) => m[1])
const strip = (html: string) => html.replace(/<pre[\s\S]*?<\/pre>/g, '<pre/>').replace(/<button[^>]*><\/button><span class="lang">\w+<\/span>/g, '')

const fences = (open: string) =>
  `${open}\n\n\`\`\`kotlin\nval a = 1\n\`\`\`\n\n\`\`\`kotlin\nval b = 2\n\`\`\`\n\n</compare>\n`
const codeBlocks = (open: string, indent = '') =>
  `${indent}${open}\n${indent}    <code-block lang="kotlin" code="val a = 1"/>\n${indent}    <code-block lang="kotlin" code="val b = 2"/>\n${indent}</compare>\n`

describe('Writerside <compare>', () => {
  it('puts two fences side by side under their titles', async () => {
    // Was the bare <compare> tag around two untitled code blocks, one above the other.
    const html = strip(await render(fences('<compare first-title="2.2.x" second-title="3.0.x">')))
    expect(html).toBe(
      '<div class="ws-compare ws-compare--left-right">\n' +
      '<div class="ws-compare__item"><div class="ws-compare__title" v-pre>2.2.x</div>\n<div class="language-kotlin"><pre/>\n</div>' +
      '</div>\n' +
      '<div class="ws-compare__item"><div class="ws-compare__title" v-pre>3.0.x</div>\n<div class="language-kotlin"><pre/>\n</div>' +
      '</div>\n' +
      '</div>\n'
    )
  })

  it('stacks them for type="top-bottom"', async () => {
    const html = await render(fences('<compare type="top-bottom" first-title="2.x.x" second-title="3.0.x">'))
    expect(html).toContain('<div class="ws-compare ws-compare--top-bottom">')
    expect(titles(html)).toEqual(['2.x.x', '3.0.x'])
  })

  it('wraps <code-block> tags too', async () => {
    const html = await render(codeBlocks('<compare type="top-bottom">'), 'kmp/multiplatform-project-agp-9-migration.md')
    expect(html).toContain(
      '<div class="ws-compare ws-compare--top-bottom">' +
      '<div class="ws-compare__item"><div class="ws-compare__title" v-pre>修改前</div><code-block lang="kotlin" code="val a = 1"/></div>' +
      '<div class="ws-compare__item"><div class="ws-compare__title" v-pre>修改后</div><code-block lang="kotlin" code="val b = 2"/></div>' +
      '</div>'
    )
    expect(html).not.toContain('<compare')
  })

  it('handles a comparison in a list item', async () => {
    const html = await render(`* Change the plugin:\n\n${codeBlocks('<compare type="top-bottom">', '  ')}`, 'kmp/multiplatform-project-agp-9-migration.md')
    expect(html).toMatch(/<li>[\s\S]*<div class="ws-compare ws-compare--top-bottom">[\s\S]*<\/li>/)
  })

  it('names untitled blocks before and after, in the page language', async () => {
    const page = (locale: string) => `${locale}kmp/migrate-from-android.md`
    expect(titles(await render(fences('<compare>'), page('')))).toEqual(['修改前', '修改后'])
    expect(titles(await render(fences('<compare>'), page('zh-Hant/')))).toEqual(['修改前', '修改後'])
    expect(titles(await render(fences('<compare>'), page('ja/')))).toEqual(['変更前', '変更後'])
    expect(titles(await render(fences('<compare>'), page('ko/')))).toEqual(['변경 전', '변경 후'])
    // Left-right is the default.
    expect(await render(fences('<compare>'), page(''))).toContain('ws-compare--left-right')
  })

  it('keeps the titles as text', async () => {
    const html = await render(fences(`<compare first-title="A &amp; &lt;B&gt;" second-title="{{ c }}">`))
    expect(titles(html)).toEqual(['A &amp; &lt;B&gt;', '{{ c }}'])
  })

  it('leaves a comparison without exactly two code blocks alone', async () => {
    const one = '<compare>\n\n```kotlin\nval a = 1\n```\n\n</compare>\n'
    expect(await render(one)).toContain('<compare>')
    const text = '<compare>\n\n```kotlin\nval a = 1\n```\n\nText.\n\n```kotlin\nval b = 2\n```\n\n</compare>\n'
    expect(await render(text)).not.toContain('ws-compare')
  })

  it('leaves the other docs alone', async () => {
    const html = await render(fences('<compare first-title="a" second-title="b">'), 'koog/index.md')
    expect(html).toContain('<compare first-title="a" second-title="b">')
    expect(html).not.toContain('ws-compare')
  })
})
