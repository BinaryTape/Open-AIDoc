import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'

vi.mock('vitepress', () => ({ useData: () => ({ page: ref({ relativePath: 'kotlin/whatsnew24.md' }) }) }))

const { default: TopicTitle } = await import('../docs/.vitepress/component/TopicTitle.vue')
const { default: OutlineItem } = await import('../docs/.vitepress/theme/OutlineItem.vue')

const render = (component: any, props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(component, props) }))

/** A heading element as the outline reads it in the browser: its data-* attributes. */
const element = (html: string) => {
  const attrs = Object.fromEntries([...html.matchAll(/data-ws-label(-[a-z]+)?="([^"]*)"/g)]
    .map(([, rest = '', value]) => ['wsLabel' + rest.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value]))
  return { dataset: attrs } as unknown as HTMLElement
}

describe('the primary label of a heading in the outline', () => {
  it('is left on the heading by TopicTitle', async () => {
    const html = await render(TopicTitle, { id: 'new-stable-features', level: 2, title: 'New features', labelRef: 'stable' })
    expect(html).toContain('<h2 id="new-stable-features" data-ws-label="Stable" data-ws-label-class="ws-label--green">New features</h2>')
    const described = await render(TopicTitle, { id: 'x', level: 3, title: 'Literals', labelRef: 'experimental-opt-in' })
    expect(described).toMatch(/<h3 id="x" data-ws-label="Experimental" data-ws-label-class="ws-label--red" data-ws-label-description="The feature is Experimental\.[^"]+">Literals<\/h3>/)
  })

  it('shows before the title, in the colour of the label', async () => {
    const heading = await render(TopicTitle, { id: 'x', level: 3, title: 'Collection literals', labelRef: 'experimental-opt-in' })
    const html = await render(OutlineItem, { root: true, headers: [{ title: 'Collection literals', link: '#x', element: element(heading) }] })
    expect(html).toMatch(/<a class="outline-link" href="#x" title="Collection literals"[^>]*><span class="ws-label--red ws-outline-label" title="The feature is Experimental[^"]*"[^>]*>Experimental<\/span>Collection literals<\/a>/)
  })

  it('leaves a heading without one as VitePress shows it', async () => {
    const heading = await render(TopicTitle, { id: 'y', level: 2, title: 'Plain', labelRef: '' })
    expect(heading).not.toContain('data-ws-label')
    const html = await render(OutlineItem, { root: true, headers: [{ title: 'Plain', link: '#y', element: element(heading) }, { title: 'No element', link: '#z' }] })
    expect(html).not.toContain('ws-outline-label')
    expect(html).toMatch(/<a class="outline-link" href="#y" title="Plain"[^>]*>(<!--[^>]*-->)*Plain\s*<\/a>/)
  })

  it('shows in nested headings too', async () => {
    const heading = await render(TopicTitle, { id: 'z', level: 3, title: 'Nested', labelRef: 'stable' })
    const html = await render(OutlineItem, { root: true, headers: [{ title: 'Parent', link: '#p', children: [{ title: 'Nested', link: '#z', element: element(heading) }] }] })
    expect(html).toMatch(/class="VPDocOutlineItem nested"[\s\S]*ws-label--green ws-outline-label[^>]*>Stable<\/span>Nested/)
  })
})
