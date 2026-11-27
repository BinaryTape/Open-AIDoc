import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// A word in inline code longer than the line did not break outside paragraphs
// and list items (a callout, a TL;DR box), and made a phone's page wider than
// its screen; kotlinlang.org, ktor.io and the MkDocs sites break it (P2-55).
const rule = (selector: string) => {
  const css = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?:^|\\n|\\})\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? ''
}

describe('inline code', () => {
  it('breaks a word longer than the line, as kotlinlang.org and ktor.io do', () => {
    expect(rule('.vp-doc :not(pre) > code')).toContain('word-break: break-word')
  })

  it('keeps the normal breaks in a table, as kotlinlang.org does', () => {
    expect(rule('.vp-doc table :not(pre) > code')).toContain('word-break: normal')
  })
})
