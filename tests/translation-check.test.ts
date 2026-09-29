import { describe, expect, it } from 'vitest'
import { checkTranslation, structureOf } from '../tools/pipeline/utils/translation-check.mjs'

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
})
