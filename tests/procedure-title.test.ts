import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import Procedure from '../docs/.vitepress/component/Procedure.vue'
import Step from '../docs/.vitepress/component/Step.vue'

// A procedure's title is an h3 on ktor.io, in the outline when the page's
// <show-structure for> names "procedure" (P2-37). It was only a tooltip.
// Only its steps are in a list (P2-40), a bullet list for a single step (P2-41).
let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

const procedure = (props: Record<string, unknown>) =>
  renderToString(createSSRApp(() => h(Procedure, props, () => [h(Step, () => 'Step')])))

/** The procedure's markup, without Vue's comments and scope attributes */
const content = async (children: () => unknown[]) =>
  (await renderToString(createSSRApp(() => h(Procedure, {}, children))))
    .replace(/<!--[^]*?-->/g, '').replace(/ data-v-\w+(="")?/g, '')

describe('a Writerside procedure', () => {
  // server-create-a-new-project: "In the Project tool window, …" before the
  // steps, "Downloading should start automatically." after them
  it('lists its steps, and leaves what comes before and after them out of the list', async () => {
    const html = await content(() => [h('p', 'Before'), h(Step, () => 'One'), ' ', h(Step, () => 'Two'), h('p', 'After'), h(Step, () => 'Three')])
    expect(html).toBe('<div class="ws-procedure"><p>Before</p><ol><li>One</li> <li>Two</li></ol><p>After</p><ol><li>Three</li></ol></div>')
  })

  // server-create-a-new-project, "Write sample code to trigger the handler":
  // ktor.io lists a single step with a bullet, two or more with numbers
  it('lists a single step with a bullet', async () => {
    expect(await content(() => [h('p', 'Before'), h(Step, () => 'One'), ' ']))
      .toBe('<div class="ws-procedure"><p>Before</p><ul><li>One</li> </ul></div>')
    expect(await content(() => [h(Step, () => 'One'), h(Step, () => 'Two')]))
      .toBe('<div class="ws-procedure"><ol><li>One</li><li>Two</li></ol></div>')
  })

  // client-create-multiplatform-application: steps written as a Markdown list
  it('leaves a Markdown list of steps as it is, not in a list of its own', async () => {
    const html = await content(() => [h('ol', [h('li', 'Launch IntelliJ IDEA.'), h('li', 'Select File | New | Project.')])])
    expect(html).toBe('<div class="ws-procedure"><ol><li>Launch IntelliJ IDEA.</li><li>Select File | New | Project.</li></ol></div>')
  })

  it('shows its title as an h3, the id on the procedure', async () => {
    const html = await procedure({ title: '添加新依赖项', id: 'add-dependency' })
    expect(html).toMatch(/^<div class="ws-procedure" id="add-dependency"[^>]*><h3[^>]*>添加新依赖项 <a class="header-anchor" href="#add-dependency"/)
    expect(html).not.toContain('title=')
    expect(html).not.toMatch(/<h3[^>]* id=/)
  })

  it('in the outline, has the id on its title, which the outline takes', async () => {
    const html = await procedure({ title: '创建模型类型', id: 'create-model-types', inToc: true })
    expect(html).toMatch(/^<div class="ws-procedure"[^>]*><h3 id="create-model-types"[^>]*>创建模型类型 /)
    expect(html).not.toMatch(/<div[^>]* id=/)
    // Without a title: nothing to list, the id stays on the procedure
    const untitled = await procedure({ id: 'steps', inToc: true })
    expect(untitled).toMatch(/^<div class="ws-procedure" id="steps"/)
    expect(untitled).not.toContain('<h3')
  })

  it('is marked for the outline when <show-structure for> names procedures, and a title has an id', async () => {
    const page = (structure: string) => [
      '[//]: # (title: 处理请求)',
      '',
      structure,
      '',
      '<chapter title="实现任务模型" id="implement-a-task-model">',
      '<procedure title="创建模型类型" id="create-model-types">',
      '<step>A</step>',
      '</procedure>',
      '<procedure title="添加新路由"',
      '           id="add-a-route">',
      '<step>B</step>',
      '</procedure>',
      '<procedure title="测试重构后的代码">',
      '<step>C</step>',
      '</procedure>',
      '<procedure id="steps">',
      '<step>D</step>',
      '</procedure>',
      '</chapter>',
      '',
      '<tabs>',
      '<tab title="IntelliJ IDEA">',
      '<procedure title="使用浏览器">',
      '<step>E</step>',
      '</procedure>',
      '</tab>',
      '</tabs>',
    ].join('\n')
    const tags = async (structure: string) =>
      [...(await md.renderAsync(page(structure), { relativePath: 'ktor/server-requests-and-responses.md', cleanUrls: true }))
        .matchAll(/<procedure\b[^>]*>/g)].map((m) => m[0].replace(/\s+/g, ' '))

    expect(await tags('<show-structure for="chapter,procedure" depth="2"/>')).toEqual([
      '<procedure in-toc title="创建模型类型" id="create-model-types">',
      '<procedure in-toc title="添加新路由" id="add-a-route">',
      '<procedure id="测试重构后的代码" in-toc title="测试重构后的代码">',
      '<procedure id="steps">',
      '<procedure id="使用浏览器" in-toc title="使用浏览器">',
    ])
    expect(await tags('<show-structure for="chapter" depth="2"/>')).toEqual([
      '<procedure title="创建模型类型" id="create-model-types">',
      '<procedure title="添加新路由" id="add-a-route">',
      '<procedure id="测试重构后的代码" title="测试重构后的代码">',
      '<procedure id="steps">',
      '<procedure id="使用浏览器" title="使用浏览器">',
    ])
  })
})
