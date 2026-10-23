import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileTemplate } from 'vue/compiler-sfc'
import { GLOBAL_COMPONENTS, isPlainElement, vueCompilerOptions } from '../docs/.vitepress/config/vue-template.config'
import IgnoreComponent from '../docs/.vitepress/component/IgnoreComponent.vue'
import Link from '../docs/.vitepress/component/Link.vue'
import Tabs from '../docs/.vitepress/component/Tabs.vue'
import Tab from '../docs/.vitepress/component/Tab.vue'
import Card from '../docs/.vitepress/component/Card.vue'
import LinkGroup from '../docs/.vitepress/component/LinkGroup.vue'

// Vue hydration needs the server HTML and the browser's first render to be the
// same tree. These check the server side of the components that differed.

const render = (root: Component) => renderToString(createSSRApp(root))

describe('template compiler options', () => {
  it('knows every component registered in theme/index.ts', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const registered = [...theme.matchAll(/app\.component\(['"]([^'"]+)['"]/g)].map((m) => m[1])
    expect([...GLOBAL_COMPONENTS].sort()).toEqual([...registered].sort())
  })

  it('compiles Writerside tags without a component as plain elements', () => {
    for (const tag of ['primary-label', 'secondary-label', 'shortcut', 'compare', 'seealso', 'no-index']) {
      expect(isPlainElement(tag), tag).toBe(true)
    }
  })

  it('leaves components, Vue built-ins and form controls alone', () => {
    for (const tag of ['tabs', 'tab-item', 'code-block', 'note', 'warning', 'links', 'TopicTitle', 'Badge', 'component', 'slot', 'template', 'transition', 'input', 'select', 'textarea']) {
      expect(isPlainElement(tag), tag).toBe(false)
    }
  })

  it('server-renders the content of an unknown tag', async () => {
    const source = '<div><primary-label ref="server-plugin"/><seealso><p>Careful.</p></seealso><shortcut>Ctrl+C</shortcut></div>'
    const compilerOptions = { isCustomElement: isPlainElement }
    const { code } = compileTemplate({ source, filename: 'page.md', id: 'page', ssr: true, ssrCssVars: [], compilerOptions })
    expect(code).not.toContain('resolveComponent')

    const client = compileTemplate({ source, filename: 'page.md', id: 'page', compilerOptions }).code
    expect(client).not.toContain('resolveComponent')
    expect(client).toContain('"seealso"')

    // The server code writes the tags out with their content.
    expect(code).toContain('<primary-label></primary-label>')
    expect(code).toContain('<seealso><p>Careful.</p></seealso>')
    expect(code).toContain('<shortcut>Ctrl+C</shortcut>')
  })

  it('puts table rows in a tbody, as the browser does', () => {
    // A component in a cell makes Vue render the table node by node.
    const source = '<table><tr><th>Target</th></tr><tr><td><code-block lang="kotlin">x</code-block></td></tr></table>'
    const compile = (ssr: boolean) => compileTemplate({ source, filename: 'page.md', id: 'page', ssr, ssrCssVars: [], compilerOptions: vueCompilerOptions }).code
    expect(compile(true)).toContain('><tbody><tr><th>Target</th></tr><tr><td>')
    expect(compile(false)).toMatch(/"table", null, \[\s*_createElementVNode\("tbody"/)
  })

  it('keeps rows wrapped in a snippet inside the tbody', () => {
    const source = '<table><tr><td>A</td></tr><snippet id="s"><tr><td><code-block>x</code-block></td></tr></snippet><tr><td>B</td></tr></table>'
    const code = compileTemplate({ source, filename: 'page.md', id: 'page', ssr: true, ssrCssVars: [], compilerOptions: vueCompilerOptions }).code
    // One tbody, opened before the first row and closed after the last.
    expect(code.match(/<tbody>/g)).toHaveLength(1)
    expect(code).toMatch(/<tbody><tr><td>A<\/td><\/tr>`\)[\s\S]*_component_snippet[\s\S]*<tr><td>B<\/td><\/tr><\/tbody><\/table>/)
  })

  it('renders panel titles as visible elements, not <title>', () => {
    const compile = (source: string) => compileTemplate({ source, filename: 'page.md', id: 'page', ssr: true, ssrCssVars: [], compilerOptions: vueCompilerOptions }).code
    const panel = compile('<panels><panel><title>Beginner</title><p>Basics.</p></panel></panels>')
    expect(panel).toContain('<div class="ws-title">Beginner</div>')
    expect(panel).not.toContain('<title>')
    // A component reading <title> from its slot still gets it.
    expect(compile('<cards><title>Start</title></cards>')).toMatch(/_createVNode\("title"|"title"/)
  })

  describe('a paragraph whose only content is a paragraph', () => {
    // In a container, as on a page: the root element gets Vue's fallthrough attributes.
    const compile = (source: string) => compileTemplate({ source: `<div>${source}</div>`, filename: 'page.md', id: 'page', ssr: true, ssrCssVars: [], compilerOptions: vueCompilerOptions }).code

    it('becomes one paragraph, as the browser cannot nest them', () => {
      // An <include> of a <p> snippet, wrapped in <p> (ktor/server-create-websocket-application).
      const code = compile('<ol><li><p>\n    <p>Click the Gradle icon\n    (<img alt="icon" src="i.svg"/>) to load changes.</p>\n</p></li></ol>')
      expect(code).toContain('<ol><li><p>Click the Gradle icon (<img alt="icon" src="i.svg">) to load changes.</p></li></ol>')
    })

    it('keeps the attributes of both', () => {
      expect(compile('<p id="outer" class="a"><p class="b">Text.</p></p>')).toContain('<p id="outer" class="b">Text.</p>')
    })

    it('handles more than two levels and comments', () => {
      expect(compile('<p><!-- c --><p><p>Text.</p></p></p>')).toMatch(/><p>Text\.<\/p><\/div>/)
    })

    it('leaves a paragraph with other content alone', () => {
      expect(compile('<p>Before <p>Inner.</p></p>')).toContain('<p>Before <p>Inner.</p></p>')
      expect(compile('<p><p>One.</p><p>Two.</p></p>')).toContain('<p><p>One.</p><p>Two.</p></p>')
      expect(compile('<p>Plain.</p>')).toContain('<p>Plain.</p>')
    })
  })
})

describe('components', () => {
  it('IgnoreComponent leaves a comment, as it does in the browser', async () => {
    expect(await render(() => h('div', [h(IgnoreComponent)]))).toBe('<div><!----></div>')
  })

  it('Links renders no block element, so it can sit in a paragraph', async () => {
    const html = await render(() => h('p', [h('b', [h(Link, { href: '/ktor/server-native', summary: 'Native server.' }, () => 'Native')])]))
    expect(html).toContain('ws-tooltip-wrapper')
    expect(html).toContain('Native server.')
    const inParagraph = html.slice('<p>'.length, -'</p>'.length)
    expect(inParagraph).not.toMatch(/<(div|p|ul|ol|table|pre|hd)[s>]/)
  })

  it('Tabs uses the same ids on every render', async () => {
    const page = () => h('div', [
      h(Tabs, null, () => [h(Tab, { title: 'Kotlin' }, () => 'a'), h(Tab, { title: 'Groovy' }, () => 'b')]),
      h(Tabs, null, () => [h(Tab, { title: 'Maven' }, () => 'c')]),
    ])
    const first = await render(page)
    expect(await render(page)).toBe(first)

    const names = [...first.matchAll(/name="([^"]+)"/g)].map((m) => m[1])
    expect(new Set(names).size).toBe(2)
    for (const [, id] of first.matchAll(/ id="([^"]+)"/g)) {
      expect(first).toContain(`for="${id}"`)
    }
  })

  it('Card and LinkGroup do not depend on the window width', async () => {
    expect(await render(() => h(Card, { href: '/a', summary: 'S' }, () => 'T'))).toContain('class="ws-card ws-col-12 ws-col-sm-6"')
    expect(await render(() => h(LinkGroup))).toContain('class="ws-link-group ws-col-12 ws-col-sm-4"')
  })
})
