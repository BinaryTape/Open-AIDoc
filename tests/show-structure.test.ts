import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// The outline beside a Writerside page goes as deep as its <show-structure>,
// as on kotlinlang.org and ktor.io (P2-36). The site's outline is [2, 3].
let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

const outline = async (markdown: string, relativePath: string) => {
  const env: Record<string, any> = { relativePath, cleanUrls: true }
  await md.renderAsync(markdown, env)
  return env.frontmatter?.outline
}

const page = (structure: string) => `[//]: # (title: 服务器引擎)\n\n${structure}\n\n## A\n\n### B\n\n#### C\n`

describe('the outline of a Writerside page', () => {
  it('goes down to h(depth + 1)', async () => {
    expect(await outline(page('<show-structure for="chapter" depth="3"/>'), 'ktor/server-engines.md')).toEqual([2, 4])
    expect(await outline(page('<show-structure for="chapter,procedure" depth="4"/>'), 'ja/ktor/server-requests.md')).toEqual([2, 5])
    expect(await outline(page('<show-structure depth="1"/>'), 'kotlin/booleans.md')).toEqual([2, 2])
    expect(await outline(page('<show-structure depth="1"/>'), 'zh-Hant/kmp/ios-liquid-glass.md')).toEqual([2, 2])
    // Depth 2 is the site's outline already
    expect(await outline(page('<show-structure for="chapter" depth="2"/>'), 'ktor/server-routing.md')).toBeUndefined()
    // No depth: 2
    expect(await outline(page('<show-structure for="chapter"/>'), 'ktor/server-configuration-code.md')).toBeUndefined()
  })

  it('without a <show-structure>, goes as deep as the docs: h2 on Ktor, h3 on Kotlin and KMP', async () => {
    expect(await outline(page(''), 'ktor/client-plugins.md')).toEqual([2, 2])
    expect(await outline(page(''), 'ko/ktor/graalvm.md')).toEqual([2, 2])
    expect(await outline(page(''), 'kotlin/arrays.md')).toBeUndefined()
    expect(await outline(page(''), 'kmp/compose-hot-reload.md')).toBeUndefined()
    // A <show-structure> in a code sample is not the page's
    const sample = '```xml\n<show-structure for="chapter" depth="3"/>\n```'
    expect(await outline(page(sample), 'ktor/server-docs.md')).toEqual([2, 2])
  })

  it('is the page\'s, not that of a bit of it rendered on its own', async () => {
    // The content of a <tldr> is rendered on its own, with the page's env (ws_render_inline)
    const tldr = (structure: string) => `[//]: # (title: 身份验证)\n\n${structure}\n<primary-label ref="client-plugin"/>\n\n<tldr>\n<p><b>必需依赖项</b>：<code>io.ktor:ktor-client-auth</code></p>\n</tldr>\n\n## A\n\n### B\n`
    expect(await outline(tldr('<show-structure for="chapter" depth="2"/>'), 'ktor/client-auth.md')).toBeUndefined()
    expect(await outline(tldr('<show-structure for="chapter"/>'), 'zh-Hant/ktor/client-auth.md')).toBeUndefined()
    expect(await outline(tldr('<show-structure depth="3"/>'), 'ktor/client-auth.md')).toEqual([2, 4])
  })

  it('reads a <show-structure> inside a paragraph, and leaves an outline the page sets and other docs alone', async () => {
    expect(await outline('[//]: # (title: Engines)\n<show-structure depth="3"/>\nText.\n\n## A\n', 'ktor/x.md')).toEqual([2, 4])
    expect(await outline(`---\noutline: deep\n---\n\n${page('<show-structure depth="1"/>')}`, 'kotlin/x.md')).toBe('deep')
    expect(await outline(page('<show-structure depth="1"/>'), 'koog/x.md')).toBeUndefined()
  })
})
