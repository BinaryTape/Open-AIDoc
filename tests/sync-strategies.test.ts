import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { coilStrategy } from '../tools/pipeline/sync-strategies/strategy-coil.mjs'
import { ktorStrategy } from '../tools/pipeline/sync-strategies/strategy-ktor.mjs'
import { kmpStrategy } from '../tools/pipeline/sync-strategies/strategy-kmp.mjs'
import { koogStrategy } from '../tools/pipeline/sync-strategies/strategy-koog.mjs'
import { kotlinStrategy } from '../tools/pipeline/sync-strategies/strategy-kotlin.mjs'
import { sqlDelightStrategy } from '../tools/pipeline/sync-strategies/strategy-sqldelight.mjs'

let clone: string

beforeEach(() => {
  clone = mkdtempSync(join(tmpdir(), 'strategy-'))
})

afterEach(() => {
  rmSync(clone, { recursive: true, force: true })
})

function write(file: string, content: string) {
  mkdirSync(dirname(join(clone, file)), { recursive: true })
  writeFileSync(join(clone, file), content)
}

const read = (file: string) => readFileSync(join(clone, file), 'utf8')

describe('coil strategy', () => {
  beforeEach(() => {
    write('README.md', '# Coil\n\n![Coil](logo.svg)\n')
    write('.github/ISSUE_TEMPLATE/CONTRIBUTING.md', '# Contributing\n\nSee [recipes](/coil/recipes/#tips).\n')
    write('docs/faq.md', '# FAQ\n')
  })

  it('maps the contributing guide to docs/contributing.md', async () => {
    expect(coilStrategy.getDocPatterns()).toContain('.github/ISSUE_TEMPLATE/CONTRIBUTING.md')

    const task = { files: ['.github/ISSUE_TEMPLATE/CONTRIBUTING.md', 'docs/faq.md'] }
    await coilStrategy.postDetect({ cloneDir: clone }, task)

    expect(task.files).toEqual(['docs/contributing.md', 'docs/faq.md'])
    expect(read('docs/contributing.md')).toBe('# Contributing\n\nSee [recipes](/coil/recipes#tips).\n')
  })

  it('copies every mapped page, so pending ones can be translated', async () => {
    const task = { files: [] as string[] } // only pending work this run
    await coilStrategy.postDetect({ cloneDir: clone }, task)

    expect(existsSync(join(clone, 'docs/contributing.md'))).toBe(true)
    expect(read('docs/overview.md')).toBe('# Coil\n\n![Coil](/coil/coil_full_colored.svg)\n')
  })
})

describe('ktor strategy', () => {
  it('keeps the snippet library out of the pages to translate', async () => {
    write('topics/lib.topic', '<topic id="lib" title="Library of Includes"><snippet id="a"><p>A</p></snippet></topic>\n')
    write('topics/server-cors.md', '[//]: # (title: CORS)\n\nText.\n')

    const task = { files: ['topics/lib.topic', 'topics/server-cors.md'] }
    await ktorStrategy.postDetect({ cloneDir: clone, sidebarId: 'ktor' }, task)

    expect(task.files).toEqual(['topics/server-cors.md'])
    expect(existsSync(join(clone, 'topics/lib.md'))).toBe(false)
  })
})

describe('generated sidebars', () => {
  const tree = '<instance-profile id="x"><toc-element topic="start.md"/>' +
    '<toc-element toc-title="Guides"><toc-element topic="first.topic"/></toc-element></instance-profile>\n'
  const mkdocs = 'site_name: X\nnav:\n  - Start: start.md\n  - Guides:\n    - First: first.md\n'

  const cases = [
    { strategy: ktorStrategy, id: 'ktor', file: 'ktor.tree', content: tree },
    { strategy: kmpStrategy, id: 'kmp', file: 'mpd.tree', content: tree },
    { strategy: kotlinStrategy, id: 'dokka', file: 'docs/dokka.tree', content: tree },
    { strategy: koogStrategy, id: 'koog', file: 'docs/mkdocs.yml', content: mkdocs },
    { strategy: sqlDelightStrategy, id: 'sqldelight', file: 'mkdocs.yml', content: mkdocs },
  ]

  const originalCwd = process.cwd()
  let site: string

  beforeEach(() => {
    site = mkdtempSync(join(tmpdir(), 'site-'))
    mkdirSync(join(site, 'docs/.vitepress/sidebar'), { recursive: true })
    mkdirSync(join(site, 'docs/.vitepress/locales'), { recursive: true })
    process.chdir(site)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(site, { recursive: true, force: true })
  })

  // postSync runs on every sync; postDetect only when documents changed
  it.each(cases)('$id: regenerated from $file on every sync', async ({ strategy, id, file, content }) => {
    write(file, content)

    await strategy.postSync(clone, { gitAddPaths: new Set() }, { id, sidebarId: id, cloneDir: clone })

    const sidebar = JSON.parse(readFileSync(join(site, `docs/.vitepress/sidebar/${id}.sidebar.json`), 'utf8'))
    expect(sidebar[0]).toMatchObject({ text: `${id}.start`, link: 'start' })
    expect(sidebar[1].items[0]).toMatchObject({ link: 'first' })
  })
})
