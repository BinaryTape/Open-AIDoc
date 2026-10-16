import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

async function render(markdown: string) {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath: 'ktor/server-create-restful-apis.md', cleanUrls: true })
}

const anchors = (html: string) => (html.match(/<a\b/gi) ?? []).length

describe('URLs inside HTML links', () => {
  it('does not linkify the URL text of an HTML link', async () => {
    // Was <a href="…"><a href="…" target="_blank" rel="noreferrer">…</a></a>.
    const html = await render('Go to <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> now.')
    expect(html.trim()).toBe('<p>Go to <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a> now.</p>')
  })

  it.each([
    ['upper case', 'Go to <A HREF="http://x.org/a">http://x.org/a</A> now.'],
    ['attributes on the next line', 'Go to <a\n    href="http://x.org/a">http://x.org/a</a> now.'],
    ['a bare anchor', 'Go to <a>http://x.org/a</a> now.'],
  ])('handles %s', async (_, src) => {
    expect(anchors(await render(src))).toBe(1)
  })

  it('linkifies again after the HTML link closes', async () => {
    const html = await render('<a href="http://x.org/a">http://x.org/a</a> and http://x.org/b and <a href="http://x.org/c">http://x.org/c</a>')
    expect(anchors(html)).toBe(3)
    expect(html).toContain('<a href="http://x.org/b" target="_blank" rel="noreferrer">http://x.org/b</a>')
  })

  it('keeps linkifying URLs outside links', async () => {
    const html = await render('See http://x.org/a, [a link](http://x.org/b) and <http://x.org/c>.')
    expect(anchors(html)).toBe(3)
  })

  it('handles the Writerside topic wrapper', async () => {
    const html = await render(
      '<topic title="T">\n<procedure>\n<step>\n<p>Go to <a href="http://0.0.0.0:8080/tasks">http://0.0.0.0:8080/tasks</a>.</p>\n</step>\n</procedure>\n</topic>'
    )
    expect(anchors(html)).toBe(1)
  })

  it('does not count tags that only start with a', async () => {
    // <abbr> is not a link: the URL after it is still linkified.
    expect(anchors(await render('<abbr title="x">X</abbr> http://x.org/a'))).toBe(1)
  })
})
