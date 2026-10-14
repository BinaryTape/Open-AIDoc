import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// The production build runs on Linux with LF sources; the Windows checkout has
// CRLF. Every case renders both and expects the same page.
let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

async function render(markdown: string, relativePath = 'kotlin/page.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  return lf
}

describe('Writerside callouts', () => {
  it('turns a styled blockquote into a callout', async () => {
    const html = await render('> Read this.\n{style="note"}\n\nAfter.')
    expect(html).toContain('<div class="ws-callout ws-callout--note ws-callout--green" role="note" aria-label="注意">')
    expect(html).toContain('<p>Read this.</p>')
    expect(html).toContain('<p>After.</p>')
    expect(html).not.toContain('{style')
    expect(html).not.toContain('<blockquote')
  })

  it('accepts the style as the last line of the blockquote', async () => {
    const html = await render('> Read this.\n>\n> {style="warning"}\n')
    expect(html).toContain('ws-callout--warning ws-callout--red')
    expect(html).not.toContain('{style')
  })

  it('accepts type= and other attributes, and keeps the id', async () => {
    const html = await render('> One.\n{type="tip"}\n\n> Two.\n{id="newmm-note" style="note"}\n')
    expect(html).toContain('ws-callout--tip')
    expect(html).toContain('<div id="newmm-note" class="ws-callout ws-callout--note')
  })

  it('keeps the paragraphs of a multi-paragraph callout apart', async () => {
    const html = await render('> First.\n>\n> Second\n> line.\n{style="note"}\n')
    expect(html).toContain('<p>First.</p>')
    expect(html).toContain('<p>Second\nline.</p>')
  })

  it('renders Markdown inside the callout', async () => {
    const html = await render('> Text:\n>\n> - item\n>\n> ```kotlin\n> val a = 1\n> ```\n{style="tip"}\n')
    expect(html).toContain('<li>item</li>')
    expect(html).toContain('language-kotlin')
    expect(html).not.toContain('{style')
  })

  it('handles a callout nested in a list item', async () => {
    const html = await render('1. Step.\n\n   > Careful.\n   {style="warning"}\n\n2. Next.\n')
    expect(html).toMatch(/<li>[\s\S]*ws-callout--warning[\s\S]*<p>Careful\.<\/p>[\s\S]*<\/li>/)
    expect(html).toContain('<p>Next.</p>')
  })

  it('renders a blockquote without a style as a tip', async () => {
    const html = await render('> **Issue**: KT-1\n>\n> **Component**: JVM\n')
    expect(html).toContain('<div class="ws-callout ws-callout--tip ws-callout--neutral" role="note" aria-label="提示">')
    expect(html).not.toContain('<blockquote')
  })

  it('leaves a blockquote with a non-callout style alone', async () => {
    const html = await render('> Text.\n{style="none"}\n')
    expect(html).not.toContain('ws-callout--none')
    expect(html).not.toContain(':::')
  })

  it('does not touch blockquote syntax in code blocks', async () => {
    const html = await render('```text\n> Task :compileKotlin\n{style="note"}\n```\n')
    expect(html).not.toContain('ws-callout')
    expect(html).toContain('Task :compileKotlin')
  })

  it('uses the ktor.io colours on Ktor pages', async () => {
    const html = await render('> A.\n{style="note"}\n\n> B.\n', 'ktor/page.md')
    expect(html).toContain('ws-callout--note ws-callout--yellow')
    expect(html).toContain('ws-callout--tip ws-callout--green')
  })

  it('treats Kotlin Multiplatform pages as Writerside', async () => {
    const html = await render('> A.\n{style="tip"}\n', 'kmp/page.md')
    expect(html).toContain('ws-callout--tip ws-callout--neutral')
  })

  it('labels the callout in the page language', async () => {
    const html = await render('> A.\n{style="note"}\n', 'ja/kotlin/page.md')
    expect(html).toContain('aria-label="注記"')
  })

  it('keeps plain blockquotes on non-Writerside pages', async () => {
    for (const path of ['koin/page.md', 'koog/page.md']) {
      const html = await render('> Quote.\n', path)
      expect(html).toContain('<blockquote>')
      expect(html).not.toContain('ws-callout')
    }
  })
})
