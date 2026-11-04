import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { NOSCRIPT_AOS } from '../docs/.vitepress/config/noscript.config'

const aosCss = readFileSync(createRequire(import.meta.url).resolve('aos/dist/aos.css'), 'utf8')

/** The rules of a minified stylesheet: [selector, declarations]. */
const rules = (css: string) => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1], m[2]])

describe('the home page cards without JavaScript', () => {
  it('are shown by a style that only applies without JavaScript', () => {
    const [tag, , content] = NOSCRIPT_AOS
    expect(tag).toBe('noscript')
    expect(content).toBe('<style>[data-aos]{opacity:1!important;transform:none!important}</style>')
  })

  it('are hidden by aos.css only through what that style overrides', () => {
    // aos.css hides and moves [data-aos] elements until AOS animates them in
    const hiding = rules(aosCss).filter(([, decls]) => /opacity:0|transform:/.test(decls))
    expect(hiding.length).toBeGreaterThan(0)
    for (const [selector, decls] of hiding) {
      expect(selector).toMatch(/\[data-aos/)
      expect(decls.replace(/(opacity|transform)[^;]*;?|transition-property[^;]*;?/g, '')).toBe('')
    }
  })
})
