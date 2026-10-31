import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import List from '../docs/.vitepress/component/List.vue'

const render = (props: Record<string, string>) =>
  renderToString(createSSRApp({ render: () => h(List, props, () => [h('li', 'a'), h('li', 'b')]) }))

describe('<list columns>', () => {
  it('tells the stylesheet how many columns there are', async () => {
    const html = await render({ columns: '2' })
    expect(html).toMatch(/<ul class="ws-flex-list ws-flex-list--2" style="--ws-list-columns:2;"/)
  })

  it('treats a missing or odd count as one column', async () => {
    expect(await render({ columns: 'x' })).toMatch(/ws-flex-list--1/)
  })

  it('leaves other lists alone', async () => {
    expect(await render({})).toMatch(/^<ul data-v-\w+>/)
    expect(await render({ type: 'decimal' })).toMatch(/^<ol data-v-\w+>/)
  })
})
