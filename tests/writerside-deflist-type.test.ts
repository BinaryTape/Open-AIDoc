import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Deflist from '../docs/.vitepress/component/Deflist.vue'
import Def from '../docs/.vitepress/component/Def.vue'

const render = (props: Record<string, string>) =>
  renderToString(createSSRApp({ render: () => h(Deflist, props, () => [h(Def, { title: 't' }, () => 'd')]) }))

describe('<deflist type>', () => {
  it('puts the title on top without a type, or with "full"', async () => {
    expect(await render({})).toMatch(/class="ws-def ws-def--title-top"/)
    expect(await render({ type: 'full' })).toMatch(/class="ws-def ws-def--title-top"/)
  })

  it('puts the title on the left at the width the type names', async () => {
    for (const type of ['wide', 'medium', 'narrow', 'compressed']) {
      expect(await render({ type })).toMatch(new RegExp(`class="ws-def ws-def--title-left ws-def--width-${type}"`))
    }
  })

  it('leaves collapsible lists alone', async () => {
    const html = await render({ collapsible: 'true', type: 'wide' })
    expect(html).toMatch(/<details class="details custom-block"[^>]*><summary[^>]*>t<\/summary>/)
    expect(html).not.toMatch(/ws-def--/)
  })
})
