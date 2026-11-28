import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// kotlinlang.org and ktor.io draw a border round an image written
// border-effect="line" or "rounded"; the attribute did nothing on ours (P2-50).
describe('markdown-it-ws-image-border', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const images = (html: string) => html.match(/<img\b[^>]*>/g) ?? []

  it('borders a Markdown image in a list (kmp compose-hot-reload)', async () => {
    const html = await render(
      '1. 点击装订区域图标。\n\n   ![从装订区域运行 Compose Hot Reload](compose-hot-reload-gutter-run.png){width=350 border-effect="line"}\n',
      'kmp/compose-hot-reload.md',
    )
    const [img] = images(html)
    expect(img).toContain('class="ws-bordered"')
    expect(img).toContain('width="350"')
    expect(img).not.toContain('border-effect')
  })

  it('borders an <img> (kotlin kotlin-and-ci), the border inside its width', async () => {
    const html = await render(
      '<img src="teamcity-gradle.png" alt="Gradle Build Step" width="700" border-effect="line"/>\n',
      'kotlin/kotlin-and-ci.md',
    )
    expect(images(html)).toEqual(['<img class="ws-bordered" src="/kotlin/teamcity-gradle.png" alt="Gradle Build Step" width="700"/>'])
  })

  it('rounds a Ktor <img> over several lines, the border outside its width (ktor server-create-restful-apis)', async () => {
    const html = await render(
      '<img src="tutorial_creating_restful_apis_starter_code_preview.png"\n     alt="浏览器屏幕中显示的 JSON 数据"\n     border-effect="rounded"\n     width="706"/>\n',
      'ktor/server-create-restful-apis.md',
    )
    const [img] = images(html)
    expect(img).toMatch(/^<img class="ws-bordered ws-bordered--rounded ws-bordered--outside" src="\/ktor\/tutorial_creating_restful_apis_starter_code_preview\.png"/)
    expect(img).toContain('width="706"')
    expect(img).not.toContain('border-effect')
  })

  it('keeps the dark version of a bordered image', async () => {
    const html = await render(
      '<img src="tutorial_creating_restful_apis_project_artifact.png" alt="在 Ktor 项目生成器中命名项目工件" style="block" border-effect="line" width="706"/>\n',
      'ktor/server-create-restful-apis.md',
    )
    const [img] = images(html)
    expect(img).toContain('class="ws-bordered ws-bordered--outside"')
    expect(img).toContain('data-dark-src="/ktor/tutorial_creating_restful_apis_project_artifact_dark.png"')
  })

  it('rounds a Markdown image on a Ktor page', async () => {
    const html = await render('![Wizard](wizard.png){ width="706" border-effect="rounded" }\n', 'ktor/client-create-multiplatform-application.md')
    const [img] = images(html)
    expect(img).toContain('class="ws-bordered ws-bordered--rounded ws-bordered--outside"')
    expect(img).not.toContain('border-effect')
  })

  it('adds to the classes an <img> has', async () => {
    const html = await render('<img src="a.png" class="screenshot" border-effect=\'line\'/>\n', 'kotlin/page.md')
    expect(images(html)).toEqual(['<img src="/kotlin/a.png" class="screenshot ws-bordered"/>'])
  })

  it('rounds the images of a page and leaves its GIF to the player, which rounds it (ktor server-integrate-database)', async () => {
    const html = await render(
      '![显示任务管理器客户端的浏览器窗口](tutorial_server_db_integration_index_page.png){width="706" border-effect="rounded"}\n\n' +
        '![显示任务管理器客户端的浏览器窗口](tutorial_server_db_integration_manual_test.gif){width="706" border-effect="rounded"}\n',
      'ktor/server-integrate-database.md',
    )
    const [img] = images(html)
    expect(img).toContain('class="ws-bordered ws-bordered--rounded ws-bordered--outside"')
    expect(html.match(/<GifPlayer [^>]*\/>/g)).toHaveLength(1)
    expect(html).toMatch(/<GifPlayer [^>]* rounded\/>/)
    expect(html.match(/class="ws-bordered/g)).toHaveLength(1)
  })

  it('borders only the images that ask for it, and only on Writerside pages', async () => {
    const kotlin = await render('<img src="a.png" border-effect="line"/>\n\n<img src="b.png" width="300"/>\n', 'kotlin/page.md')
    expect(images(kotlin)).toEqual(['<img class="ws-bordered" src="/kotlin/a.png"/>', '<img src="/kotlin/b.png" width="300"/>'])
    const coil = await render('<img src="a.png" border-effect="line"/>\n', 'coil/page.md')
    expect(coil).toContain('border-effect="line"')
    expect(coil).not.toContain('ws-bordered')
  })
})

describe('the border of a bordered image or GIF', () => {
  const read = (file: string) => readFileSync(file, 'utf8')
  const rule = (text: string, selector: string) => new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(text)?.[1]

  it('is the 1px grey line of kotlinlang.org and ktor.io, rounded 9px', () => {
    const css = read('docs/.vitepress/styles/ws-image-border.css')
    expect(rule(css, ':root')).toContain('--ws-bordered-color: #d1d1d2')
    expect(rule(css, '.dark')).toContain('--ws-bordered-color: #474749')
    expect(rule(css, '.vp-doc img.ws-bordered')).toContain('border: 1px solid var(--ws-bordered-color)')
    expect(rule(css, '.vp-doc img.ws-bordered--rounded')).toContain('border-radius: 9px')
    expect(rule(css, '.vp-doc img.ws-bordered--outside')).toContain('box-sizing: content-box')
  })

  it('of a rounded GIF is 9px too, as on ktor.io (P2-51)', () => {
    expect(rule(read('docs/.vitepress/component/GifPlayer.vue'), '.ws-gif--rounded .ws-gif__image')).toContain('border-radius: 9px')
  })

  it('of a Ktor GIF is outside its width, as on ktor.io, and still in the column (P2-52)', () => {
    const ktor = rule(read('docs/.vitepress/component/GifPlayer.vue'), '.vp-doc .ws-gif[data-site="ktor"] .ws-gif__image')
    expect(ktor).toContain('box-sizing: content-box')
    expect(ktor).toContain('max-width: calc(100% - 2px)')
  })
})
