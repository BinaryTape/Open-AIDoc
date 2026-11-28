import { readFileSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// The copy button of a code block said "Copy Code" in every language (P2-13).
describe('the copy button of a code block', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const titles = async (src: string, relativePath: string) =>
    [...(await md.renderAsync(src, { relativePath, cleanUrls: true })).matchAll(/<button title="([^"]*)" class="copy">/g)].map((m) => m[1])

  it('is titled in the language of the page', async () => {
    const fence = '```kotlin\nval a = 1\n```\n'
    expect(await titles(fence, 'kotlin/basic-syntax.md')).toEqual(['复制代码'])
    expect(await titles(fence, 'zh-Hant/kotlin/basic-syntax.md')).toEqual(['複製程式碼'])
    expect(await titles(fence, 'ja/ktor/server-routing.md')).toEqual(['コードをコピー'])
    expect(await titles(fence, 'ko/koin/setup/koin.md')).toEqual(['코드 복사'])
  })

  it('of a collapsible block, a runnable sample and a <code-block> too', async () => {
    const page = 'ja/kotlin/basic-syntax.md'
    expect(await titles('```kotlin\nfun main() {}\n```\n{collapsible="true"}\n', page)).toEqual(['コードをコピー'])
    expect(await titles('```kotlin\nfun main() {}\n```\n{kotlin-runnable="true"}\n', page)).toEqual(['コードをコピー'])
    expect(await titles('<code-block lang="kotlin">fun main() {}</code-block>\n', page)).toEqual(['コードをコピー'])
  })

  it('leaves code that looks like the button alone', async () => {
    const html = await md.renderAsync('```html\n<button title="Copy Code" class="copy">\n```\n', { relativePath: 'kotlin/a.md', cleanUrls: true })
    expect(html).toContain('"Copy Code"</span>')
    expect(html.match(/<button title="([^"]*)" class="copy">/g)).toEqual(['<button title="复制代码" class="copy">'])
  })

  it('says "已複製" once pressed on a zh-Hant page, not the simplified "已复制"', () => {
    const css = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(/:lang\(zh-Hant\)\s*\{([^}]*)\}/.exec(css)?.[1]).toContain("--vp-code-copy-copied-text-content: '已複製'")
  })
})
