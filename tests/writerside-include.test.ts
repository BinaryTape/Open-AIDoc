import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  expandIncludes,
  expandIncludesForTask,
  findElement,
  findIncludes,
  includingPages,
} from '../tools/pipeline/utils/writerside-include.mjs'

const md = (...lines: string[]) => lines.join('\n')

/** Expand `page` against a set of pages; returns the result and the failures. */
function expand(pages: Record<string, string>, page = 'page.md') {
  const unresolved: { file: string; from: string; elementId: string; reason: string }[] = []
  const content = expandIncludes(pages[page], page, (name: string) => pages[name] ?? null, unresolved)
  return { content, unresolved }
}

describe('findIncludes', () => {
  it('reads attributes in any order and spacing', () => {
    const includes = findIncludes(md(
      '<include from="a.md" element-id="x"/>',
      '<include element-id="y" use-filter="empty,beginner" from="b.md"/>',
      '<include from ="c.md" element-id="z"/>',
    ))
    expect(includes.map((i: any) => [i.from, i.elementId, i.filters])).toEqual([
      ['a.md', 'x', null],
      ['b.md', 'y', ['empty', 'beginner']],
      ['c.md', 'z', null],
    ])
  })

  it('reads variables given to an include', () => {
    const [include] = findIncludes(md(
      '<include from="a.md" element-id="x">',
      '<var name="id4" value="language-x"/>',
      '</include>',
    ))
    expect(include.vars).toEqual({ id4: 'language-x' })
  })

  it('ignores includes in code blocks and comments, and Maven <include> elements', () => {
    expect(findIncludes(md(
      '```xml',
      '<include from="a.md" element-id="x"/>',
      '```',
      '<!-- <include element-id="all" from="all.topic"/> -->',
      '<includes>',
      '    <include>packages.md</include>',
      '</includes>',
    ))).toEqual([])
  })
})

describe('findElement', () => {
  it('takes the content of a snippet, and other elements whole', () => {
    const page = md(
      '<snippet id="s">',
      'Snippet text.',
      '</snippet>',
      '<chapter title="Setup" id="c">',
      '<p>Chapter text.</p>',
      '</chapter>',
    )
    expect(findElement(page, 's').trim()).toBe('Snippet text.')
    expect(findElement(page, 'c')).toBe('<chapter title="Setup" id="c">\n<p>Chapter text.</p>\n</chapter>')
  })

  it('matches the closing tag of nested elements of the same name', () => {
    const page = md('<tab id="t">', '<tab id="inner">A</tab>', 'B', '</tab>', 'after')
    expect(findElement(page, 't')).toBe('<tab id="t">\n<tab id="inner">A</tab>\nB\n</tab>')
  })

  it('takes a heading with its section, subsections included', () => {
    const page = md(
      '## Add dependencies {id="add_dependencies"}',
      '',
      'Text.',
      '',
      '### Gradle',
      '',
      '```kotlin',
      '## not a heading',
      '```',
      '',
      '## Next section',
    )
    expect(findElement(page, 'add_dependencies')).toBe(page.split('\n## Next section')[0].trimEnd())
  })

  it('takes the block an attribute line belongs to', () => {
    const page = md(
      'Intro.',
      '',
      '> A note',
      '> on two lines.',
      '>',
      '{style="note" id="n"}',
      '',
      '```kotlin',
      'val x = 1',
      '',
      'val y = 2',
      '```',
      '{id="code"}',
    )
    expect(findElement(page, 'n')).toBe('> A note\n> on two lines.\n>\n{style="note" id="n"}')
    expect(findElement(page, 'code')).toBe('```kotlin\nval x = 1\n\nval y = 2\n```\n{id="code"}')
  })

  it('returns null for an unknown id', () => {
    expect(findElement('# Title\n\nText.', 'missing')).toBeNull()
  })
})

