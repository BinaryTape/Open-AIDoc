import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { WS_INLINE_TAGS } from '../docs/.vitepress/config/inline-tags.config'

const render = async (md: MarkdownRenderer, src: string) =>
  (await md.renderAsync(src, { relativePath: 'ktor/dokku.md', cleanUrls: true })).trim()

describe('a line that opens with a Writerside inline tag', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    // VitePress keeps the first renderer it creates, so this one is the only one
    md = await createMarkdownRenderer('docs', {
      component: { inlineTags: WS_INLINE_TAGS },
      config: (md) => registerMarkdownPlugins(md),
    })
  })

  it.each([
    ['<Path>build.gradle.kts</Path> ファイルを開き、**stage** タスクを追加します。',
      '<p><Path>build.gradle.kts</Path> ファイルを開き、<strong>stage</strong> タスクを追加します。</p>'],
    ['<path>application.conf</path> is read at startup.',
      '<p><path>application.conf</path> is read at startup.</p>'],
    ['<control>Name</control>: プロジェクト名を指定します。',
      '<p><control>Name</control>: プロジェクト名を指定します。</p>'],
    ['<ui-path>File | Settings</ui-path> opens the dialog.',
      '<p><ui-path>File | Settings</ui-path> opens the dialog.</p>'],
    ['<shortcut>Shift</shortcut> を2回押します。',
      '<p><shortcut>Shift</shortcut> を2回押します。</p>'],
    ['<emphasis>Note</emphasis> that this is slow.',
      '<p><emphasis>Note</emphasis> that this is slow.</p>'],
  ])('is a paragraph: %s', async (src, html) => {
    expect(await render(md, src)).toBe(html)
  })

  it('continues the paragraph of the line before', async () => {
    expect(await render(md, 'Open the file\n<Path>build.gradle.kts</Path> and add a task.'))
      .toBe('<p>Open the file\n<Path>build.gradle.kts</Path> and add a task.</p>')
  })

  it('is the text of a list item', async () => {
    expect(await render(md, '1. <Path>shared/build.gradle.kts</Path> ファイルを開きます。\n2. Run it.'))
      .toBe('<ol>\n<li><Path>shared/build.gradle.kts</Path> ファイルを開きます。</li>\n<li>Run it.</li>\n</ol>')
  })

  it('still leaves block tags and other components as HTML blocks', async () => {
    expect(await render(md, '<div class="x">text</div>')).toBe('<div class="x">text</div>')
    expect(await render(md, '<Tabs>\n<TabItem title="A">\n\nbody\n\n</TabItem>\n</Tabs>'))
      .toBe('<Tabs>\n<TabItem title="A">\n<p>body</p>\n</TabItem>\n</Tabs>')
  })
})
