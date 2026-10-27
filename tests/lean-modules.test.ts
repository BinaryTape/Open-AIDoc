import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { strippedCode } from '../scripts/lib/lean-modules.mjs'

// VitePress's own regexes, read from the installed (patched) package.
const require = createRequire(import.meta.url)
const vitepressNode = join(dirname(require.resolve('vitepress/package.json')), 'dist/node')
const source = readdirSync(vitepressNode)
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(join(vitepressNode, file), 'utf8'))
  .find((code) => code.includes('const staticInjectMarkerRE'))!
const regexOf = (name: string) => {
  const literal = new RegExp(`const ${name} = (/.+/[a-z]*);`).exec(source)![1]
  return new Function(`return ${literal}`)() as RegExp
}
const staticInjectMarkerRE = regexOf('staticInjectMarkerRE')
const staticStripRE = regexOf('staticStripRE')

/** VitePress's lean chunk: mark the static strings (renderChunk), then empty them. */
function lean(chunk: string) {
  return chunk
    .replace(staticInjectMarkerRE, (_, str1, str2, flag) => {
      const str = str1 || str2
      const quote = str[0]
      return `createStaticVNode(${quote}__VP_STATIC_START__${str.slice(1, -1)}__VP_STATIC_END__${quote}, ${flag})`
    })
    .replace(staticStripRE, '""')
}

// Two static vnodes on one line, as Rolldown prints a page whose static runs
// sit in short lists (kotlin/lincheck-getting-started).
const oneLine =
  'return openBlock(), createElementBlock("div", null, [createElementVNode("ul", null, [' +
  'createElementVNode("li", null, [_cache[0] || (_cache[0] = createStaticVNode("<p id=\\"a\\">First</p><p>a()</p>", 2)), createElementVNode("p", null, toDisplayString(_ctx.x), 1)]), ' +
  'createElementVNode("li", null, [_cache[1] || (_cache[1] = createStaticVNode("<p id=\\"b\\">Second</p>", 2)), createElementVNode("p", null, toDisplayString(_ctx.y), 1)])])]);'

describe('VitePress lean chunks (patched)', () => {
  it('empties each static string on its own, also with two on one line', () => {
    // The greedy ".*" marked from the first string to the end of the second,
    // so the code between them went with the HTML.
    expect(lean(oneLine)).toBe(
      'return openBlock(), createElementBlock("div", null, [createElementVNode("ul", null, [' +
      'createElementVNode("li", null, [_cache[0] || (_cache[0] = createStaticVNode("", 2)), createElementVNode("p", null, toDisplayString(_ctx.x), 1)]), ' +
      'createElementVNode("li", null, [_cache[1] || (_cache[1] = createStaticVNode("", 2)), createElementVNode("p", null, toDisplayString(_ctx.y), 1)])])]);'
    )
  })

  it('empties HTML joined from pieces, as a whole', () => {
    // An image puts its URL between two pieces of the page's HTML; the greedy
    // ".*" covered that by running to the last quote.
    expect(lean('_cache[0] || (_cache[0] = createStaticVNode("<p><img src=\\"" + "/coil/logo.svg" + "\\"></p>", 1)), f()'))
      .toBe('_cache[0] || (_cache[0] = createStaticVNode("", 1)), f()')
    expect(lean('createStaticVNode("<img src=\\"" + _imports_0 + "\\"><img src=\\"" + _imports_1 + "\\">", 2), g("x")'))
      .toBe('createStaticVNode("", 2), g("x")')
  })

  it('still handles escaped quotes and single quotes', () => {
    expect(lean(`createStaticVNode('<p title="x">It\\'s</p>', 1), f()`)).toBe(`createStaticVNode("", 1), f()`)
    expect(lean('createStaticVNode("<p>\\"q\\" \\\\</p>", 1), f()')).toBe('createStaticVNode("", 1), f()')
  })
})

describe('strippedCode', () => {
  // Minified, as in dist/assets: the helper is `a`.
  const full = 'e(),n(`div`,null,[...o[0]||=[a(`<h1>T</h1><p>See <code>a()</code></p>`,2),i(`li`,null,[o[1]||=a(`<p>One</p><p>Two</p>`,2)])]])'

  it('accepts a lean module that only lost the HTML', () => {
    // The `a()` in the HTML text is not a call.
    expect(strippedCode(full, 'e(),n(`div`,null,[...o[0]||=[a("",2),i(`li`,null,[o[1]||=a("",2)])]])')).toEqual([])
  })

  it('reports code stripped with the HTML', () => {
    // The span from the first string to the second was emptied as one.
    expect(strippedCode(full, 'e(),n(`div`,null,[...o[0]||=[a("",2)])]])')).toEqual([{ name: 'a', full: 2, lean: 1 }])
  })

  it('has nothing to compare on a page without static vnodes', () => {
    expect(strippedCode('e(),n(`div`,null,x)', 'e(),n(`div`,null,x)')).toEqual([])
  })
})
