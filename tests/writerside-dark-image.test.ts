import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// ktor.io and kotlinlang.org show the _dark version of an image in dark mode:
// an image whose file has a <name>_dark sibling names it in data-dark-src (P2-43).
describe('markdown-it-ws-dark-image', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const images = (html: string) => html.match(/<img\b[^>]*>/g) ?? []

  it('names the dark file of an HTML image (ktor server-create-a-new-project)', async () => {
    const html = await render(
      '<procedure>\n<step>\n<p>点击重新运行按钮（<img alt="intelliJ IDEA rerun button icon"\n    src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>\n</step>\n</procedure>\n',
      'ktor/server-create-a-new-project.md',
    )
    expect(images(html)).toEqual(['<img class="ws-inline-icon" alt="intelliJ IDEA rerun button icon"\n    src="/ktor/intellij_idea_rerun_icon.svg" data-dark-src="/ktor/intellij_idea_rerun_icon_dark.svg" height="16" width="16" style="aspect-ratio: 16 / 16"/>'])
  })

  it('names the dark file of a Markdown image (ktor client-create-multiplatform-application)', async () => {
    const html = await render(
      '![已选择带有 Pixel 8 API 设备的 androidApp](tutorial_client_kmp_run_android.png){width="381" style="block"}\n',
      'ktor/client-create-multiplatform-application.md',
    )
    expect(images(html)[0]).toMatch(/^<img src="\/ktor\/tutorial_client_kmp_run_android.png" alt="[^"]*" width="381" style="block" data-dark-src="\/ktor\/tutorial_client_kmp_run_android_dark.png"/)
  })

  it('in KMP too (configure-teamcity-for-kmp)', async () => {
    const html = await render('<img src="teamcity-kmp-tests.png" alt="TeamCity tests" width="450"/>\n', 'kmp/configure-teamcity-for-kmp.md')
    expect(images(html)).toEqual(['<img src="/kmp/teamcity-kmp-tests.png" data-dark-src="/kmp/teamcity-kmp-tests_dark.png" alt="TeamCity tests" width="450"/>'])
  })

  it('leaves an image with no dark file, or which is the dark file itself', async () => {
    const html = await render(
      '<img src="server_create_cli_tool_name_dark.png" alt="名称"/>\n\n![浏览器输出](server_get_started_add_new_http_endpoint_output.png)\n',
      'ktor/server-create-a-new-project.md',
    )
    expect(html).not.toContain('data-dark-src')
  })

  it('names it once though a tldr renders its content again', async () => {
    const html = await render('<tldr>\n<p>A <img src="intellij_idea_rerun_icon.svg" height="16"/> B</p>\n</tldr>\n', 'ktor/a.md')
    expect(images(html)).toEqual(['<img class="ws-inline-icon" src="/ktor/intellij_idea_rerun_icon.svg" data-dark-src="/ktor/intellij_idea_rerun_icon_dark.svg" height="16"/>'])
  })

  it('leaves other docs alone', async () => {
    const html = await render('<img src="/ktor/intellij_idea_rerun_icon.svg"/>\n', 'koog/index.md')
    expect(html).not.toContain('data-dark-src')
  })
})

vi.mock('vitepress', async (original) => ({ ...(await original<object>()), useData: () => ({}), onContentUpdated: () => {} }))

describe('showDarkImages', () => {
  // The part of an <img> the swap uses.
  class Img {
    attrs: Record<string, string>
    dataset: Record<string, string | undefined> = {}
    constructor(src: string, dark: string) {
      this.attrs = { src }
      this.dataset.darkSrc = dark
    }
    getAttribute(name: string) { return this.attrs[name] ?? null }
    setAttribute(name: string, value: string) { this.attrs[name] = value }
  }

  it('shows the dark file in dark mode and the first one again in light mode', async () => {
    const { showDarkImages } = await import('../docs/.vitepress/theme/dark-images')
    const img = new Img('/ktor/a.svg', '/ktor/a_dark.svg')
    const set = vi.spyOn(img, 'setAttribute')
    showDarkImages([img as unknown as HTMLImageElement], false)
    expect(set).not.toHaveBeenCalled()
    showDarkImages([img as unknown as HTMLImageElement], true)
    showDarkImages([img as unknown as HTMLImageElement], true)
    expect(img.attrs.src).toBe('/ktor/a_dark.svg')
    expect(set).toHaveBeenCalledTimes(1)
    showDarkImages([img as unknown as HTMLImageElement], false)
    expect(img.attrs.src).toBe('/ktor/a.svg')
  })
})
