import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

describe('an attribute written twice', () => {
  it('keeps the last, as Writerside does (Vue does not compile a duplicate)', async () => {
    // ktor's client-create-multiplatform-application
    const html = await md.renderAsync('![Wizard](wizard.png){ width="450" width="706" border-effect="rounded" }', { relativePath: 'ktor/page.md' })
    const img = /<img[^>]*>/.exec(html)![0]
    expect(img.match(/\bwidth="/g)).toHaveLength(1)
    expect(img).toContain('width="706"')
    expect(img).toContain('border-effect="rounded"')
  })
})
