import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { globSync } from 'glob'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { WS_INLINE_TAGS } from '../docs/.vitepress/config/inline-tags.config'
import { mkDocsFileTitle } from '../docs/.vitepress/plugins/markdown/common/markdown-it-auto-title'
import { expandMkDocsSnippets } from '../docs/.vitepress/plugins/vite/mkdocs-snippets'

const h1s = (html: string) => [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => m[1].replace(/<[^>]+>|&#8203;/g, '').trim())

describe('MkDocs pages without an H1, titled as MkDocs does', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    // VitePress keeps the first renderer it creates, so this one is the only one
    md = await createMarkdownRenderer('docs', {
      component: { inlineTags: WS_INLINE_TAGS },
      config: (md) => registerMarkdownPlugins(md),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })

  it('names a page after its file, as sqldelight.github.io does', () => {
    // <title>Index schema sq - SQLDelight</title>, <h1>Index schema sq</h1>
    expect(mkDocsFileTitle('sqldelight/common/index_schema_sq.md')).toBe('Index schema sq')
    expect(mkDocsFileTitle('sqldelight/common/gradle-dependencies.md')).toBe('Gradle dependencies')
    expect(mkDocsFileTitle('ja/sqldelight/common/androidx_paging_usage.md')).toBe('Androidx paging usage')
    expect(mkDocsFileTitle('zh-Hant/sqldelight/multiplatform_sqlite/index_schema.md')).toBe('Index schema')
    // an index page after its directory; a name with capitals as it is
    expect(mkDocsFileTitle('koog/a2a/index.md')).toBe('A2a')
    expect(mkDocsFileTitle('coil/index.md')).toBe('Home')
    expect(mkDocsFileTitle('coil/README.md')).toBe('README')
  })

  it('gives an untitled include file of SQLDelight its title as an H1, in every language', async () => {
    const body = 'SQLDelight 提供两种数据分页方法。\n\n## 基于偏移量的分页\n'
    expect(h1s(await render(body, 'sqldelight/common/androidx_paging_usage.md'))).toEqual(['Androidx paging usage'])
    expect(h1s(await render(body, 'ko/sqldelight/common/androidx_paging_usage.md'))).toEqual(['Androidx paging usage'])
  })

  it('gives that heading no id, as Material does, so it takes no anchor of the page', async () => {
    // common/custom_column_types.md: ## 自定义列类型 {id="custom-column-types"}
    const env = { relativePath: 'sqldelight/common/custom_column_types.md', cleanUrls: true } as any
    const html = await md.renderAsync('## 自定义列类型 {id="custom-column-types"}\n\nText.\n', env)
    expect(html).toMatch(/^<h1>Custom column types<\/h1>\n<h2 id="custom-column-types"/)
    expect(env.title).toBe('Custom column types')
  })

  it('leaves a page with an H1 alone', async () => {
    expect(h1s(await render('# AndroidX Paging\n\nText.\n', 'sqldelight/common/androidx_paging_multiplatform.md'))).toEqual(['AndroidX Paging'])
  })

  it('names pages after their files on MkDocs sites only', async () => {
    // Koin (Docusaurus) pages have a title of their own; Writerside topics are titled elsewhere
    expect(h1s(await render('Text.\n', 'koin/reference/untitled.md'))).toEqual([])
    expect(h1s(await render('Text.\n', 'kotlin/untitled.md'))).toEqual([])
  })
})

describe('Koog snippets are not pages', () => {
  const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
  const srcExclude = JSON.parse(/srcExclude: (\[[^\]]*\])/.exec(config)![1].replaceAll("'", '"')) as string[]

  it('leaves docs/snippets out of the build, as Koog\'s exclude_docs does, in every language', () => {
    const all = globSync('**/koog/**/*.md', { cwd: 'docs', posix: true })
    const built = new Set(globSync('**/koog/**/*.md', { cwd: 'docs', posix: true, ignore: srcExclude }))
    const left = all.filter((page) => !built.has(page))

    expect(left.length).toBeGreaterThan(0)
    expect(left.every((page) => /^(?:(?:ja|ko|zh-Hant)\/)?koog\/snippets\//.test(page))).toBe(true)
    expect(all.filter((page) => page.includes('/snippets/')).every((page) => !built.has(page))).toBe(true)
    expect(left.map((page) => page.replace(/^[^/]+\/(?=koog)/, ''))).toContain('koog/snippets/quickstart-snippets.md')
  })

  it('still expands them into the pages that use them', () => {
    const page = 'docs/koog/quickstart.md'
    const expanded = expandMkDocsSnippets(readFileSync(page, 'utf8'), page)
    expect(expanded).not.toMatch(/--8<--/)
  })
})
