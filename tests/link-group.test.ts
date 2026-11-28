import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import LinkGroup from '../docs/.vitepress/component/LinkGroup.vue'

// Stands in for the site's <Links> component, as ktor/welcome writes its links (P2-27).
const Links = defineComponent({
  props: { href: String },
  setup: (props, { slots }) => () => h('a', { href: props.href }, slots.default?.()),
})

// Without scoped-style attributes and slot comments, for readable expectations.
async function renderGroup(children: () => any[]) {
  const html = await renderToString(createSSRApp({ render: () => h(LinkGroup, null, children) }))
  return html.replace(/ data-v-\w+|<!--[[\]]-->/g, '')
}

describe('a link group', () => {
  it('shows its title as a heading only, not as a <title> in the page body', async () => {
    const html = await renderGroup(() => [
      h('title', null, 'Routing'),
      h(Links, { href: 'server-routing.md' }, () => 'Routing'),
      h(Links, { href: 'server-resources.md' }, () => 'Type-safe routing'),
    ])
    expect(html).not.toContain('<title>')
    expect(html).toBe(
      '<div class="ws-link-group ws-col-12 ws-col-sm-4"><h3>Routing</h3><div class="ws-link-container">'
        + '<a href="server-routing.md">Routing</a><a href="server-resources.md">Type-safe routing</a>'
        + '</div></div>',
    )
  })

  it('shows two links written with a " / " between them one under the other, as ktor.io does (P2-29)', async () => {
    const html = await renderGroup(() => [
      h('title', null, 'Plugins'),
      h(Links, { href: 'server-swagger-ui.md' }, () => 'Swagger UI'),
      ' / ',
      h(Links, { href: 'server-openapi.md' }, () => 'OpenAPI'),
    ])
    expect(html).toBe(
      '<div class="ws-link-group ws-col-12 ws-col-sm-4"><h3>Plugins</h3><div class="ws-link-container">'
        + '<a href="server-swagger-ui.md">Swagger UI</a><a href="server-openapi.md">OpenAPI</a>'
        + '</div></div>',
    )
  })

  it('still turns plain <a> links into the site links', async () => {
    const html = await renderGroup(() => [
      h('title', null, 'Deployment'),
      h('a', { href: 'docker.md', summary: 'Deploy with Docker' }, 'Docker'),
    ])
    expect(html).not.toContain('<title>')
    expect(html).toContain('<h3>Deployment</h3>')
    expect(html).toContain('Deploy with Docker')
  })
})
