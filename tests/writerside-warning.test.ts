import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileTemplate } from 'vue/compiler-sfc'
import { vueCompilerOptions } from '../docs/.vitepress/config/vue-template.config'
import Warning from '../docs/.vitepress/component/Warning.vue'
import Note from '../docs/.vitepress/component/Note.vue'
import Tip from '../docs/.vitepress/component/Tip.vue'

// The callout components read the page path from VitePress.
const page = vi.hoisted(() => ({ relativePath: '' }))
vi.mock('vitepress', () => ({ useData: () => ({ page: { value: page } }) }))

async function render(component: Component, relativePath: string) {
  page.relativePath = relativePath
  return renderToString(createSSRApp({ render: () => h(component, null, () => h('p', 'Careful.')) }))
}

describe('Writerside <warning> tag', () => {
  it('renders as a red warning callout, like {style="warning"}', async () => {
    // Was written out as a bare <warning> element: plain paragraphs, nothing to mark a warning.
    // <!--[--> <!--]--> are Vue's markers around the slot content.
    expect(await render(Warning, 'ktor/rsa-keys-generation.md')).toBe(
      '<div class="ws-callout ws-callout--warning ws-callout--red" role="note" aria-label="警告"><!--[--><p>Careful.</p><!--]--></div>'
    )
  })

  it('names the callout in the page language', async () => {
    expect(await render(Warning, 'ko/ktor/rsa-keys-generation.md')).toContain('aria-label="경고"')
    expect(await render(Warning, 'ja/ktor/rsa-keys-generation.md')).toContain('aria-label="警告"')
  })

  it('renders the same markup as the <note> and <tip> tags', async () => {
    const shape = (html: string) => html.replace(/ws-callout--\w+ ws-callout--\w+/, 'TYPE').replace(/aria-label="[^"]*"/, 'LABEL')
    const warning = shape(await render(Warning, 'ktor/x.md'))
    expect(shape(await render(Note, 'ktor/x.md'))).toBe(warning)
    expect(shape(await render(Tip, 'ktor/x.md'))).toBe(warning)
  })

  it('is compiled as a component in a page, not as a plain element', () => {
    const source = '<div><warning><p>Careful.</p></warning></div>'
    const { code } = compileTemplate({ source, filename: 'page.md', id: 'page', ssr: true, ssrCssVars: [], compilerOptions: vueCompilerOptions })
    expect(code).toContain('_resolveComponent("warning")')
    expect(code).not.toContain('<warning>')
  })
})
