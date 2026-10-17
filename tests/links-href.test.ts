import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

async function render(markdown: string, relativePath: string) {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

const hrefOf = (html: string, tag: string) => html.match(new RegExp(`<${tag}\\b[^>]*href="([^"]*)"`))?.[1]

// <Links> is a link with a summary tooltip (Link.vue), written by the sync pipeline.
describe('<Links> hrefs', () => {
  it.each([
    ['ktor/server-plugins.md', '/ktor/server-native'],
    ['ja/ktor/server-plugins.md', '/ja/ktor/server-native'],
    ['ko/ktor/server-plugins.md', '/ko/ktor/server-native'],
    ['zh-Hant/ktor/server-plugins.md', '/zh-Hant/ktor/server-native'],
  ])('on %s point to the same language: %s', async (page, expected) => {
    // Was /ktor/server-native in every language: a Japanese page linked to the Chinese one.
    const html = await render('See <Links href="/ktor/server-native" summary="Native server.">native</Links>.', page)
    expect(hrefOf(html, 'Links')).toBe(expected)
  })

  it('reads //slug, written with an empty doc name, as a page of the doc', async () => {
    // Was //server-create-restful-apis: the browser took it for another site.
    const html = await render(
      '<topic title="T">\n<p>See <Links href="//server-create-restful-apis#routes" summary="REST.">REST</Links>.</p>\n</topic>',
      'ja/ktor/server-create-websocket-application.md'
    )
    expect(hrefOf(html, 'Links')).toBe('/ja/ktor/server-create-restful-apis#routes')
  })

  it('handles the KMP pages too', async () => {
    const html = await render('See <Links href="/kmp/get-started" summary="Start.">start</Links>.', 'ja/kmp/multiplatform-intro.md')
    expect(hrefOf(html, 'Links')).toBe('/ja/kmp/get-started')
  })

  it('leaves external links alone', async () => {
    const html = await render(
      'See <Links href="https://ktor.io/docs/x.html" summary="s">x</Links> and <a href="//cdn.example.com/x.js">y</a>.',
      'ja/ktor/server-plugins.md'
    )
    expect(hrefOf(html, 'Links')).toBe('https://ktor.io/docs/x.html')
    expect(hrefOf(html, 'a')).toBe('//cdn.example.com/x.js')
  })
})
