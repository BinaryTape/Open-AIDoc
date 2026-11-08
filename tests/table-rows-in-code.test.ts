import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { codeBlockRanges, processMarkdownContent, replaceOutsideCodeBlocks } from '../tools/pipeline/processors/MarkdownProcessor.mjs'

// As in ktor's server-integrate-database: index.html, expanded into a code
// block of a list item (P3-25)
const HTML_IN_LIST = [
  '2. Replace the current content with the implementation below:',
  '',
  '   ```html',
  '   <table>',
  '       <thead>',
  '       <tr>',
  '           <th>Name</th>',
  '           <th>Priority</th>',
  '       </tr>',
  '       </thead>',
  '   </table>',
  '   ```',
  '',
  '   This is the same SPA that was used in previous tutorials.',
  '',
].join('\n')

describe('table rows in processMarkdownContent', () => {
  let dir: string
  let page: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'rows-'))
    mkdirSync(join(dir, 'topics'))
    page = join(dir, 'topics', 'page.md')
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('leaves a row inside a code block as it is', async () => {
    expect(await processMarkdownContent(page, HTML_IN_LIST)).toBe(HTML_IN_LIST)
  })

  it('leaves a row inside a tilde code block as it is', async () => {
    const md = '~~~html\n<table>\n    <tr>\n        <td>1</td>\n    </tr>\n</table>\n~~~\n'
    expect(await processMarkdownContent(page, md)).toBe(md)
  })

  it('still puts the cells of a row in the text on lines of their own', async () => {
    const md = '<table>\n<tr><td>Name</td>\n    <td>Kind</td></tr>\n</table>\n'
    expect(await processMarkdownContent(page, md)).toBe(
      '<table>\n\n<tr>\n<td>Name</td>\n    <td>Kind</td>\n</tr>\n\n</table>\n'
    )
  })

  it('still handles a row whose cell holds a code block', async () => {
    // As in kmp's multiplatform-compatibility-guide, before the table's code
    // blocks become <code-block> elements
    const md = '<table>\n    <tr>\n<td>\n\n```kotlin\nkotlin {}\n```\n\n</td>\n    </tr>\n</table>\n'
    expect(await processMarkdownContent(page, md)).toBe(
      '<table>\n    \n<tr>\n<td>\n<code-block lang="kotlin" code="kotlin {}"/>\n</td>\n</tr>\n\n</table>\n'
    )
  })

  it('handles the text after a code block again', async () => {
    const md = '```html\n<tr><td>1</td></tr>\n```\n\n<table>\n<tr><td>2</td></tr>\n</table>\n'
    expect(await processMarkdownContent(page, md)).toBe(
      '```html\n<tr><td>1</td></tr>\n```\n\n<table>\n\n<tr>\n<td>2</td>\n</tr>\n\n</table>\n'
    )
  })
})

describe('codeBlockRanges', () => {
  const blocks = (md: string) => codeBlockRanges(md).map(([start, end]) => md.slice(start, end))

  it.each([
    ['a page that opens with a code block', '```\ncode\n```\ntext\n', ['```\ncode\n```']],
    ['two code blocks in a row', 'text\n```\none\n```\n~~~\ntwo\n~~~\n', ['```\none\n```', '~~~\ntwo\n~~~']],
    ['an indented code block', '1. a\n\n   ```html\n   <tr>\n   ```\n', ['   ```html\n   <tr>\n   ```']],
    ['a code block left open', 'text\n```\ncode\n', ['```\ncode\n']],
    ['a shorter fence inside a longer one', '````md\n```\ncode\n```\n````\ntext', ['````md\n```\ncode\n```\n````']],
    ['a fence of the other kind inside', '```\n~~~\n```\ntext', ['```\n~~~\n```']],
    ['a fence with an info string inside', '```\n```kotlin\n```\ntext', ['```\n```kotlin\n```']],
  ])('finds %s', (_, md, expected) => {
    expect(blocks(md)).toEqual(expected)
  })
})

describe('replaceOutsideCodeBlocks', () => {
  it('replaces the matches of the text only', () => {
    expect(replaceOutsideCodeBlocks('x\n```\nx\n```\nx', /x/g, () => 'y')).toBe('y\n```\nx\n```\ny')
  })

  it('passes the groups on', () => {
    expect(replaceOutsideCodeBlocks('<a>1</a>', /<a>(\d)<\/a>/g, (_, digit) => digit)).toBe('1')
  })
})
