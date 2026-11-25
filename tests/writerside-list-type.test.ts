import { beforeAll, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import List from '../docs/.vitepress/component/List.vue'

// kotlinlang.org and ktor.io number only a decimal list (and alpha-lower):
// <list type="bullet"> has bullets and <list type="none"> no marker (P2-47).
describe('<list type>', () => {
  const render = (props: Record<string, string>) =>
    renderToString(createSSRApp({ render: () => h(List, props, () => [h('li', 'a'), h('li', 'b')]) }))

  it('numbers a decimal list, and an alpha-lower one with letters', async () => {
    expect(await render({ type: 'decimal' })).toMatch(/^<ol data-v-\w+>/)
    expect(await render({ type: 'alpha-lower' })).toMatch(/^<ol type="a" data-v-\w+>/)
  })

  it('gives a bullet list bullets, and a none list no marker (ktor server-create-restful-apis, kmp cross-platform-mobile-development)', async () => {
    expect(await render({ type: 'bullet' })).toMatch(/^<ul data-v-\w+>/)
    expect(await render({ type: 'none' })).toMatch(/^<ul class="ws-list-none" data-v-\w+>/)
  })
})

let md: MarkdownRenderer
beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (m) => registerMarkdownPlugins(m),
  })
})
const renderMarkdown = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })

describe('<list style>', () => {
  // Vue drops a style that is no CSS, so List.vue never sees it.
  it('reads a list type written as style (ktor server-auto-reload)', async () => {
    const html = await renderMarkdown('<p>\n要使用自动重载，请遵循以下步骤：\n</p>\n<list style="decimal">\n    <li><p><a href="#enable">启用开发模式</a></p></li>\n</list>\n', 'ktor/server-auto-reload.md')
    expect(html).toContain('<list type="decimal">')
    expect(html).not.toContain('style=')
  })

  it('keeps a type written as such, and a style that is CSS', async () => {
    const html = await renderMarkdown('<list type="bullet" style="decimal">\n<li>a</li>\n</list>\n\n<list style="margin: 0">\n<li>b</li>\n</list>\n', 'ktor/a.md')
    expect(html).toContain('<list type="bullet" style="decimal">')
    expect(html).toContain('<list style="margin: 0">')
  })
})

describe('Markdown list {type}', () => {
  // HTML knows type="a", not "alpha-lower": the browser numbered the list (P2-48).
  it('letters an alpha-lower list (kmp migrate-from-android)', async () => {
    const html = await renderMarkdown('1. 迁移到多平台库\n\n2. 将业务逻辑过渡到 KMP。\n   1. 从依赖它的其他模块最少的模块开始。\n   2. 将其迁移到 KMP 模块结构。\n   \n   {type="alpha-lower"}\n3. 将 UI 代码过渡到 Compose Multiplatform。\n', 'kmp/migrate-from-android.md')
    expect(html.match(/<ol\b[^>]*>/g)).toEqual(['<ol>', '<ol type="a">'])
  })
})
