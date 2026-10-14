import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import Chapter from '../docs/.vitepress/component/Chapter.vue'
import { parseTitleComment } from '../docs/.vitepress/utils/title-comment'

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

  it('keeps parentheses in the title', async () => {
    const html = await render('[//]: # (title: 列挙型クラス (Enum classes))\n\nText.\n', 'kotlin/enum-classes.md')
    expect(html).toMatch(/<h1[^>]*>列挙型クラス \(Enum classes\) /)
    // With parentheses the comment is no valid Markdown comment: it must not show.
    expect(html).not.toContain('[//]')
  })

  it('unescapes parentheses in the title', async () => {
    const html = await render('[//]: # (title: Select 표현식 \\(실험적\\))\n\nText.\n', 'kotlin/select-expression.md')
    expect(html).toMatch(/<h1[^>]*>Select 표현식 \(실험적\) /)
  })

  it('escapes a labelled title for its attribute', async () => {
    const html = await render('[//]: # (title: The "Ktor" \\(beta\\) plugin)\n\n<primary-label ref="server-plugin"/>\n', 'ktor/x.md')
    expect(html).toContain('<TopicTitle labelRef="server-plugin" title="The &quot;Ktor&quot; (beta) plugin"/>')
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

describe('Writerside chapters', () => {
  it('take their heading level from nesting, below the page title', async () => {
    const chapter = (title: string, children?: () => unknown) => h(Chapter, { title, id: title.toLowerCase() }, children)
    const html = await renderToString(createSSRApp(() => h('div', [
      chapter('Prepare', () => [chapter('Build', () => [chapter('Run')]), chapter('Test')]),
      chapter('Deploy'),
    ])))
    const headings = [...html.matchAll(/<(h\d) id="(\w+)"/g)].map((m) => `${m[1]} ${m[2]}`)
    expect(headings).toEqual(['h2 prepare', 'h3 build', 'h4 run', 'h3 test', 'h2 deploy'])
  })
})

describe('title comments', () => {
  it('read to the last parenthesis, without Markdown escapes', () => {
    expect(parseTitleComment('[//]: # (title: Strings)\n\nText.')).toBe('Strings')
    expect(parseTitleComment('[//]: # (title: イディオム (Idioms))')).toBe('イディオム (Idioms)')
    expect(parseTitleComment('[//]: # (title: Select 표현식 \\(실험적\\))\r\n')).toBe('Select 표현식 (실험적)')
    expect(parseTitleComment('# Heading\n')).toBeNull()
  })
})
