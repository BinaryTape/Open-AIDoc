import { beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { WS_INLINE_TAGS } from '../docs/.vitepress/config/inline-tags.config'
import { renderTex } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-math'

const render = async (md: MarkdownRenderer, src: string) =>
  (await md.renderAsync(src, { relativePath: 'kotlin/kotlin-tour-functions.md', cleanUrls: true })).trim()

describe('Writerside <math>, TeX rendered as on kotlinlang.org', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    // VitePress keeps the first renderer it creates, so this one is the only one
    md = await createMarkdownRenderer('docs', {
      component: { inlineTags: WS_INLINE_TAGS },
      config: (md) => registerMarkdownPlugins(md),
    })
  })

  it('draws π with the glyph kotlinlang.org draws', () => {
    const html = renderTex('π')!
    expect(html).toMatch(/^<span class="ws-math"><svg [^>]*><\/svg><\/span>$|^<span class="ws-math"><svg [\s\S]*<\/svg><\/span>$/)
    // MathJax 3's TeX font, as there: <svg style="vertical-align: -0.025ex;" width="1.29ex" height="1ex" … viewBox="0 -431 570 442">
    expect(html).toContain('viewBox="0 -431 570 442"')
    expect(html).toContain('width="1.29ex"')
    expect(html).toContain('aria-label="π"')
    expect(html).not.toContain('<use')
  })

  it('renders a formula inside a sentence, leaving markdown around it alone', async () => {
    const html = await render(md, 'The area is <math>πr^2</math>, where **r** is the radius.')
    expect(html).toMatch(/^<p>The area is <span class="ws-math"><svg [\s\S]*<\/svg><\/span>, where <strong>r<\/strong> is the radius\.<\/p>$/)
    expect(html).not.toContain('<math>')
  })

  it('keeps the TeX away from markdown: no emphasis or escapes out of _ * \\', async () => {
    const html = await render(md, '<math>a_1 * b_2 * \\frac{r}{n}</math>')
    expect(html).not.toMatch(/<em>|<strong>/)
    expect(html).toContain('aria-label="a_1 * b_2 * \\frac{r}{n}"')
  })

  it('makes a formula on a line of its own a paragraph', async () => {
    const html = await render(md, 'The formula is:\n\n<math>A = P \\times (1 + \\displaystyle\\frac{r}{n})^{nt}</math>\n\nwhere:')
    expect(html).toMatch(/<p><span class="ws-math"><svg [\s\S]*<\/svg><\/span><\/p>\n<p>where:<\/p>$/)
  })

  it('renders a formula in an HTML block, as in a <def>', async () => {
    const html = await render(md, '<deflist collapsible="true">\n<def title="Hint">\nThe formula is <math>πr^2</math>.\n</def>\n</deflist>')
    expect(html).toContain('<span class="ws-math"><svg')
    expect(html).not.toContain('<math>')
  })

  it('leaves code alone', async () => {
    // Shiki splits the tag into spans; it is still there, as code
    const html = await render(md, '```xml\n<math>π</math>\n```')
    expect(html).not.toContain('ws-math')
    expect(html).toMatch(/&#x3C;<\/span><span[^>]*>math<\/span><span[^>]*>>π&#x3C;\//)
  })

  it('keeps TeX it cannot read, and says so', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = await render(md, 'Broken: <math>\\frac{1</math>.')
    expect(html).toContain('<math>\\frac{1</math>')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[ws-math] cannot render'))
    warn.mockRestore()
  })

  it('names <math> as an inline tag', () => {
    expect(WS_INLINE_TAGS).toContain('math')
  })

  it('keeps the formula in the line, though VitePress makes every svg a block', () => {
    const css = readFileSync('docs/.vitepress/styles/ws-math.css', 'utf8')
    expect(css).toMatch(/\.ws-math > svg \{[^}]*display: inline-block;/)
    expect(readFileSync('docs/.vitepress/theme/index.ts', 'utf8')).toContain("import '../styles/ws-math.css'")
  })
})
