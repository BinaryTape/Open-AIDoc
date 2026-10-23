import { describe, expect, it } from 'vitest'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { vueCompilerOptions } from '../docs/.vitepress/config/vue-template.config'
import Deflist from '../docs/.vitepress/component/Deflist.vue'
import Def from '../docs/.vitepress/component/Def.vue'

async function renderMarkdown(markdown: string, relativePath = 'ktor/client-websockets.md') {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

/** The page as the server renders it: the Markdown output compiled as a Vue template. */
async function renderPage(markdown: string, relativePath?: string) {
  const html = await renderMarkdown(markdown, relativePath)
  const render = Vue.compile(`<div>${html}</div>`, vueCompilerOptions as Vue.CompilerOptions)
  const app = Vue.createSSRApp({ render })
  app.component('deflist', Deflist)
  app.component('def', Def)
  // Without the components' scope attributes, to read.
  return (await renderToString(app)).replace(/ data-v-\w+(?:-s)?/g, '')
}

const websockets =
  '<deflist>\n' +
  '    <def id="maxFrameSize">\n' +
  '        <title><code>maxFrameSize</code></title>\n' +
  '        帧的最大大小。\n' +
  '    </def>\n' +
  '</deflist>\n'

describe('Writerside definition titles', () => {
  it('renders the code in a title as code', async () => {
    // Was <dt class="ws-def-title">&lt;code&gt;maxFrameSize&lt;/code&gt;</dt>:
    // Vue parses <title> as text, so the page showed the tags.
    const html = await renderPage(websockets)
    expect(html).toMatch(/<dt class="ws-def-title"[^>]*><code>maxFrameSize<\/code><\/dt>/)
    expect(html).not.toContain('&lt;code&gt;')
  })

  it('renders the code in a collapsible definition’s summary', async () => {
    const html = await renderPage(websockets.replace('<deflist>', '<deflist collapsible="true">'))
    expect(html).toContain('<summary><code>maxFrameSize</code></summary>')
    expect(html).not.toContain('&lt;code&gt;')
  })

  it('renames the title of a definition, and only that', async () => {
    const html = await renderMarkdown(websockets)
    expect(html).toContain('<def-title><code>maxFrameSize</code></def-title>')
    expect(html).not.toMatch(/<\/?title>/)
  })

  it('finds the definition across a blank line', async () => {
    // As in server-http3: <def> and <title> end up in two HTML blocks.
    const html = await renderMarkdown(
      '<deflist type="full">\n\n<def id="quicMaxIdleTimeout">\n\n<title><code>quicMaxIdleTimeout</code></title>\n\n空闲超时。\n\n</def>\n\n</deflist>\n',
      'ktor/server-http3.md'
    )
    expect(html).toContain('<def-title><code>quicMaxIdleTimeout</code></def-title>')
    expect(html).not.toContain('<title>')
  })

  it('handles definitions nested in a definition', async () => {
    // As in client-server-sent-events: a list of values in a parameter's definition.
    const html = await renderPage(
      '<deflist>\n' +
      '    <def id="bufferPolicy">\n' +
      '        <title><code>bufferPolicy</code></title>\n' +
      '        <p>缓冲策略：</p>\n' +
      '        <deflist>\n' +
      '            <def id="buffer-off">\n' +
      '                <title><code>Off</code>（默认）</title>\n' +
      '                不缓冲。\n' +
      '            </def>\n' +
      '        </deflist>\n' +
      '    </def>\n' +
      '</deflist>\n',
      'ktor/client-server-sent-events.md'
    )
    expect(html).toMatch(/<dt class="ws-def-title"[^>]*><code>bufferPolicy<\/code><\/dt>/)
    expect(html).toMatch(/<dt class="ws-def-title"[^>]*><code>Off<\/code>（默认）<\/dt>/)
    expect(html).not.toContain('&lt;')
  })

  it('leaves other titles alone', async () => {
    const panel = '<panels columns="2">\n<panel>\n<title>初学者</title>\n\n说明。\n</panel>\n</panels>\n'
    expect(await renderMarkdown(panel, 'kotlin/kotlin-tour-welcome.md')).toContain('<title>初学者</title>')

    const fence = '```xml\n<def id="a"><title><code>a</code></title></def>\n```\n'
    expect(await renderMarkdown(fence)).not.toContain('def-title')

    // MkDocs and other docs are not Writerside.
    expect(await renderMarkdown(websockets, 'koog/index.md')).toContain('<title><code>maxFrameSize</code></title>')
  })
})
