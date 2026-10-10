import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pagesOf, readInventory, removeStalePages } from '../tools/pipeline/utils/stale-pages.mjs'
import { movedPagesFromMkDocs, movedPagesFromTree } from '../tools/pipeline/utils/moved-pages.mjs'
import { defaultStrategy } from '../tools/pipeline/sync-strategies/strategy.mjs'
import { kotlinStrategy } from '../tools/pipeline/sync-strategies/strategy-kotlin.mjs'
import { ktorStrategy } from '../tools/pipeline/sync-strategies/strategy-ktor.mjs'
import { coilStrategy } from '../tools/pipeline/sync-strategies/strategy-coil.mjs'

const LANGS = ['zh-Hans', 'zh-Hant', 'ja', 'ko']
const originalCwd = process.cwd()
let site: string

function write(file: string, content = '# Page\n') {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, content)
}

/** A repository of the `demo` doc type, its clone in clones/<id>. */
function repo(id: string, strategy: object = defaultStrategy, docType = 'demo') {
  return {
    id, docType, sidebarId: id, cloneDir: join(site, 'clones', id), sourceDocRoot: './docs',
    lastCheckFile: `.github/last_check_${id}.txt`, syncStrategy: strategy,
  }
}

/** Upstream docs of a clone: exactly these files. */
function upstream(r: { cloneDir: string }, files: string[], extra: Record<string, string> = {}) {
  rmSync(r.cloneDir, { recursive: true, force: true })
  files.forEach((f) => write(join(r.cloneDir, f)))
  Object.entries(extra).forEach(([f, content]) => write(join(r.cloneDir, f), content))
}

/** The translations of a page, in every language. */
const translations = (page: string, docType = 'demo') =>
  LANGS.map((lang) => join('docs', lang === 'zh-Hans' ? '' : lang, docType, page))

function publish(page: string, docType = 'demo') {
  translations(page, docType).forEach((file) => write(file))
}

const sync = (r: any, repos: any[] = [r]) => removeStalePages(r, r.cloneDir, { repos, languages: LANGS })

beforeEach(() => {
  site = mkdtempSync(join(tmpdir(), 'stale-pages-'))
  process.chdir(site)
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(site, { recursive: true, force: true })
})

describe('pagesOf', () => {
  it('maps the upstream files to the pages they become', async () => {
    const kotlin = { ...repo('kotlin-web-site', kotlinStrategy, 'kotlin') }
    upstream(kotlin, ['docs/topics/a/lambdas.md', 'docs/topics/b/home.topic', 'docs/topics/debugging.md', 'docs/kr.tree'])
    expect(await pagesOf(kotlin, kotlin.cloneDir)).toEqual(['home.md', 'lambdas.md'])

    const ktor = { ...repo('ktor', ktorStrategy, 'ktor'), sourceDocRoot: './topics' }
    upstream(ktor, ['topics/lib.topic', 'topics/server-cors.md', 'topics/welcome.topic'])
    expect(await pagesOf(ktor, ktor.cloneDir)).toEqual(['server-cors.md', 'welcome.md'])

    const coil = repo('coil', coilStrategy, 'coil')
    upstream(coil, ['README.md', 'docs/faq.md', '.github/ISSUE_TEMPLATE/CONTRIBUTING.md'])
    expect(await pagesOf(coil, coil.cloneDir)).toEqual(['contributing.md', 'faq.md', 'overview.md'])
  })
})

