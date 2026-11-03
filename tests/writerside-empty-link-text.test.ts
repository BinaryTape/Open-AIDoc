import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { linkTitle } from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-empty-link-text'
import { isWritersideDoc } from '../docs/.vitepress/utils/doctype-utils'

let md: MarkdownRenderer
let srcDir: string

const typecasts = [
  '[//]: # (title: 类型检查与转换)',
  '',
  '## 智能转换 {id="smart-casts"}',
  '',
  '```kotlin',
  '## Not a heading {id="in-code"}',
  '```',
  '',
  '### `is` 与 `!is` 操作符 {id="is-and-is-operators" collapsible="true"}',
  '',
  '## 交集类型 <secondary-label ref="beta"/> {id="intersection-types"}',
  '',
  '## 不安全的转换操作符',
].join('\n')

beforeAll(async () => {
  srcDir = mkdtempSync(path.join(tmpdir(), 'empty-link-text-'))
  mkdirSync(path.join(srcDir, 'kotlin'))
  mkdirSync(path.join(srcDir, 'ja/kotlin'), { recursive: true })
  mkdirSync(path.join(srcDir, 'koog'))
  writeFileSync(path.join(srcDir, 'kotlin/typecasts.md'), typecasts)
  writeFileSync(path.join(srcDir, 'kotlin/whatsnew.md'), '[//]: # (title: Kotlin %kotlinVersion% 的最新变化)\n')
  writeFileSync(path.join(srcDir, 'kotlin/h1-page.md'), '# 页面标题 {id="h1-page"}\n\n正文\n')
  writeFileSync(path.join(srcDir, 'ja/kotlin/typecasts.md'), '[//]: # (title: 型チェックとキャスト)\n')
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

afterAll(() => rmSync(srcDir, { recursive: true, force: true }))
afterEach(() => vi.restoreAllMocks())

// The page is written to disk too: same-page links look up its source.
async function render(markdown: string, relativePath = 'kotlin/page.md') {
  writeFileSync(path.join(srcDir, relativePath), markdown)
  return md.renderAsync(markdown, { path: path.join(srcDir, relativePath), relativePath, cleanUrls: true })
}

const links = (html: string) => [...html.matchAll(/<a href="([^"]*)"[^>]*>(.*?)<\/a>/g)].map((m) => [m[1], m[2]])

describe('Writerside links without text', () => {
  it('shows the heading title for a link on the same page', async () => {
    // As in whatsnew21: "* [](#support-for-requiring-opt-in-to-extend-apis)"
    const html = await render('## 守卫条件 {id="guard-conditions"}\n\n* [](#guard-conditions)\n')
    expect(links(html)).toEqual([['#guard-conditions', '守卫条件']])
  })

  it('shows the title of another page, in the page language', async () => {
    expect(links(await render('[](typecasts.md)\n'))).toEqual([['/kotlin/typecasts', '类型检查与转换']])
    expect(links(await render('[](typecasts.md)\n', 'ja/kotlin/page.md'))).toEqual([['/ja/kotlin/typecasts', '型チェックとキャスト']])
  })

  it('shows a heading of another page, with its inline code', async () => {
    const html = await render('[](typecasts.md#smart-casts) [](typecasts.md#is-and-is-operators)\n')
    expect(links(html)).toEqual([
      ['/kotlin/typecasts#smart-casts', '智能转换'],
      ['/kotlin/typecasts#is-and-is-operators', '<code>is</code> 与 <code>!is</code> 操作符'],
    ])
  })

  it('leaves out the labels and attributes of a heading', async () => {
    expect(links(await render('[](typecasts.md#intersection-types)\n'))).toEqual([['/kotlin/typecasts#intersection-types', '交集类型']])
  })

  it('finds a heading without an explicit id by its generated id', async () => {
    expect(links(await render('[](typecasts.md#不安全的转换操作符)\n'))[0][1]).toBe('不安全的转换操作符')
  })

  it('takes a page title from its H1 when it has no title comment', async () => {
    expect(links(await render('[](h1-page.md)\n'))[0][1]).toBe('页面标题')
  })

  it('fills Writerside variables in the title', async () => {
    const [[, text]] = links(await render('[](whatsnew.md)\n'))
    expect(text).toMatch(/^Kotlin \d+\.\d+\.\d+ 的最新变化$/)
  })

  it('shows the address of a target it cannot find, and reports it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = await render('[](missing.md) [](typecasts.md#in-code)\n')
    // A page not in docs/kotlin goes to kotlinlang.org (the Kotlin link rewriter).
    expect(links(html).map(([, text]) => text)).toEqual(['missing.md', 'typecasts.md#in-code'])
    expect(warn).toHaveBeenCalledTimes(2)
  })

  it('leaves links with text, external links and other doc types as they were', async () => {
    const html = await render('[智能转换](typecasts.md#smart-casts) [](https://kotlinlang.org)\n')
    expect(links(html)).toEqual([
      ['/kotlin/typecasts#smart-casts', '智能转换'],
      ['https://kotlinlang.org', ''],
    ])
    expect(links(await render('[](#x)\n', 'koog/page.md'))).toEqual([['#x', '']])
  })
})

describe('Empty links in the published pages', () => {
  it('all have a title to show', () => {
    const docs = path.resolve('docs')
    const missing: string[] = []
    let count = 0
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'public') continue
        const file = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(file)
        else if (entry.name.endsWith('.md')) {
          const relativePath = path.relative(docs, file).split(path.sep).join('/')
          const env = { path: file, relativePath }
          if (!isWritersideDoc(env)) continue
          for (const m of readFileSync(file, 'utf8').matchAll(/(?<!!)\[\]\(([^)\s]+)\)/g)) {
            count++
            if (linkTitle(m[1], env) === null) missing.push(`${relativePath}: ${m[1]}`)
          }
        }
      }
    }
    walk(docs)
    expect(count).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })
})
