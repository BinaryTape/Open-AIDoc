import { describe, expect, it } from 'vitest'
import { checkTranslation, structureOf, undefinedLeftovers } from '../tools/pipeline/utils/translation-check.mjs'

const section = (n: number) => [
  `## Section ${n}`,
  '',
  `Some prose for section ${n}, see [the guide](guide-${n}.md) and [the API](api-${n}.md).`,
  '',
  '```kotlin',
  `val x${n} = ${n}`,
  '```',
  '',
  `More prose about section ${n}.`,
  '',
].join('\n')

const source = ['[//]: # (title: Guide)', '', 'Intro paragraph.', '', ...[1, 2, 3, 4, 5, 6].map(section)].join('\n')
const faithful = source
  .replace(/Some prose for section (\d)/g, '第 $1 节的说明')
  .replace(/More prose about section (\d)\./g, '关于第 $1 节的更多内容。')

describe('structureOf', () => {
  it('counts Markdown and Writerside forms alike', () => {
    const topic = '<topic><chapter title="A"><code-block lang="kotlin">x</code-block></chapter><a href="b.md">b</a></topic>'
    expect(structureOf(topic)).toMatchObject({ headings: 1, codeBlocks: 1, links: 1 })
    expect(structureOf(source)).toMatchObject({ headings: 6, codeBlocks: 6, links: 12 })
  })

  it('ignores headings inside code blocks', () => {
    expect(structureOf(['```bash', '## not a heading', '```'].join('\n')).headings).toBe(0)
  })
})

describe('checkTranslation', () => {
  it('accepts a complete translation', () => {
    expect(checkTranslation(faithful, source)).toEqual([])
  })

  it('accepts merged paragraphs and a dropped link', () => {
    const merged = faithful.replace('\n\nIntro paragraph.', ' 简介。').replace('[the API](api-1.md)', 'the API')
    expect(checkTranslation(merged, source)).toEqual([])
  })

  it('rejects a summary of the page', () => {
    const summary = '本文介绍了 Guide 的六个部分，包括各节的示例代码和相关链接。'
    expect(checkTranslation(summary, source)).toEqual(expect.arrayContaining(['headings 0/6', 'code blocks 0/6']))
  })

  it('rejects a page cut off halfway', () => {
    const truncated = faithful.slice(0, faithful.indexOf('## Section 4'))
    expect(checkTranslation(truncated, source)).toContain('headings 3/6')
  })

  it('rejects an invented "moved" stub for a Writerside topic', () => {
    const topic = [
      '<topic title="Integrate a database">',
      ...[1, 2, 3, 4].map((n) => `<chapter title="Step ${n}"><code-block lang="kotlin">val a = ${n}</code-block></chapter>`),
      '</topic>',
    ].join('\n')
    const stub = '<topic title="集成数据库"><description>本页面已迁移。</description></topic>'
    expect(checkTranslation(stub, topic)).toEqual(expect.arrayContaining(['headings 0/4', 'code blocks 0/4']))
  })

  it('rejects a code block left open', () => {
    const lastFence = faithful.lastIndexOf('```')
    const open = faithful.slice(0, lastFence) + faithful.slice(lastFence + 3)
    expect(checkTranslation(open, source)).toContain('unclosed code block')
  })

  // kotlin/whatsnew21 in zh-Hans began mid-sentence: its title and first
  // lines were gone, and the page had no H1.
  it('rejects a page that lost its title comment, however little else is missing', () => {
    const headless = faithful.slice(faithful.indexOf('Intro paragraph.'))
    expect(checkTranslation(headless, source)).toEqual(['title comment lost'])
  })

  it('accepts a translated title, and a page that never had a title comment', () => {
    expect(checkTranslation(faithful.replace('(title: Guide)', '(title: 指南)'), source)).toEqual([])
    const untitled = source.replace('[//]: # (title: Guide)\n\n', '')
    expect(checkTranslation(faithful.replace('[//]: # (title: Guide)\n\n', ''), untitled)).toEqual([])
  })
})

// The pipeline once wrote "undefined" for content it could not find (#70);
// published pages from before still show it (P0-13).
describe('undefinedLeftovers', () => {
  const source = [
    '* only the [CIO engine](server-engines.md) is supported',
    '',
    '> Using Ktor in a Kotlin/Native project requires a new memory manager.',
    '{style="note"}',
    '',
    'See <Links href="server-native.topic" summary="Run a server without a JVM.">Native server</Links>',
    'and [](compose-test.md#locales).',
  ].join('\n')

  it.each([
    ['an include that was not found', source.replace(/> Using[^\n]*\n\{style="note"\}/, 'undefined')],
    ['a link summary', source.replace('summary="Run a server without a JVM."', 'summary="undefined"')],
    ['the text of an empty link', source.replace('[](compose-test.md', '[undefined](compose-test.md')],
  ])('counts %s', (_, translated) => {
    expect(undefinedLeftovers(translated, source)).toBe(1)
    expect(checkTranslation(translated, source)).toContain('"undefined" 1')
  })

  it('leaves the word itself alone', () => {
    const word = 'Nullability of generic type parameters is undefined by default.\n\nSanitizers detect undefined behavior.'
    expect(undefinedLeftovers(word, word)).toBe(0)
    // As many placeholders as the source: nothing the pipeline added.
    expect(undefinedLeftovers('undefined', 'undefined')).toBe(0)
  })

  it('ignores code blocks', () => {
    const code = '```javascript\nlet x\nundefined\n```'
    expect(undefinedLeftovers(code, '```javascript\nlet x\n```')).toBe(0)
  })
})
