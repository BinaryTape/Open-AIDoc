import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// A page has one title. Writerside topics bring their own; other docs get one
// from frontmatter or the sidebar when they have no `# ` heading.
let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

const render = (markdown: string, relativePath: string) =>
  md.renderAsync(markdown, { relativePath, cleanUrls: true })

const titles = (html: string) => (html.match(/<h1[\s>]|<TopicTitle\b/g) ?? []).length

describe('page titles', () => {
  for (const docType of ['ktor', 'kmp', 'kotlin']) {
    it(`uses the title comment of a ${docType} topic once`, async () => {
      const html = await render('[//]: # (title: 压缩)\n\nText.\n', `${docType}/server-compression.md`)
      expect(titles(html)).toBe(1)
      expect(html).toMatch(/<h1[^>]*>压缩/)
    })
  }

  it('uses a labelled title comment once, as a TopicTitle', async () => {
    const html = await render('[//]: # (title: 压缩)\n\n<primary-label ref="server-plugin"/>\n\nText.\n', 'ktor/server-compression.md')
    expect(titles(html)).toBe(1)
    expect(html).toContain('<TopicTitle labelRef="server-plugin" title="压缩"/>')
  })

  it('adds no heading to a <topic>, which renders its own title', async () => {
    const html = await render('<topic id="FAQ" title="常见问题解答">\n<p>Text.</p>\n</topic>\n', 'ktor/FAQ.md')
    expect(titles(html)).toBe(0)
  })

  it('adds a title to other docs that have no heading', async () => {
    const html = await render('---\ntitle: Quickstart\n---\n\nText.\n', 'koog/quickstart.md')
    expect(titles(html)).toBe(1)
    expect(html).toMatch(/<h1[^>]*>Quickstart/)
  })

  it('keeps the heading of other docs that have one', async () => {
    const html = await render('# Overview\n\nText.\n', 'sqldelight/index.md')
    expect(titles(html)).toBe(1)
  })
})
