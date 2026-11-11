import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Deflist from '../docs/.vitepress/component/Deflist.vue'
import Def from '../docs/.vitepress/component/Def.vue'

const render = (list: Record<string, string>, def: Record<string, string> = {}) =>
  renderToString(createSSRApp({
    render: () => h(Deflist, list, () => [h(Def, { title: 't', id: 'x', ...def }, () => 'd')])
  }))

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const sfc = (name: string) =>
  strip(readFileSync(`docs/.vitepress/component/${name}.vue`, 'utf8').match(/<style scoped>([\s\S]*?)<\/style>/)![1])
const style = sfc('Def')
const colours = strip(readFileSync('docs/.vitepress/styles/ws-def.css', 'utf8'))

/** The declarations of the first rule for exactly this selector, as {property: value}. */
const rule = (css: string, selector: string) => {
  const body = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, s]) => s.trim() === selector)?.[2] ?? ''
  return Object.fromEntries(
    body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
      const i = d.indexOf(':')
      return [d.slice(0, i).trim(), d.slice(i + 1).trim()]
    })
  )
}

describe('collapsible definition lists, as on kotlinlang.org', () => {
  it('are closed cards with a circled cross, no longer VitePress details blocks', async () => {
    const html = await render({ collapsible: 'true' })
    expect(html).toMatch(/<details class="ws-def-collapse ws-def-collapse--card" id="x"[^>]*>/)
    expect(html).toMatch(/<summary class="ws-def-collapse-title"[^>]*><span class="ws-def-collapse-icon" aria-hidden="true"[^>]*><svg viewBox="0 0 24 24"/)
    expect(html).not.toMatch(/custom-block/)
  })

  it('draw "clear" lists as rows with a chevron, numbered when asked', async () => {
    const html = await render({ collapsible: 'true', appearance: 'clear', numbered: 'true' })
    expect(html).toMatch(/<div class="ws-deflist ws-deflist--numbered"/)
    expect(html).toMatch(/<details class="ws-def-collapse ws-def-collapse--clear"/)
    expect(html).toMatch(/<svg viewBox="0 0 28 28"/)
    expect(await render({ collapsible: 'true', appearance: 'clear' })).not.toMatch(/ws-deflist--numbered/)
  })

  it('open a definition whose default-state is "expanded"', async () => {
    expect(await render({ collapsible: 'true' }, { defaultState: 'expanded' })).toMatch(/<details [^>]*open/)
    expect(await render({ collapsible: 'true' }, { defaultState: 'collapsed' })).not.toMatch(/<details [^>]*open/)
  })

  it('take the measured sizes', () => {
    expect(rule(style, '.ws-def-collapse--card')).toMatchObject({
      'margin-top': '12px',
      border: '1px solid var(--ws-def-collapse-border)',
      'background-color': 'var(--ws-def-bg)',
    })
    expect(rule(style, '.ws-def-collapse--card > .ws-def-collapse-title')).toEqual({
      padding: '16px 32px', 'font-size': '17px', 'line-height': '24px',
    })
    expect(rule(style, '.ws-def-collapse--card .ws-def-collapse-icon')).toMatchObject({
      top: '16px', left: '-12px', width: '24px', height: '24px', transform: 'rotate(-45deg)',
    })
    expect(rule(style, '.ws-def-collapse--card > .ws-def-collapse-content')).toEqual({ padding: '0 32px 16px' })
    expect(rule(style, '.ws-def-collapse--clear > .ws-def-collapse-title')).toEqual({
      padding: '24px 0 24px 40px', 'font-size': '20px', 'line-height': '28px',
    })
    expect(rule(style, '.ws-def-collapse--clear[open] .ws-def-collapse-icon')).toEqual({ transform: 'rotate(180deg)' })
    expect(rule(sfc('Deflist'), '.ws-deflist--numbered')).toEqual({ 'counter-reset': 'ws-deflist-item' })
  })

  it('take Writerside\'s colours, light and dark', () => {
    expect(rule(colours, ':root')).toMatchObject({
      '--ws-def-collapse-border': '#d1d1d2', '--ws-def-icon': '#5e5e60',
      '--ws-def-hover': '#19191c', '--ws-def-hairline': 'rgba(25, 25, 28, 0.2)',
    })
    expect(rule(colours, '.dark')).toMatchObject({
      '--ws-def-collapse-border': '#474749', '--ws-def-icon': '#bababb',
      '--ws-def-hover': '#fff', '--ws-def-hairline': 'rgba(255, 255, 255, 0.2)',
    })
  })
})
