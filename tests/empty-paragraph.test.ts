import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('docs/.vitepress/styles/ws-empty-paragraph.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')

/** The declarations of a selector, without whitespace. */
const declarations = (selector: string) =>
  css.match(new RegExp(selector.replace(/[.*+]/g, '\\$&') + '\\s*\\{([^}]*)\\}'))?.[1].replace(/\s+/g, '')

describe('empty paragraphs of Writerside pages', () => {
  it('have no margins, as on the upstream sites', () => {
    expect(declarations('.vp-doc p:empty')).toBe('margin:0;')
  })

  it('drop the line break that follows one', () => {
    expect(declarations('.vp-doc p:empty + br')).toBe('display:none;')
  })

  it('are styled on every page', () => {
    expect(theme).toContain("import '../styles/ws-empty-paragraph.css'")
  })
})
