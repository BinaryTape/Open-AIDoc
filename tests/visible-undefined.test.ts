import { describe, expect, it } from 'vitest'
import { visibleUndefined } from '../scripts/lib/visible-undefined.mjs'

const page = (main: string) => `<html><body><nav>undefined</nav><main class="main">${main}</main></body></html>`

describe('visibleUndefined', () => {
  it.each([
    ['a paragraph of its own (an include not found)', '<ul><li>CIO only</li></ul><p>undefined</p><h2>Add dependencies</h2>'],
    ['a link summary', '<span class="ws-tooltip-wrapper"><a href="/ktor/x" class="ws-link">X</a><span class="ws-tooltip" data-v-30588f80>undefined</span></span>'],
    ['the text of a link', '<p>See <a href="/kmp/compose-test#locales">undefined</a>.</p>'],
  ])('counts %s', (_, main) => {
    expect(visibleUndefined(page(main))).toBe(1)
  })

  it('leaves the word in a sentence, code and the page frame alone', () => {
    const main = '<p>Nullability is undefined by default.</p>' +
      '<pre><code>let x = undefined</code></pre><p>Returns <code>undefined</code>.</p>'
    expect(visibleUndefined(page(main))).toBe(0)
  })

  it('counts every placeholder of a page', () => {
    expect(visibleUndefined(page('<p>undefined</p><p>Text.</p><p> undefined </p>'))).toBe(2)
  })
})
