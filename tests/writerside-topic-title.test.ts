import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

// VitePress compiles every page into a Vue template; one malformed attribute
// fails the whole site build. Render with VitePress's own renderer (it shapes
// the tokens the Writerside plugins rely on) and check what Vue makes of it.
async function renderAsVueTemplate(markdown: string) {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  const html = await md.renderAsync(markdown, { relativePath: 'kotlin/compiler-reference.md', cleanUrls: true })
  return { html, errors: parse(`<template><div>${html}</div></template>`).errors }
}

describe('Writerside titled headings', () => {
  it('turns a heading with a primary label into a TopicTitle', async () => {
    const { html, errors } = await renderAsVueTemplate(
      '### -Xallow-kotlin-package {id="xallow"}\n<primary-label ref="experimental-general"/>\n\nText.'
    )
    expect(errors).toEqual([])
    expect(html).toContain('<TopicTitle id="xallow" level="3" title="-Xallow-kotlin-package" labelRef="experimental-general"/>')
  })

  it('escapes heading text so quotes cannot break the page', async () => {
    const { html, errors } = await renderAsVueTemplate(
      '### Use "quoted" <names> & \'more\'\n<primary-label ref="experimental-general"/>\n\nText.'
    )
    expect(errors).toEqual([])
    expect(html).toContain(`title="Use &quot;quoted&quot; &lt;names&gt; &amp; 'more'"`)
  })

  it('renders the repaired compiler option heading', async () => {
    const { html, errors } = await renderAsVueTemplate(
      '### -Xcompiler-plugin-order={plugin.before>plugin.after} {id="xcompiler-plugin-order-plugin-before-plugin-after"}\n' +
        '<primary-label ref="experimental-general"/>\n\nText.'
    )
    expect(errors).toEqual([])
    expect(html).toContain('title="-Xcompiler-plugin-order={plugin.before&gt;plugin.after}"')
  })

  // Writerside takes the id unquoted too (kotlin/whatsnew24, P2-25)
  it('reads an id written without quotes, and keeps it out of the title', async () => {
    for (const block of ['{id=new-stable-features}', "{id='new-stable-features'}", '{id="new-stable-features"}']) {
      const { html, errors } = await renderAsVueTemplate(`## 新功能 ${block}\n\n<primary-label ref="stable"/>\n\nText.`)
      expect(errors, block).toEqual([])
      expect(html, block).toContain('<TopicTitle id="new-stable-features" level="2" title="新功能" labelRef="stable"/>')
    }
  })
})
