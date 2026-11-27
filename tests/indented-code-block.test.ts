import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// A code block indented four spaces came out as a bare <pre><code>: no code
// block styles, no scrolling of its own, and a long line made a phone's page
// wider than its screen. kotlinlang.org and the MkDocs sites show it as a code
// block with no language, and so do we now (P2-56).
describe('markdown-it-indented-code', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const bare = (html: string) => html.match(/<pre>(?:<code>)?/g) ?? []

  it('renders the output of a Koog example as a fenced block with no language does (koog examples/Chess)', async () => {
    const lines = ['Chess Game started!', '8 r n b q k b n r', '7 p p p p p p p p']
    const indented = await render(`运行后输出：\n\n${lines.map((l) => '    ' + l).join('\n')}\n`, 'koog/examples/Chess.md')
    const fenced = await render(`运行后输出：\n\n\`\`\`\n${lines.join('\n')}\n\`\`\`\n`, 'koog/examples/Chess.md')
    expect(bare(indented)).toEqual([])
    expect(indented).toContain('<div class="language-">')
    expect(indented).toContain('<pre class="shiki')
    expect(indented).toBe(fenced)
  })

  it('keeps a blank line inside one block (coil overview, the licence)', async () => {
    const html = await render(
      '## 许可证\n\n    Copyright 2026 Coil Contributors\n\n    Licensed under the Apache License, Version 2.0 (the "License");\n',
      'coil/overview.md',
    )
    expect(bare(html)).toEqual([])
    expect(html.match(/<div class="language-">/g)).toHaveLength(1)
    expect(html).toContain('Copyright 2026 Coil Contributors')
    expect(html).toContain('Licensed under the Apache License')
  })

  it('shows an over-indented fence in a list item as text in a code block, as kotlinlang.org does (kmp multiplatform-project-recommended-structure)', async () => {
    const html = await render(
      '1. 在 `webApp/build.gradle.kts` 文件中，指定共享 UI 模块所需的插件：\n\n        ```kotlin\n        plugins {\n           alias(libs.plugins.kotlinMultiplatform)\n        }\n        ```\n',
      'kmp/multiplatform-project-recommended-structure.md',
    )
    expect(bare(html)).toEqual([])
    expect(html).toMatch(/<li>[\s\S]*<div class="language-">[\s\S]*```kotlin[\s\S]*<\/li>/)
  })
})