describe('removeStalePages', () => {
  it('only records the pages on the first sync', async () => {
    const demo = repo('demo')
    upstream(demo, ['docs/a.md', 'docs/b.md'])
    publish('old.md')

    const result = await sync(demo)

    expect(result.removed).toEqual([])
    expect(await readInventory(demo)).toEqual(['a.md', 'b.md'])
    expect(translations('old.md').every(existsSync)).toBe(true)
  })

  it('removes, in every language, a page upstream no longer has, and what was queued for it', async () => {
    const demo = repo('demo')
    upstream(demo, ['docs/a.md', 'docs/b.md', 'docs/guide/c.md'])
    await sync(demo)
    ;['a.md', 'b.md', 'guide/c.md'].forEach((page) => publish(page))
    publish('support/kept.md') // a page of the site itself, in no inventory
    write('.github/last_check_demo.pending.json', JSON.stringify({ 'docs/guide/c.md': { langs: ['ja'], reason: 'x' } }))

    upstream(demo, ['docs/a.md'])
    const result = await sync(demo)

    expect(result.removed).toEqual([{ page: 'b.md', movedTo: null }, { page: 'guide/c.md', movedTo: null }])
    expect([...translations('b.md'), ...translations('guide/c.md')].some(existsSync)).toBe(false)
    expect(translations('a.md').every(existsSync)).toBe(true)
    expect(translations('support/kept.md').every(existsSync)).toBe(true)
    expect(existsSync('.github/last_check_demo.pending.json')).toBe(false)
    expect(result.deleted).toContain('.github/last_check_demo.pending.json')
    expect(await readInventory(demo)).toEqual(['a.md'])
  })

  it('keeps a page another repository of the doc type still produces', async () => {
    const [first, second] = [repo('first'), repo('second')]
    upstream(first, ['docs/shared.md', 'docs/a.md'])
    upstream(second, ['docs/shared.md'])
    await sync(first)
    await sync(second)
    publish('shared.md')

    upstream(first, ['docs/a.md'])
    const result = await sync(first, [first, second])

    expect(result.removed).toEqual([])
    expect(translations('shared.md').every(existsSync)).toBe(true)
  })

  it('redirects a page moved upstream to its new page', async () => {
    const demo = repo('demo', { ...defaultStrategy, getMovedPages: async () => new Map([['old.md', 'new/index.md']]) })
    upstream(demo, ['docs/old.md', 'docs/a.md'])
    await sync(demo)
    publish('old.md')

    upstream(demo, ['docs/new/index.md', 'docs/a.md'])
    const result = await sync(demo)

    expect(result.removed).toEqual([{ page: 'old.md', movedTo: 'new/index.md' }])
    expect(JSON.parse(readFileSync('docs/.vitepress/redirects/demo.json', 'utf8')))
      .toEqual([{ from: 'demo/old.md', to: 'demo/new/index.md' }])
  })

  it('follows a redirect when its target moves, and drops it when the page comes back', async () => {
    let moves = new Map([['a.md', 'b.md']])
    const demo = repo('demo', { ...defaultStrategy, getMovedPages: async () => moves })
    const redirects = () => JSON.parse(readFileSync('docs/.vitepress/redirects/demo.json', 'utf8'))
    upstream(demo, ['docs/a.md', 'docs/x.md'])
    await sync(demo)
    upstream(demo, ['docs/b.md', 'docs/x.md'])
    await sync(demo)
    expect(redirects()).toEqual([{ from: 'demo/a.md', to: 'demo/b.md' }])

    moves = new Map([['a.md', 'b.md'], ['b.md', 'c.md']])
    upstream(demo, ['docs/c.md', 'docs/x.md'])
    await sync(demo)
    expect(redirects()).toEqual([{ from: 'demo/a.md', to: 'demo/c.md' }, { from: 'demo/b.md', to: 'demo/c.md' }])

    upstream(demo, ['docs/a.md', 'docs/c.md', 'docs/x.md'])
    await sync(demo)
    expect(redirects()).toEqual([{ from: 'demo/b.md', to: 'demo/c.md' }])
  })

  it('does not redirect to a page upstream does not produce', async () => {
    const demo = repo('demo', { ...defaultStrategy, getMovedPages: async () => new Map([['old.md', 'gone.md']]) })
    upstream(demo, ['docs/old.md', 'docs/a.md'])
    await sync(demo)
    upstream(demo, ['docs/a.md'])

    const result = await sync(demo)

    expect(result.removed).toEqual([{ page: 'old.md', movedTo: null }])
    expect(existsSync('docs/.vitepress/redirects/demo.json')).toBe(false)
  })

  it('removes nothing when most pages would go, or upstream has none', async () => {
    const demo = repo('demo')
    const many = Array.from({ length: 20 }, (_, i) => `docs/p${i}.md`)
    upstream(demo, many)
    await sync(demo)
    publish('p1.md')

    upstream(demo, many.slice(0, 5))
    const result = await sync(demo)
    expect(result.held).toBe('15 of 20 pages would be removed')
    expect(result.removed).toEqual([])
    expect(translations('p1.md').every(existsSync)).toBe(true)
    expect(await readInventory(demo)).toHaveLength(20)

    upstream(demo, [])
    expect((await sync(demo)).held).toBe('upstream produced no pages')
  })
})

describe('pages moved upstream', () => {
  it('reads accepts-web-file-names from a Writerside tree', async () => {
    write('kr.tree', [
      '<instance-profile id="kr">',
      '  <toc-element topic="ksp-overview.md" accepts-web-file-names="ksp-why-ksp.html, ksp-faq.html"/>',
      '  <toc-element topic="kotlin-toolchain.topic" accepts-web-file-names="amper.html"/>',
      '  <toc-element topic="lambdas.md"/>',
      '</instance-profile>',
    ].join('\n'))
    expect(Object.fromEntries(await movedPagesFromTree('kr.tree'))).toEqual({
      'ksp-why-ksp.md': 'ksp-overview.md', 'ksp-faq.md': 'ksp-overview.md', 'amper.md': 'kotlin-toolchain.md',
    })
  })

  it('reads redirect_maps from mkdocs.yml', async () => {
    write('mkdocs.yml', [
      'site_name: Koog',
      'markdown_extensions:',
      '  - pymdownx.emoji:',
      '      emoji_index: !!python/name:material.extensions.emoji.twemoji',
      'plugins:',
      '  - search',
      '  - redirects:',
      '      redirect_maps:',
      "        'basic-agents.md': 'agents/basic-agents.md'",
      "        'tools-overview.md': 'tools/index.md'",
      "        'external.md': 'https://example.com/'",
    ].join('\n'))
    expect(Object.fromEntries(await movedPagesFromMkDocs('mkdocs.yml'))).toEqual({
      'basic-agents.md': 'agents/basic-agents.md', 'tools-overview.md': 'tools/index.md',
    })
  })
})
