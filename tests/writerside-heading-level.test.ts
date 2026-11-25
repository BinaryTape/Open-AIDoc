import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// kotlinlang.org and ktor.io nest a heading one level below the nearest heading
// above it written shallower: kotlin/faq's `###` questions, right below the
// page title, are h2 there. We showed the level written (P2-39).
describe('markdown-it-ws-heading-level', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  // Each heading as "h<level>#<id>", in order; a chapter as "chapter<base-level>#<id>".
  const headings = (html: string) => [...html.matchAll(/<h([1-6])\b[^>]*\sid="([^"]*)"|<Chapter\b[^>]*?base-level="(\d)"[^>]*?\sid="([^"]*)"/gi)]
    .map((m) => (m[1] ? `h${m[1]}#${m[2]}` : `chapter${m[3]}#${m[4]}`))

  it('nests headings written below the page title one level below it (kotlin/faq)', async () => {
    const html = await render(
      '[//]: # (title: 常见问题解答)\n\n### 什么是 Kotlin？ {id="what-is-kotlin"}\n\nKotlin 是一种开源的静态类型编程语言。\n\n### Kotlin 的当前版本是什么？ {id="what-is-the-current-version-of-kotlin"}\n\n当前发布的版本是 %kotlinVersion%。\n',
      'kotlin/faq.md',
    )
    expect(headings(html)).toEqual(['h1#常见问题解答', 'h2#what-is-kotlin', 'h2#what-is-the-current-version-of-kotlin'])
  })

  it('nests a heading one level below the section it is in (ktor client-websocket-serialization)', async () => {
    const html = await render(
      '## 添加依赖项 {id="add_dependencies"}\n\n在使用序列化之前，您需要添加依赖项。\n\n#### JSON {id="add_json_dependency"}\n\n添加 `ktor-serialization-kotlinx-json`。\n\n#### XML {id="add_xml_dependency"}\n\n添加 `ktor-serialization-kotlinx-xml`。\n\n## 配置序列化器 {id="configure_serializer"}\n\n### JSON 序列化器 {id="register_json"}\n',
      'ktor/client-websocket-serialization.md',
    )
    expect(headings(html)).toEqual(['h2#add_dependencies', 'h3#add_json_dependency', 'h3#add_xml_dependency', 'h2#configure_serializer', 'h3#register_json'])
  })

  it('goes back to the level written when the headings below stop skipping (ktor migrating-3)', async () => {
    const html = await render(
      '## Ktor Server {id="server"}\n\n### 测试 {id="testing"}\n\n##### `withTestApplication` 和 `withApplication` 已移除 {id="withtestapplication-and-withapplication-have-been-removed"}\n\n已移除。\n\n#### `TestApplication` 模块加载 {id="test-module-loading"}\n\n##### 显式模块加载 {id="explicit-module-loading"}\n',
      'ktor/migrating-3.md',
    )
    expect(headings(html)).toEqual(['h2#server', 'h3#testing', 'h4#withtestapplication-and-withapplication-have-been-removed', 'h4#test-module-loading', 'h5#explicit-module-loading'])
  })

  // No page has a chapter right after a heading that skips; built like ktor
  // server-engines ("In code" and its chapters), with the heading skipping.
  it('starts a chapter below the heading as nested, not as written', async () => {
    const html = await render(
      '#### 在代码中 {id="in-code"}\n\n<chapter title="Netty" id="netty">\n\n使用 Netty。\n\n</chapter>\n',
      'ktor/server-engines.md',
    )
    expect(headings(html)).toEqual(['h2#in-code', 'chapter2#netty'])
  })

  it('leaves a page that is not Writerside', async () => {
    const html = await render('## Koin {id="koin"}\n\n#### Start {id="start"}\n', 'koin/index.md')
    // (Its title, read from the page's file, is added as an h1, left out here.)
    expect(headings(html).filter((h) => !h.startsWith('h1'))).toEqual(['h2#koin', 'h4#start'])
  })
})
