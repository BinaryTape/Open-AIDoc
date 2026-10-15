import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

async function render(markdown: string, relativePath = 'kotlin/ksp-quickstart.md') {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

/** A comment shown as text, or as the `//` link a leaked `[//]` becomes. */
const leaked = (html: string) => /\[\/\/\]: #|\/\/<\/a>: #/.test(html)
/** The text of the code blocks, without Shiki's highlighting spans. */
const codeText = (html: string) =>
  [...html.matchAll(/<code>([\s\S]*?)<\/code>/g)].map(m => m[1].replace(/<[^>]+>/g, '')).join('\n')

describe('Markdown comments', () => {
  // Each one rendered as page text before: none is a valid link reference definition.
  it.each([
    ['parentheses in the text', '[//]: # (description: Add a processor based on Kotlin Symbol Processing (KSP).)'],
    ['a call in backticks', '[//]: # (description: Use Lincheck\'s `runConcurrentTest()` function.)'],
    ['a period after it', '[//]: # (TODO KT-85415: see Standalone runtimes).'],
    ['a full-width period after it', '[//]: # (TODO KT-85415: 請參閱獨立執行時 (Standalone runtimes))。'],
    ['escaped parentheses', '[//]: # (Select expression \\(experimental\\) \\( more)'],
  ])('hides a comment with %s', async (_, comment) => {
    const html = await render(`# Title\n\n${comment}\n\nText.`)
    expect(leaked(html)).toBe(false)
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

  it('handles CRLF line endings', async () => {
    const html = await render('A\r\n\r\n[//]: # (x (y))\r\n[//]: # ()\r\n\r\nB')
    expect(html.trim()).toBe('<p>A</p>\n<p>B</p>')
  })

  it('hides comments in list items and blockquotes', async () => {
    expect(await render('- item\n\n  [//]: # (hidden (x))\n\n  more')).not.toContain('hidden')
    expect(await render('> a\n>\n> [//]: # (hidden (x))\n>\n> b')).not.toContain('hidden')
  })

  // A comment in a code sample is code: markdown-it settles fences before this rule runs.
  it.each([
    ['a fence', '```markdown\n[//]: # (example)\n```'],
    ['a tilde fence', '~~~\n[//]: # (example)\n~~~'],
    ['a fence that opens on a list item\'s first line', '- ```markdown\n  [//]: # (example)\n  ```'],
    ['a fence holding an indented fence line', '```markdown\n    ```\n[//]: # (example)\n```'],
    ['an indented code block', 'Text.\n\n    [//]: # (example)'],
  ])('keeps a comment in %s', async (_, src) => {
    expect(codeText(await render(src))).toContain('[//]: # (example)')
  })

  it('leaves text that does not close cleanly to the other rules', async () => {
    // Unbalanced, crossing a blank line, or followed by more text: not a comment.
    expect(await render('[//]: # (a ( b')).toContain('[//]: # (a ( b')
    expect(await render('[//]: # (a\n\nb)')).toContain('[//]: # (a')
    expect(await render('[//]: # (a) and more text')).toContain('and more text')
  })

  it('does not touch a comment that does not start a block', async () => {
    expect(await render('Text [//]: # (x)')).toContain('Text [//]: # (x)')
  })

  it('still turns the title comment into the heading', async () => {
    const html = await render('[//]: # (title: Getting started with KSP (Kotlin))\n[//]: # (description: About (KSP).)\n\nText.')
    expect(html).toMatch(/^<h1 [^>]*>Getting started with KSP \(Kotlin\) <a class="header-anchor"/)
    expect(leaked(html)).toBe(false)
  })

  it('leaves comments that already rendered as nothing unchanged in the output', async () => {
    // Koog's comments are valid reference definitions: hidden before and after.
    const src = 'Text.\n\n[//]: # (You can also run tools directly:)\n[//]: # (val registry = provider&#40;&#41;)\n\nMore.'
    const html = await render(src, 'koog/model-context-protocol.md')
    expect(html).toBe(await render(src.replace(/^\[\/\/\].*\n/gm, ''), 'koog/model-context-protocol.md'))
  })
})
