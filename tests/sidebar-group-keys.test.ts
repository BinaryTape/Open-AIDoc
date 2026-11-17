import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateSidebar } from '../tools/pipeline/processors/SidebarProcessor.mjs'
import { CONTENT_LOCALES } from '../shared/locales'

// A group of a Writerside tree is keyed by its title, a page by its file, so a
// group titled like one of the pages shared that page's key: kotlinlang's
// "Basic syntax > Overview" showed as "Overview > Overview" (P2-30).
describe('the sidebar keys of a Writerside tree', () => {
  let dir: string
  const cwd = process.cwd()
  const locale = (lang: string) => JSON.parse(readFileSync(join(dir, `docs/.vitepress/locales/${lang}.json`), 'utf8'))
  const tree = async (entries: string) => {
    writeFileSync(join(dir, 'kr.tree'), `<instance-profile id="kr">${entries}</instance-profile>`)
    await generateSidebar(join(dir, 'kr.tree'), 'kotlin')
    return JSON.parse(readFileSync(join(dir, 'docs/.vitepress/sidebar/kotlin.sidebar.json'), 'utf8'))
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'sidebar-'))
    mkdirSync(join(dir, 'docs/.vitepress/locales'), { recursive: true })
    mkdirSync(join(dir, 'docs/.vitepress/sidebar'), { recursive: true })
    for (const lang of ['en', ...CONTENT_LOCALES]) writeFileSync(join(dir, `docs/.vitepress/locales/${lang}.json`), '{}')
    process.chdir(dir)
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(dir, { recursive: true, force: true })
  })

  it('give a group titled like a page its own key', async () => {
    const sidebar = await tree(
      '<toc-element toc-title="Basic syntax">' +
        '<toc-element toc-title="Overview" topic="basic-syntax.md"/><toc-element topic="packages.md"/>' +
      '</toc-element>'
    )
    expect(sidebar[0].text).toBe('kotlin.basic-syntax.group')
    expect(sidebar[0].items[0]).toMatchObject({ text: 'kotlin.basic-syntax', link: 'basic-syntax' })
    expect(locale('en')).toMatchObject({ 'kotlin.basic-syntax.group': 'Basic syntax', 'kotlin.basic-syntax': 'Overview' })
  })

  it('leave a page without a toc-title its own title', async () => {
    const sidebar = await tree('<toc-element toc-title="Control flow"><toc-element topic="control-flow.md"/></toc-element>')
    expect(sidebar[0].text).toBe('kotlin.control-flow.group')
    expect(sidebar[0].items[0]).toMatchObject({ text: 'kotlin.control-flow', link: 'control-flow' })
    expect(locale('en')['kotlin.control-flow.group']).toBe('Control flow')
    // No label: the sidebar shows the page's title (config/sidebar.config.ts)
    for (const lang of ['en', ...CONTENT_LOCALES]) expect(locale(lang)).not.toHaveProperty('kotlin.control-flow')
  })

  it('find the page wherever it is in the tree', async () => {
    const sidebar = await tree(
      '<toc-element topic="releases.md" toc-title="Ktor releases"/>' +
      '<toc-element toc-title="Releases"><toc-element topic="migrating-3.md"/></toc-element>'
    )
    expect(sidebar.map((n: { text: string }) => n.text)).toEqual(['kotlin.releases', 'kotlin.releases.group'])
  })

  it('keep the key of any other group', async () => {
    const sidebar = await tree(
      '<toc-element toc-title="Language guide"><toc-element topic="basic-syntax.md"/></toc-element>' +
      '<toc-element toc-title="Ktor" href="https://ktor.io/docs/welcome.html"/>' +
      '<toc-element hidden="true" topic="ktor.md"/>'
    )
    expect(sidebar.map((n: { text: string }) => n.text)).toEqual(['kotlin.language-guide', 'kotlin.ktor'])
  })

  it('warn when two titles slugify to the same key', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await tree('<toc-element toc-title="C++"/><toc-element toc-title="C"/>')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"C++" and "C" share the key kotlin.c'))
    warn.mockRestore()
  })
})

describe('the site sidebars', () => {
  // A key both a page and an entry without a page use shows the same label for both
  it('give no key to both a page and an entry without a page', () => {
    const shared: string[] = []
    for (const file of readdirSync('docs/.vitepress/sidebar')) {
      const kinds = new Map<string, Set<string>>()
      const walk = (nodes: { text: string; link?: string; items?: unknown[] }[]) => {
        for (const node of nodes) {
          if (!kinds.has(node.text)) kinds.set(node.text, new Set())
          kinds.get(node.text)!.add(node.link ? 'page' : 'other')
          if (node.items) walk(node.items as typeof nodes)
        }
      }
      walk(JSON.parse(readFileSync(join('docs/.vitepress/sidebar', file), 'utf8')))
      for (const [key, set] of kinds) if (set.size > 1) shared.push(key)
    }
    expect(shared).toEqual([])
  })

  // Without a label an entry without a page shows its key, and a page the
  // title of its page instead of its toc-title (P0-22)
  it('have every label in every locale file', async () => {
    const { CONTENT_LOCALES } = await import('../shared/locales')
    const dict = (lang: string) => JSON.parse(readFileSync(`docs/.vitepress/locales/${lang}.json`, 'utf8'))
    const en = dict('en')
    const missing: string[] = []
    const used = new Set<string>()
    const walk = (nodes: { text: string; link?: string; items?: unknown[] }[]) => {
      for (const node of nodes) {
        used.add(node.text)
        if (!node.link && !(node.text in en)) missing.push(`en ${node.text}`)
        if (node.items) walk(node.items as typeof nodes)
      }
    }
    for (const file of readdirSync('docs/.vitepress/sidebar')) walk(JSON.parse(readFileSync(join('docs/.vitepress/sidebar', file), 'utf8')))
    for (const lang of CONTENT_LOCALES) {
      const translated = dict(lang)
      for (const key of used) if (key in en && !(key in translated)) missing.push(`${lang} ${key}`)
    }
    expect(missing).toEqual([])
  })
})
