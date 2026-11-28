import { beforeAll, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import GifPlayer from '../docs/.vitepress/component/GifPlayer.vue'

// kotlinlang.org and ktor.io show a GIF still with a "Gif" button, and play it
// when it is clicked; we played every GIF all the time (P2-46).
describe('markdown-it-ws-gif', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const players = (html: string) => html.match(/<GifPlayer\b[^>]*\/>/g) ?? []

  it('makes an <img> of a GIF a player, still on its preview-src (kmp compose-desktop-keyboard)', async () => {
    const html = await render(
      '<img src="compose-desktop-key-focus.animated.gif" alt="焦点组件中的键盘事件" width="600" preview-src="compose-desktop-key-focus.png"/>\n',
      'kmp/compose-desktop-keyboard.md',
    )
    expect(players(html)).toEqual([
      '<GifPlayer src="/kmp/compose-desktop-key-focus.animated.gif" preview="/kmp/compose-desktop-key-focus.png" alt="焦点组件中的键盘事件" width="600" natural-width="1200" natural-height="544" site="kmp"/>',
    ])
    expect(html).not.toContain('<img')
  })

  it('makes a Markdown image of a GIF a player too (kmp compose-hot-reload)', async () => {
    const html = await render('![Compose Hot Reload](compose-hot-reload.animated.gif){width=500 preview-src="compose-hot-reload.png"}\n', 'kmp/compose-hot-reload.md')
    expect(players(html)).toEqual([
      '<GifPlayer src="/kmp/compose-hot-reload.animated.gif" preview="/kmp/compose-hot-reload.png" alt="Compose Hot Reload" width="500" natural-width="1000" natural-height="520" site="kmp"/>',
    ])
  })

  it('gives the player the dark version, and no still when there is no preview-src (ktor server-create-restful-apis)', async () => {
    const html = await render(
      '<p>\n    <img src="ktor_project_generator_add_plugins.gif" alt="在 Ktor 项目生成器中添加插件"\n         border-effect="line"\n         style="block"\n         width="706"/>\n</p>\n',
      'ktor/server-create-restful-apis.md',
    )
    expect(players(html)).toEqual([
      '<GifPlayer src="/ktor/ktor_project_generator_add_plugins.gif" dark-src="/ktor/ktor_project_generator_add_plugins_dark.gif" alt="在 Ktor 项目生成器中添加插件" width="706" natural-width="1266" natural-height="634" site="ktor"/>',
    ])
    expect(html).not.toContain('data-dark-src')
  })

  it('rounds the border of a GIF with border-effect="rounded" (ktor server-integrate-database)', async () => {
    const html = await render('![显示任务管理器客户端的浏览器窗口](tutorial_server_db_integration_manual_test.gif){width="706" border-effect="rounded"}\n', 'ktor/server-integrate-database.md')
    expect(players(html)[0]).toMatch(/ site="ktor" rounded\/>$/)
  })

  it('leaves other images, and the pages that are not Writerside', async () => {
    const png = await render('![Compose Hot Reload](compose-hot-reload.png){width=500}\n', 'kmp/compose-hot-reload.md')
    const koin = await render('![animation](koin.gif)\n', 'koin/index.md')
    expect(png + koin).not.toContain('GifPlayer')
  })
})

describe('GifPlayer', () => {
  const ssr = (props: Record<string, unknown>) => renderToString(createSSRApp(() => h(GifPlayer, props)))

  it('starts still, on the preview, with the "Gif" button', async () => {
    const html = await ssr({ src: '/kmp/a.animated.gif', preview: '/kmp/a.png', alt: 'A', width: '600', naturalWidth: '1200', naturalHeight: '544', site: 'kmp' })
    expect(html).toContain('<img class="ws-gif__image" src="/kmp/a.png" alt="A" width="598" style="aspect-ratio:1200 / 544;">')
    expect(html).toMatch(/^<button type="button" class="ws-gif" data-site="kmp" aria-pressed="false">/)
    expect(html).toContain('<span class="ws-gif__badge" aria-hidden="true"><span>Gif</span></span>')
    expect(html).not.toContain('a.animated.gif')
  })

  it('keeps the place of a GIF with no preview until its first frame is drawn', async () => {
    const html = await ssr({ src: '/ktor/b.gif', alt: 'B', width: '706', naturalWidth: '1266', naturalHeight: '634', site: 'ktor' })
    expect(html).toMatch(/<img class="ws-gif__image" src="data:image\/gif;base64,[^"]+" alt="B" width="706" style="aspect-ratio:1266 \/ 634;">/)
    expect(html).not.toContain('b.gif')
  })

  // The border is outside the image's width, so that the aspect-ratio is the
  // picture's; kotlinlang.org has it inside a written width (P2-57), ktor.io
  // outside (P2-52).
  it('is as wide as the width written, with its border, on a kotlinlang.org page', async () => {
    const width = async (props: Record<string, unknown>) => /<img [^>]*width="(\d+)"/.exec(await ssr({ src: '/x.gif', naturalWidth: '1000', naturalHeight: '520', ...props }))?.[1]
    expect(await width({ width: '600', site: 'kmp' })).toBe('598')
    expect(await width({ width: '500', site: 'kotlin' })).toBe('498')
    expect(await width({ width: '300', site: 'ktor' })).toBe('300')
    // No width written: the GIF's own, the border outside it, on both sites.
    expect(await width({ site: 'kmp' })).toBe('1000')
    expect(await width({ site: 'ktor' })).toBe('1000')
  })
})
