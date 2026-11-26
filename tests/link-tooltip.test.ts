import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Link from '../docs/.vitepress/component/Link.vue'

// A link's summary tooltip was always on the page, only transparent, and at
// least 360px wide: near the right of a phone's screen it made the page wider
// than the screen (P2-53). kotlinlang.org and ktor.io show it only on hover or
// keyboard focus, placed and styled as measured there (P2-54).
const ssr = (props: Record<string, unknown>) =>
  renderToString(createSSRApp(() => h('p', [h(Link, props, () => 'Routing'), h(Link, { href: '/ktor/server-static-content', summary: 'Static.' }, () => 'Static Content')])))

describe('Link', () => {
  it('leaves the tooltip out of the layout until it is shown, named by the link for screen readers', async () => {
    const html = await ssr({ href: '/ktor/server-routing', summary: '路由是处理服务器应用程序中传入请求的核心插件。' })
    const tips = [...html.matchAll(/<span id="([^"]+)" class="ws-tooltip"[^>]* role="tooltip" style="display:none;"[^>]*>\s*([^<]*?)\s*<\/span>/g)]
    expect(tips.map((m) => m[2])).toEqual(['路由是处理服务器应用程序中传入请求的核心插件。', 'Static.'])
    const described = [...html.matchAll(/<a [^>]*aria-describedby="([^"]+)"/g)].map((m) => m[1])
    expect(described).toEqual(tips.map((m) => m[1]))
    expect(new Set(described).size).toBe(2)
  })

  it('has no tooltip and no description for a page without a summary', async () => {
    const html = await ssr({ href: '/ktor/server-routing', summary: '' })
    expect(html.match(/class="ws-tooltip"/g)).toHaveLength(1)
    expect(html.match(/aria-describedby=/g)).toHaveLength(1)
    expect(html).toContain('<a href="/ktor/server-routing" class="ws-link"')
  })

  it('styles the tooltip as kotlinlang.org and ktor.io do, shown by script and not on hover alone', () => {
    const vue = readFileSync('docs/.vitepress/component/Link.vue', 'utf8')
    const rule = /\n\.ws-tooltip \{([^}]*)\}/.exec(vue)?.[1] ?? ''
    expect(rule).toContain('max-width: min(320px, calc(100vw - 10px))')
    expect(rule).toContain('padding: 24px')
    expect(rule).toContain('border: 1px solid var(--ws-tooltip-border)')
    expect(rule).toContain('font-size: 16px')
    expect(rule).toContain('line-height: 24px')
    expect(rule).toContain('text-align: left')
    expect(rule).not.toContain('min-width')
    expect(vue).not.toMatch(/:hover \.ws-tooltip/)
  })
})

describe('tooltipPosition', async () => {
  // Measured on ktor.io server-create-restful-apis: the "Routing" link and its 320 × 122 tooltip
  const routing = { left: 458.42, right: 517.86, top: 410.67, bottom: 430.67 }
  const size = { width: 320, height: 122 }
  const { tooltipPosition } = await import('../docs/.vitepress/utils/tooltip').catch(() => ({ tooltipPosition: undefined }))

  it('puts the tooltip 8px above the line, centred on it (ktor.io: 328, 281)', () => {
    const { x, y, below } = tooltipPosition!(routing, size, 1280)
    expect([Math.round(x), Math.round(y), below]).toEqual([328, 281, false])
  })

  it('puts it 8px below the line when it does not fit above (ktor.io: the link at 80px, the tooltip at 108px)', () => {
    const { x, y, below } = tooltipPosition!({ ...routing, top: 79.67, bottom: 99.67 }, size, 1280)
    expect([Math.round(x), Math.round(y), below]).toEqual([328, 108, true])
  })

  it('keeps it 5px inside the window (ktor.io at 380px wide: 5)', () => {
    expect(tooltipPosition!({ left: 33, right: 189.09, top: 400, bottom: 420 }, size, 380).x).toBe(5)
    expect(tooltipPosition!({ left: 300, right: 370, top: 400, bottom: 420 }, size, 380).x).toBe(55)
  })
})
