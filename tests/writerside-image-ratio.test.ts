import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// ktor.io and kotlinlang.org show an image in the box its width and height
// attributes give; VitePress's `height: auto` showed the file's proportions,
// so Ktor's Gradle icon, written 16×26, was 16×16 (P2-44).
describe('markdown-it-ws-image-ratio', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const images = (html: string) => html.match(/<img\b[^>]*>/g) ?? []

  it('gives an HTML image the ratio of its attributes (ktor server-create-a-new-project)', async () => {
    const html = await render(
      '<procedure>\n<step>\n<p>点击右侧侧边栏上的 Gradle 图标（<img alt="intelliJ IDEA gradle icon"\n    src="intellij_idea_gradle_icon.svg" width="16" height="26"/>）打开 Gradle 工具窗口。</p>\n</step>\n</procedure>\n',
      'ktor/server-create-a-new-project.md',
    )
    expect(images(html)).toEqual(['<img class="ws-inline-icon" alt="intelliJ IDEA gradle icon"\n    src="/ktor/intellij_idea_gradle_icon.svg" data-dark-src="/ktor/intellij_idea_gradle_icon_dark.svg" width="16" height="26" style="aspect-ratio: 16 / 26"/>'])
  })

  it('keeps Writerside\'s style="inline" before the ratio (ktor server-create-restful-apis)', async () => {
    const html = await render(
      '<procedure>\n<step>\n<p>在 IntelliJ IDEA 中，点击运行按钮\n    （<img src="intellij_idea_gutter_icon.svg"\n          style="inline" height="16" width="16"\n          alt="IntelliJ IDEA 运行图标"/>）\n    以启动应用程序。</p>\n</step>\n</procedure>\n',
      'ktor/server-create-restful-apis.md',
    )
    expect(images(html)[0]).toContain(' style="inline; aspect-ratio: 16 / 16" height="16" width="16"')
  })

  it('gives a Markdown image the ratio of its attributes (ktor tutorial-first-steps-with-kotlin-rpc)', async () => {
    const html = await render(
      '2. 在 IntelliJ IDEA 中，点击 `main()` 函数旁的运行按钮\n   (![IntelliJ IDEA 运行图标](intellij_idea_gutter_icon.svg){style="inline" height="16" width="16"})\n   以启动应用程序。\n',
      'ktor/tutorial-first-steps-with-kotlin-rpc.md',
    )
    expect(images(html)[0]).toContain(' style="inline; aspect-ratio: 16 / 16"')
  })

  it('leaves an image with only a width, and a page that is not Writerside', async () => {
    const width = await render('<img src="teamcity-kmp-tests.png" alt="TeamCity tests" width="450"/>\n', 'kmp/configure-teamcity-for-kmp.md')
    const koin = await render('<img src="koin.png" width="16" height="26"/>\n', 'koin/index.md')
    expect(width + koin).not.toContain('aspect-ratio')
  })
})
