import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const strip = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')
const sfc = readFileSync('docs/.vitepress/component/Def.vue', 'utf8')
const style = strip(sfc.match(/<style scoped>([\s\S]*?)<\/style>/)![1])
const colours = strip(readFileSync('docs/.vitepress/styles/ws-def.css', 'utf8'))
const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

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

describe('definition list cards, as on ktor.io and kotlinlang.org', () => {
  it('are square cards with a border, 12px apart', () => {
    const card = rule(style, '.ws-def')
    expect(card).toMatchObject({
      'margin-top': '12px',
      padding: '16px',
      border: '1px solid var(--ws-def-border)',
      'background-color': 'var(--ws-def-bg)',
    })
    expect(card['border-radius']).toBeUndefined()
    expect(rule(style, '.ws-def:first-child')).toEqual({ 'margin-top': '0' })
  })

  it('have a 17px title', () => {
    expect(rule(style, '.ws-def-title')['font-size']).toBe('17px')
  })

  it('take the upstream colours, light and dark', () => {
    expect(rule(colours, ':root')).toMatchObject({ '--ws-def-border': '#e8e8e8', '--ws-def-bg': '#f9f9f9' })
    expect(rule(colours, '.dark')).toMatchObject({ '--ws-def-border': '#474749', '--ws-def-bg': '#1f1f21' })
    expect(theme).toContain("import '../styles/ws-def.css'")
  })
})