describe('expandIncludes', () => {
  it('replaces an include with a snippet of another page, at its indentation', () => {
    const { content, unresolved } = expand({
      'page.md': md('<tabs>', '    <include from="lib.topic" element-id="s"/>', '</tabs>'),
      'lib.topic': md('<topic>', '    <snippet id="s">', '        <p>One</p>', '        <p>Two</p>', '    </snippet>', '</topic>'),
    })
    expect(content).toBe(md('<tabs>', '    <p>One</p>', '    <p>Two</p>', '</tabs>'))
    expect(unresolved).toEqual([])
  })

  it('expands includes inside included content', () => {
    const { content } = expand({
      'page.md': '<include from="a.md" element-id="a"/>',
      'a.md': md('<snippet id="a">', 'A then:', '<include from="b.md" element-id="b"/>', '</snippet>'),
      'b.md': md('<snippet id="b">', 'B.', '</snippet>'),
    })
    expect(content).toBe('A then:\nB.')
  })

  it('includes from the page itself', () => {
    const { content } = expand({
      'page.md': md('<snippet id="s">', 'Shared.', '</snippet>', '', '## Again', '', '<include from="page.md" element-id="s"/>'),
    })
    expect(content).toBe(md('<snippet id="s">', 'Shared.', '</snippet>', '', '## Again', '', 'Shared.'))
  })

  it('applies the variables of the include over the snippet\'s own', () => {
    const { content } = expand({
      'page.md': md(
        '<snippet id="s">',
        '<var name="id4" value="name-based-destructuring"/>',
        '<var name="other" value="kept"/>',
        '### Name-based destructuring {id="%id4%"}',
        '%other%',
        '</snippet>',
        '',
        '<include from="page.md" element-id="s">',
        '<var name="id4" value="language-name-based-destructuring"/>',
        '</include>',
      ),
    })
    expect(content.split('\n').slice(7)).toEqual([
      '<var name="other" value="kept"/>',
      '### Name-based destructuring {id="language-name-based-destructuring"}',
      '%other%',
    ])
  })

  it('keeps only the elements matching use-filter, and those without a filter', () => {
    const { content } = expand({
      'page.md': md(
        '<snippet id="rows">',
        '<table>',
        '<tr><td>Header</td></tr>',
        '<tr filter="beginner">',
        '<td>Basics</td>',
        '</tr>',
        '<tr filter="advanced">',
        '<td>Internals</td>',
        '</tr>',
        '</table>',
        '</snippet>',
        '<include element-id="rows" use-filter="empty,beginner" from="page.md"/>',
      ),
    })
    expect(content.split('</snippet>\n')[1]).toBe(md(
      '<table>',
      '<tr><td>Header</td></tr>',
      '<tr filter="beginner">',
      '<td>Basics</td>',
      '</tr>',
      '</table>',
    ))
  })

  it('leaves an unresolvable include in place and reports it, never "undefined"', () => {
    const { content, unresolved } = expand({
      'page.md': md('<include from="gone.md" element-id="x"/>', '<include from="a.md" element-id="missing"/>'),
      'a.md': '# A',
    })
    expect(content).toBe(md('<include from="gone.md" element-id="x"/>', '<include from="a.md" element-id="missing"/>'))
    expect(unresolved.map((u) => u.reason)).toEqual(['page not found', 'element not found'])
  })

  it('stops at an include cycle', () => {
    const { content, unresolved } = expand({
      'page.md': '<include from="a.md" element-id="a"/>',
      'a.md': md('<snippet id="a">', 'A', '<include from="a.md" element-id="a"/>', '</snippet>'),
    })
    expect(content).toBe('A\n<include from="a.md" element-id="a"/>')
    expect(unresolved).toEqual([{ file: 'page.md', from: 'a.md', elementId: 'a', reason: 'include cycle' }])
  })
})

describe('includes across a directory', () => {
  let dir: string
  const write = (name: string, content: string) => writeFileSync(join(dir, name), content)
  const read = (name: string) => readFileSync(join(dir, name), 'utf8')

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'includes-'))
    write('lib.topic', '<topic><snippet id="s"><p>Shared</p></snippet></topic>')
    write('uses-lib.md', md('# Uses lib', '', '<include from="lib.topic" element-id="s"/>'))
    write('uses-page.md', md('# Uses page', '', '<include from="uses-lib.md" element-id="x"/>'))
    write('alone.md', '# Alone')
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('finds the pages including a changed page, through other pages too', () => {
    expect(includingPages(dir, ['lib.topic'])).toEqual(['uses-lib.md', 'uses-page.md'])
    expect(includingPages(dir, ['alone.md'])).toEqual([])
  })

  it('adds them to the task and expands every page', () => {
    write('uses-lib.md', md('# Uses lib', '', '<include from="lib.topic" element-id="s"/>', '', 'More.', '{id="x"}'))
    const task = { files: ['topics/lib.topic'] }

    const unresolved = expandIncludesForTask(task, dir, 'topics')

    expect(task.files).toEqual(['topics/lib.topic', 'topics/uses-lib.md', 'topics/uses-page.md'])
    expect(read('uses-lib.md')).toBe(md('# Uses lib', '', '<p>Shared</p>', '', 'More.', '{id="x"}'))
    expect(read('uses-page.md')).toBe(md('# Uses page', '', 'More.', '{id="x"}'))
    expect(unresolved).toEqual([])
  })
})
