import { describe, expect, it } from 'vitest'
import {
  applySourceAnchors,
  headingAnchor,
  listHeadings,
} from '../tools/pipeline/utils/heading-anchors.mjs'

describe('headingAnchor', () => {
  it.each([
    ['Declare strings', 'declare-strings'],
    ['Multi-dollar string interpolation', 'multi-dollar-string-interpolation'],
    ['Extract parts of a string', 'extract-parts-of-a-string'],
    ['Nullable values in string templates', 'nullable-values-in-string-templates'],
  ])('matches the upstream anchor for %s', (text, anchor) => {
    expect(headingAnchor(text)).toBe(anchor)
  })

  it('ignores inline markup the anchor never contained', () => {
    expect(headingAnchor('Use `is` and `!is` operators')).toBe('use-is-and-is-operators')
    expect(headingAnchor('**Bold** and [linked](page.md) words')).toBe('bold-and-linked-words')
  })

  it('has no anchor to offer for a heading without ASCII words', () => {
    expect(headingAnchor('交叉类型')).toBe('')
  })
})

describe('headings that end in braces of their own', () => {
  it.each([
    '-target {es5|es2015|es2020}',
    '-module-kind {umd|commonjs|amd|plain}',
    '-Xcompiler-plugin-order={plugin.before>plugin.after}',
  ])('keeps %s as heading text, not an attribute block', (heading) => {
    const [parsed] = listHeadings(`### ${heading}`)
    expect(parsed.text).toBe(heading)
    expect(parsed.attrs).toBeNull()
  })

  it('still recognises real attribute blocks', () => {
    const md = ['## One {id="one"}', '## Two {#two .wide}', "## Three {data-x='y'}"].join('\n')
    expect(listHeadings(md).map((h) => h.attrs)).toEqual(['id="one"', '#two .wide', "data-x='y'"])
  })

  it('anchors such a heading after its braces instead of inside them', () => {
    const source = '### -Xcompiler-plugin-order={plugin.before>plugin.after}\n\nConfigure the order.'
    const translated = '### -Xcompiler-plugin-order={plugin.before>plugin.after}\n\n配置运行顺序。'
    expect(applySourceAnchors(translated, source).content.split('\n')[0]).toBe(
      '### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}'
    )
  })
})

describe('listHeadings', () => {
  it('skips headings inside fenced code blocks', () => {
    const md = ['# Real', '', '```bash', '# not a heading', '```', '', '## Also real'].join('\n')
    expect(listHeadings(md).map((h) => h.text)).toEqual(['Real', 'Also real'])
  })

  it('is not fooled by a commented-out MkDocs snippet marker', () => {
    const md = ['# --8<-- [start:install]', '', '## Real heading', '', '# --8<-- [end:install]'].join('\n')
    expect(listHeadings(md).map((h) => h.text)).toEqual(['Real heading'])
  })

  it('keeps a shorter fence inside a longer one from ending the block', () => {
    const md = ['````md', '```kotlin', '# OpenAI', '```', '````', '', '## Real'].join('\n')
    expect(listHeadings(md).map((h) => h.text)).toEqual(['Real'])
  })

  it('treats an unterminated fence as swallowing the rest of the file', () => {
    // A closing fence carries no info string, so ```kotlin opens a nested-
    // looking block rather than closing the one above it.
    const md = ['```', '# not a heading', '```kotlin', '## also not a heading'].join('\n')
    expect(listHeadings(md)).toEqual([])
  })

  it('separates a trailing attribute block from the text', () => {
    const [heading] = listHeadings('## Checks {id="is-and-is-operators"}')
    expect(heading.text).toBe('Checks')
    expect(heading.attrs).toBe('id="is-and-is-operators"')
  })
})

describe('applySourceAnchors', () => {
  const source = [
    '[//]: # (title: Strings)',
    '',
    '## Declare strings',
    '',
    'Text.',
    '',
    '### Multiline strings',
  ].join('\n')

  it('stamps the upstream anchor onto every translated heading', () => {
    const translated = ['# 字符串', '', '## 声明字符串', '', '文本。', '', '### 多行字符串'].join('\n')
    // The source title comment is not an ATX heading, so the translated H1 has
    // no counterpart and the documents would not pair — drop it for this case.
    const { content, added, skipped } = applySourceAnchors(
      translated.replace('# 字符串\n\n', ''),
      source
    )

    expect(skipped).toBeNull()
    expect(added).toBe(2)
    expect(content).toContain('## 声明字符串 {id="declare-strings"}')
    expect(content).toContain('### 多行字符串 {id="multiline-strings"}')
  })

  it('prefers the anchor the upstream author pinned by hand', () => {
    const { content } = applySourceAnchors(
      '## 使用 `is` 操作符',
      '## Checks with `is` {id="is-and-is-operators"}'
    )
    expect(content).toBe('## 使用 `is` 操作符 {id="is-and-is-operators"}')
  })

  it('leaves a heading that already carries an id alone', () => {
    const { content, added } = applySourceAnchors(
      '## 声明字符串 {id="kept"}',
      '## Declare strings'
    )
    expect(added).toBe(0)
    expect(content).toBe('## 声明字符串 {id="kept"}')
  })

  it('merges the id into an existing attribute block', () => {
    const { content } = applySourceAnchors(
      '## 声明字符串 {style="note"}',
      '## Declare strings'
    )
    expect(content).toBe('## 声明字符串 {style="note" id="declare-strings"}')
  })

  it('gives a repeated anchor to the first heading only', () => {
    const { content, added } = applySourceAnchors(
      '## 注解\n\n## 注解',
      '## Annotations\n\n## Annotations'
    )
    expect(added).toBe(1)
    expect(content).toBe('## 注解 {id="annotations"}\n\n## 注解')
  })

  it('does not reuse an id the translation already pins', () => {
    const { added } = applySourceAnchors(
      '## 甲 {id="annotations"}\n\n## 乙',
      '## Something\n\n## Annotations'
    )
    expect(added).toBe(0)
  })

  it('leaves the H1 alone so the page title stays clean', () => {
    const { content, added } = applySourceAnchors('# 概览\n\n## 用法', '# Overview\n\n## Usage')
    expect(added).toBe(1)
    expect(content).toBe('# 概览\n\n## 用法 {id="usage"}')
  })

  it('leaves the anchor the page title will claim', () => {
    // The pipeline renders `[//]: # (title: Sequence)` as an H1, so `sequence`
    // is taken before any heading is stamped.
    const { added } = applySourceAnchors(
      '[//]: # (title: Sequence)\n\n### Sequence',
      '[//]: # (title: Sequence)\n\n### Sequence'
    )
    expect(added).toBe(0)
  })

  it('refuses to guess when the documents disagree on structure', () => {
    // Heading levels repeat, so a dropped heading cannot be located by level
    // alone — pairing on anyway would shift every anchor after it.
    expect(applySourceAnchors('## 一\n\n## 二', '## One').skipped).toMatch(/heading count differs/)
    expect(applySourceAnchors('### 一', '## One').skipped).toMatch(/heading level differs/)
  })
})
