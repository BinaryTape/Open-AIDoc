import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { parseCodeBlockAttrs } from '../docs/.vitepress/utils/code-block-attrs'
import { synopsis } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-collapsible-code'

async function render(markdown: string) {
  const md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
  return md.renderAsync(markdown, { relativePath: 'kotlin/kotlin-tour-basic-types.md', cleanUrls: true })
}

const block = (attrs: string, code = 'fun main() {\n    println("Hi")\n}') => `\`\`\`kotlin\n${code}\n\`\`\`\n${attrs}\n`

describe('parseCodeBlockAttrs', () => {
  it('reads the attributes of a {…} line', () => {
    expect(parseCodeBlockAttrs('{collapsible="true" collapsed-title="Example solution" id="x"}')).toEqual({
      collapsible: 'true', 'collapsed-title': 'Example solution', id: 'x',
    })
  })

  it('keeps braces and spaces inside values', () => {
    expect(parseCodeBlockAttrs('{collapsed-title="fun f() { … }"}')).toEqual({ 'collapsed-title': 'fun f() { … }' })
  })

  it('returns null for anything else', () => {
    expect(parseCodeBlockAttrs('{ "json": 1 }')).toBeNull()
    expect(parseCodeBlockAttrs('Text {collapsible="true"}')).toBeNull()
  })
})

describe('synopsis', () => {
  const code = 'import x\n\n// Message.kt\nclass Message'
  it('uses the collapsed title, else line N, else the first line', () => {
    expect(synopsis(code, { 'collapsed-title': 'Example solution' })).toBe('Example solution {...}')
    expect(synopsis(code, { 'collapsed-title-line-number': '3' })).toBe('// Message.kt {...}')
    expect(synopsis('\n  // DemoApplication.kt\nclass App', {})).toBe('// DemoApplication.kt {...}')
  })
})

describe('collapsible code blocks', () => {
  it('folds the example solution of an exercise', async () => {
    // Was shown in full right under the exercise.
    const html = await render(block('{initial-collapse-state="collapsed" collapsible="true" collapsed-title="参考解答" id="solution"}'))
    expect(html).toMatch(/^<details class="ws-code-collapse" id="solution"><summary class="ws-code-collapse__summary" v-pre>参考解答 \{\.\.\.\}<\/summary><div class="language-kotlin/)
    expect(html).not.toContain(' open')
    expect(html).toContain('</div></details>')
  })

  it('reads the older default-state, and is open without a collapsed state', async () => {
    expect(await render(block('{default-state="collapsed" collapsible="true"}'))).toMatch(/<details class="ws-code-collapse">/)
    expect(await render(block('{collapsible="true"}'))).toMatch(/<details class="ws-code-collapse" open>/)
  })

  it('escapes the summary and keeps Vue off it', async () => {
    const html = await render(block('{collapsible="true"}', 'val s = "{{ name }}" + "<b>"'))
    expect(html).toContain('<summary class="ws-code-collapse__summary" v-pre>val s = &quot;{{ name }}&quot; + &quot;&lt;b&gt;&quot; {...}</summary>')
    expect(parse(`<template><div>${html}</div></template>`).errors).toEqual([])
  })

  it('folds a code block in a list item', async () => {
    const html = await render(`1. Step:\n\n   ${block('{collapsible="true" initial-collapse-state="collapsed"}').replace(/\n(?!$)/g, '\n   ')}`)
    expect(html).toMatch(/<li>[\s\S]*<details class="ws-code-collapse">[\s\S]*<\/details>[\s\S]*<\/li>/)
  })

  it('reads a collapsed title holding braces', async () => {
    // Was cut at the first "}": the rest of the line, `.semantics(…)"}`, showed as a paragraph.
    const html = await render(block('{initial-collapse-state="collapsed" collapsible="true" collapsed-title=".clickable { count += 1 } .semantics(mergeDescendants = true)"}'))
    expect(html).toContain('>.clickable { count += 1 } .semantics(mergeDescendants = true) {...}</summary>')
    expect(html).not.toContain('<p>')
  })

  it('keeps every attribute on the fence token, for runnable code later', async () => {
    const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
    const tokens = md.parse(block('{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="ex"}') + '\nText.\n', {
      relativePath: 'kotlin/kotlin-tour-basic-types.md',
    })
    const fence = tokens.find((t) => t.type === 'fence')!
    expect(fence.meta.wsAttrs).toEqual({ 'kotlin-runnable': 'true', 'kotlin-min-compiler-version': '1.3', id: 'ex' })
    expect(tokens.some((t) => t.type === 'html_block')).toBe(false)
  })

  it('leaves other code blocks as they were, attribute line dropped', async () => {
    const html = await render(block('{kotlin-runnable="true" validate="false"}'))
    expect(html).not.toContain('<details')
    expect(html).not.toContain('kotlin-runnable')
    expect(html).toMatch(/^<div class="language-kotlin/)
  })
})
