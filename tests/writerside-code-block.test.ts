import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { normalizeCode } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-code-block'

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

// The production build runs on LF sources, the Windows checkout has CRLF:
// both must give the same page, and the page must compile as a Vue template.
async function render(markdown: string, relativePath = 'ktor/server-websockets.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  return lf
}

// The code as it shows on the page, without the highlighting markup.
const codeText = (html: string) => [...html.matchAll(/<pre\b[\s\S]*?<\/pre>/g)]
  .map((m) => m[0].replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x3C;/g, '<').replace(/&amp;/g, '&'))

describe('Writerside <code-block> tags', () => {
  it('render as highlighted code blocks, inside the HTML around them', async () => {
    const html = await render([
      '<deflist>',
      '    <def title="Trailing commas">',
      '        <p>A comma after the last item:</p>',
      '        <code-block lang="Kotlin" code="val list = listOf(&#10;    &quot;a&quot;,&#10;)"/>',
      '    </def>',
      '</deflist>',
      '',
    ].join('\n'))
    expect(html).not.toContain('<code-block')
    // The same markup as a fence: label, copy button, Shiki highlighting.
    expect(html).toMatch(/<def title="Trailing commas">\s*<p>A comma after the last item:<\/p>\s*<div class="language-kotlin[" ]/)
    expect(html).toContain('<span class="lang">kotlin</span>')
    expect(html).toMatch(/<pre class="shiki shiki-themes [^"]*"[^>]*v-pre/)
    expect(codeText(html)).toEqual(['val list = listOf(\n    "a",\n)'])
    expect(html).toMatch(/<\/div>\s*<\/def>\s*<\/deflist>/)
  })

  it('take the code between the tags, with the indentation of the page removed', async () => {
    const html = await render([
      '<procedure>',
      '    <step>',
      '        <code-block lang="xml">',
      '            <![CDATA[',
      '            <dependency>',
      '                <artifactId>ktor-server-core</artifactId>',
      '            </dependency>',
      '            ]]>',
      '        </code-block>',
      '    </step>',
      '</procedure>',
      '',
    ].join('\n'))
    expect(html).not.toContain('<code-block')
    expect(codeText(html)).toEqual(['<dependency>\n    <artifactId>ktor-server-core</artifactId>\n</dependency>'])
  })

  it('render in a table cell and in tabs', async () => {
    const html = await render([
      '| Name | Description |',
      '|------|-------------|',
      '| `extraOpts` | Options, for example: <code-block lang="Kotlin" code="extraOpts = listOf(&quot;-compiler-option&quot;)"/> |',
      '',
      '<Tabs group="build-script">',
      '<TabItem title="Gradle (Groovy)" group-key="groovy">',
      '',
      '<code-block lang="Groovy" code="implementation &quot;io.ktor:ktor-server-core:$ktor_version&quot;"/>',
      '',
      '</TabItem>',
      '</Tabs>',
      '',
    ].join('\n'))
    expect(html).not.toContain('<code-block')
    expect(html).toMatch(/<td>Options, for example: <div class="language-kotlin[" ]/)
    expect(codeText(html)).toEqual(['extraOpts = listOf("-compiler-option")', 'implementation "io.ktor:ktor-server-core:$ktor_version"'])
  })

  it('take the Writerside code block attributes', async () => {
    const html = await render('<code-block lang="kotlin" collapsible="true" collapsed-title-line-number="2" code="import a&#10;fun main() {&#10;}"/>\n')
    expect(html).toMatch(/^<details class="ws-code-collapse" open><summary class="ws-code-collapse__summary" v-pre>fun main\(\) \{ \{\.\.\.\}<\/summary><div class="language-kotlin/)
  })

  it('compare side by side', async () => {
    const html = await render([
      '<compare first-title="2.2.x" second-title="3.0.x">',
      '<code-block lang="kotlin" code="val a = 1"/>',
      '<code-block lang="kotlin" code="val b = 2"/>',
      '</compare>',
      '',
    ].join('\n'), 'ktor/migrating-3.md')
    expect(html).toMatch(/<div class="ws-compare__title" v-pre>2\.2\.x<\/div><div class="language-kotlin/)
    expect(codeText(html)).toEqual(['val a = 1', 'val b = 2'])
  })

  it('keep code that looks like Markdown or a Vue template as it is', async () => {
    const html = await render('<tabs>\n<tab title="A">\n<code-block lang="kotlin" code="val s = &quot;**{{ name }}** `x` &lt;b&gt;&quot;"/>\n</tab>\n</tabs>\n')
    expect(codeText(html)).toEqual(['val s = "**{{ name }}** `x` <b>"'])
  })
})

describe('normalizeCode', () => {
  it('drops the blank lines around the code and its common indentation', () => {
    expect(normalizeCode('\n  \n    a\n      b\n\n    c\n  \n')).toBe('a\n  b\n\nc')
    expect(normalizeCode('a\n  b')).toBe('a\n  b')
    expect(normalizeCode('')).toBe('')
  })
})
