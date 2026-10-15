import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { removeMarkdownComments } from '../docs/.vitepress/plugins/markdown/common/markdown-it-remove-comments'

async function render(markdown: string, relativePath = 'kotlin/ksp-quickstart.md') {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

describe('Markdown comments', () => {
  // Each one rendered as page text before: none is a valid link reference definition.
  it.each([
    ['parentheses in the text', '[//]: # (description: Add a processor based on Kotlin Symbol Processing (KSP).)'],
    ['a call in backticks', '[//]: # (description: Use Lincheck\'s `runConcurrentTest()` function.)'],
    ['a period after it', '[//]: # (TODO KT-85415: see Standalone runtimes).'],
    ['a full-width period after it', '[//]: # (TODO KT-85415: 請參閱獨立執行時 (Standalone runtimes))。'],
  ])('hides a comment with %s', async (_, comment) => {
    const html = await render(`# Title\n\n${comment}\n\nText.`)
    expect(html).not.toContain('[//]')
    expect(html).not.toContain('//</a>')
    expect(html).toContain('<p>Text.</p>')
  })

  it('hides a comment spread over several lines of HTML, without nesting paragraphs', async () => {
    const html = await render(
      '[//]: # (<tldr>)\n\n' +
        '[//]: # (<p>\n    <b>Code example</b>:\n    <a href="https://example.com">%example_name%</a>\n</p>)\n\n' +
        '[//]: # (</tldr>)\n\nText.',
      'ktor/graalvm.md'
    )
    expect(html.trim()).toBe('<p>Text.</p>')
  })

  it('handles CRLF line endings', () => {
    expect(removeMarkdownComments('A\r\n\r\n[//]: # (x (y))\r\n\r\nB')).toBe('A\n\n\nB')
  })

  it('ignores escaped parentheses when matching', () => {
    expect(removeMarkdownComments('[//]: # (a \\( b)\nB')).toBe('B')
  })

  it('removes consecutive comments, including empty ones', () => {
    expect(removeMarkdownComments('[//]: # ()\n[//]: # (## Heading {id="h"})\n\nB')).toBe('\nB')
  })

  it('keeps comments inside fenced code', () => {
    const src = '```markdown\n[//]: # (title: Example)\n```\n\n~~~\n[//]: # (x)\n~~~'
    expect(removeMarkdownComments(src)).toBe(src)
  })

  it('keeps text that does not close cleanly', () => {
    // Unbalanced, crossing a blank line, or followed by more text: not a comment.
    for (const src of ['[//]: # (a ( b', '[//]: # (a\n\nb)', '[//]: # (a) and more text']) {
      expect(removeMarkdownComments(src)).toBe(src)
    }
  })

  it('does not touch a comment that does not start the line', () => {
    expect(removeMarkdownComments('Text [//]: # (x)')).toBe('Text [//]: # (x)')
    expect(removeMarkdownComments('    [//]: # (x)')).toBe('    [//]: # (x)')
  })

  it('still turns the title comment into the heading', async () => {
    const html = await render('[//]: # (title: Getting started with KSP (Kotlin))\n[//]: # (description: About (KSP).)\n\nText.')
    expect(html).toMatch(/^<h1 [^>]*>Getting started with KSP \(Kotlin\) <a class="header-anchor"/)
    expect(html).not.toContain('[//]')
  })

  it('leaves comments that already rendered as nothing unchanged in the output', async () => {
    // Koog's comments are valid reference definitions: hidden before and after.
    const src = 'Text.\n\n[//]: # (You can also run tools directly:)\n[//]: # (val registry = provider&#40;&#41;)\n\nMore.'
    const html = await render(src, 'koog/model-context-protocol.md')
    expect(html).toBe(await render(src.replace(/^\[\/\/\].*\n/gm, ''), 'koog/model-context-protocol.md'))
  })
})
