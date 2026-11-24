import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { imageSize, isInlineIcon } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-inline-icon'

// kotlinlang.org and ktor.io show an image in the line of text when it is at
// most 32px high, or marked inline or joined (P2-42).
describe('isInlineIcon', () => {
  it('reads the height attribute, else the file scaled to the width attribute, else the file', () => {
    expect(isInlineIcon({ height: '16', width: '16' })).toBe(true)
    expect(isInlineIcon({ height: '33' }, [10, 10])).toBe(false)
    expect(isInlineIcon({ width: '50' }, [100, 54])).toBe(true)
    expect(isInlineIcon({ width: '350' }, [1000, 89])).toBe(true)
    expect(isInlineIcon({ width: '706' }, [1412, 800])).toBe(false)
    expect(isInlineIcon({}, [20, 20])).toBe(true)
    expect(isInlineIcon({}, [400, 120])).toBe(false)
    expect(isInlineIcon({ width: '20' })).toBe(false)
  })

  it('follows style="inline", style="block" and type="joined" whatever the height', () => {
    expect(isInlineIcon({ style: 'inline', width: '250' }, [500, 1034])).toBe(true)
    expect(isInlineIcon({ type: 'joined', width: '700' }, [700, 400])).toBe(true)
    expect(isInlineIcon({ style: 'block', height: '16' })).toBe(false)
  })
})

describe('imageSize', () => {
  let dir: string
  beforeAll(() => { dir = mkdtempSync(join(tmpdir(), 'image-size-')) })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))
  const file = (name: string, content: Buffer | string) => {
    writeFileSync(join(dir, name), content)
    return join(dir, name)
  }

  it('reads PNG, GIF and JPEG headers', () => {
    const png = Buffer.alloc(33)
    png.writeUInt32BE(0x89504e47, 0)
    png.writeUInt32BE(640, 16)
    png.writeUInt32BE(27, 20)
    expect(imageSize(file('a.png', png))).toEqual([640, 27])

    const gif = Buffer.from('GIF89a\x20\x00\x10\x00', 'latin1')
    expect(imageSize(file('a.gif', gif))).toEqual([32, 16])

    // SOI, an APP0 segment of 4 bytes, then the baseline frame header.
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0, 0, 0xff, 0xc0, 0x00, 0x11, 8, 0x01, 0x2c, 0x02, 0x58, 3])
    expect(imageSize(file('a.jpg', jpeg))).toEqual([600, 300])
  })

  it('reads an SVG root size, falling back to its viewBox', () => {
    expect(imageSize(file('a.svg', '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16" viewBox="0 0 32 32"><path stroke-width="2"/></svg>'))).toEqual([16, 16])
    expect(imageSize(file('b.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 395"></svg>'))).toEqual([700, 395])
  })

  it('has no size for a missing or unknown file', () => {
    expect(imageSize(join(dir, 'missing.png'))).toBeUndefined()
    expect(imageSize(file('a.txt', 'text'))).toBeUndefined()
  })
})

describe('markdown-it-ws-inline-icon', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const images = (html: string) => html.match(/<img\b[^>]*>/g) ?? []

  it('marks the rerun button in the line of text (ktor server-create-a-new-project)', async () => {
    const html = await render(
      '<procedure>\n<step>\n<p>点击重新运行按钮（<img alt="intelliJ IDEA rerun button icon"\n    src="intellij_idea_rerun_icon.svg" height="16" width="16"/>）以重新启动应用程序。</p>\n</step>\n</procedure>\n',
      'ktor/server-create-a-new-project.md',
    )
    expect(images(html)).toEqual(['<img class="ws-inline-icon" alt="intelliJ IDEA rerun button icon"\n    src="/ktor/intellij_idea_rerun_icon.svg" height="16" width="16"/>'])
  })

  it('sizes a Markdown image from its file in docs/public (kmp compose-hot-reload)', async () => {
    const html = await render('6. 点击 **Sync Gradle Changes** 按钮同步 Gradle 文件：![同步 Gradle 文件](gradle-sync.png){width=50}\n', 'kmp/compose-hot-reload.md')
    expect(images(html)[0]).toMatch(/^<img src="\/kmp\/gradle-sync.png" alt="同步 Gradle 文件" width="50" class="ws-inline-icon"/)
  })

  it('keeps a screenshot a block, and joins an image marked joined', async () => {
    const html = await render(
      '![IDE 中生成的 Ktor 项目视图](tutorial_server_get_started_idea_project_view.png){width=706}\n\n* ![步过](wasm-debug-step-over.png){width=30}{type="joined"} 步过。\n',
      'en/ktor/server-create-a-new-project.md',
    )
    const [screenshot, joined] = images(html)
    expect(screenshot).not.toContain('ws-inline-icon')
    expect(joined).toContain('class="ws-inline-icon"')
  })

  it('adds to a class the image has, once though a tldr renders its content again', async () => {
    const html = await render('<tldr>\n<p>A <img src="intellij_idea_rerun_icon.svg" class="icon" height="16"/> B</p>\n</tldr>\n', 'ktor/a.md')
    expect(images(html)).toEqual(['<img src="/ktor/intellij_idea_rerun_icon.svg" class="ws-inline-icon icon" height="16"/>'])
  })

  it('leaves other docs alone', async () => {
    const html = await render('A ![icon](/img/icon.png){height=16} B\n', 'koog/index.md')
    expect(html).not.toContain('ws-inline-icon')
  })
})
