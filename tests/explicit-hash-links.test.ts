import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { slugify } from '@mdit-vue/shared'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

let md: MarkdownRenderer
let srcDir: string

const target = [
  '# Target',
  '## Install routing {id="install_plugin"}',
  '## 1. Kotlin helps {id="1-kotlin-helps"}',
  '<procedure id="MyProcedure"></procedure>',
].join('\n\n')

beforeAll(async () => {
  srcDir = mkdtempSync(path.join(tmpdir(), 'explicit-hash-'))
  mkdirSync(path.join(srcDir, 'ktor'))
  // A page that exists in docs/ktor: the Ktor link rewriter sends others to ktor.io.
  writeFileSync(path.join(srcDir, 'ktor/server-routing.md'), target)
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

afterAll(() => rmSync(srcDir, { recursive: true, force: true }))

// The page is written to disk too: same-page links look up its source.
async function render(markdown: string, relativePath = 'ktor/page.md') {
  writeFileSync(path.join(srcDir, relativePath), markdown)
  return md.renderAsync(markdown, { path: path.join(srcDir, relativePath), relativePath, cleanUrls: true })
}

const hrefs = (html: string) => [...html.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1])

describe('Markdown links to an explicit id', () => {
  it.each([
    ['an underscore', 'install_plugin'],
    ['a leading digit', '1-kotlin-helps'],
    ['upper case, on any element', 'MyProcedure'],
  ])('keeps a hash with %s', async (_, id) => {
    // Was slugified: #install-plugin, #_1-kotlin-helps, #myprocedure.
    expect(slugify(id)).not.toBe(id)
    const html = await render(`${target}\n\n[Go](#${id})\n`, 'ktor/server-routing.md')
    expect(hrefs(html)).toEqual([`#${id}`])
  })

  it('keeps it on a link to another page', async () => {
    expect(hrefs(await render('[Go](server-routing.md#install_plugin)\n'))).toEqual(['/ktor/server-routing#install_plugin'])
  })

  it('still slugifies a hash that is no explicit id on the target page', async () => {
    // Links to a generated heading id rely on the slug: here NFKD drops the voiced marks.
    const debug = 'コルーチンとスレッドのデバッグ'
    const html = await render(`## ${debug}\n\n[Go](#${debug})\n\n[Go](server-routing.md#Install_Routing)\n`)
    expect(hrefs(html)).toEqual([`#${slugify(debug)}`, '/ktor/server-routing#install-routing'])
  })

  it('leaves hashes that slugify keeps, and other links, as they were', async () => {
    const html = await render('[a](#install-routing) [b](https://ktor.io/docs/x.html#install_plugin) [c](server-plugins.md#install_plugin)\n')
    // server-plugins.md is not in this source directory: no source, no explicit id.
    expect(hrefs(html)).toEqual(['#install-routing', 'https://ktor.io/docs/x.html#install_plugin', '/ktor/server-plugins#install-plugin'])
  })
})
