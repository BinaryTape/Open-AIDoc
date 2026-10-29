import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, relative } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { expandCodeSnippets } from '../tools/pipeline/processors/MarkdownProcessor.mjs'
import { snippetsDirOf } from '../tools/pipeline/sync-strategies/strategy-kotlin.mjs'
import { REPOS } from '../tools/pipeline/repos.config.mjs'

// Lines 1-6 of a pom.xml, indented as in kotlin-web-site's docs/snippets
const POM = [
  '<project>',
  '    <properties>',
  '        <kotlin.version>%kotlinVersion%</kotlin.version>',
  '    </properties>',
  '    <dependencies>',
  '    </dependencies>',
  '</project>',
].join('\n')

describe('expandCodeSnippets', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'snippets-'))
    mkdirSync(join(dir, 'jvm-test-tutorial'))
    writeFileSync(join(dir, 'jvm-test-tutorial/pom.xml'), POM)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
    vi.restoreAllMocks()
  })

  it('fills the block with the lines picked, dedented, at the block indent', async () => {
    // As in mixing-java-kotlin-intellij: a block in a list item
    const md = '1. Step:\n\n    ```xml\n    ```\n   {src="jvm-test-tutorial/pom.xml" ignore-vars="false" include-lines="2,3-4"}\n\nNext.\n'
    expect(await expandCodeSnippets(md, dir)).toBe(
      '1. Step:\n\n    ```xml\n    <properties>\n        <kotlin.version>%kotlinVersion%</kotlin.version>\n    </properties>\n    ```\n\nNext.\n'
    )
  })

  it('reads the whole file without include-lines', async () => {
    const out = await expandCodeSnippets('```xml\n```\n{src="jvm-test-tutorial/pom.xml"}\n', dir)
    expect(out).toBe('```xml\n' + POM + '\n```\n')
  })

  it('keeps the folding attributes on their own line', async () => {
    // As in jvm-test-using-junit: shown folded as "pom.xml file" on kotlinlang.org
    const md =
      '    ```xml\n    ```\n   {src="jvm-test-tutorial/pom.xml" initial-collapse-state="collapsed" collapsible="true" ignore-vars="false" collapsed-title="pom.xml file"}\n'
    const out = await expandCodeSnippets(md, dir)
    expect(out).toMatch(/^ {4}```xml\n {4}<project>\n/)
    expect(out.endsWith('    ```\n   {initial-collapse-state="collapsed" collapsible="true" collapsed-title="pom.xml file"}\n')).toBe(true)
  })

  it('drops attributes that only shaped the snippet upstream', async () => {
    const out = await expandCodeSnippets('```xml\n```\n{src="jvm-test-tutorial/pom.xml" include-lines="1" style="block" include-symbol="x"}\n', dir)
    expect(out).toBe('```xml\n<project>\n```\n')
  })

  it('leaves an attribute line without src as it was', async () => {
    // Was replaced by the word "undefined"
    const md = '```kotlin\n```\n{kotlin-runnable="true"}\n'
    expect(await expandCodeSnippets(md, dir)).toBe(md)
  })

  it('leaves the block as it was, and reports it, when the snippet is missing', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const md = '```xml\n```\n{src="jvm-test-tutorial/missing.xml"}\n'
    expect(await expandCodeSnippets(md, dir, 'page.md')).toBe(md)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('jvm-test-tutorial/missing.xml'))
    expect(error).toHaveBeenCalledWith(expect.stringContaining('page.md'))
  })
})

describe('snippetsDirOf', () => {
  let dir: string
  beforeEach(() => (dir = mkdtempSync(join(tmpdir(), 'writerside-'))))
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('reads <snippets src> of writerside.cfg, relative to the docs directory', () => {
    // kotlin-web-site's docs/writerside.cfg
    writeFileSync(join(dir, 'writerside.cfg'), '<ihp version="2.0">\n    <topics dir="topics"/>\n    <snippets src="snippets"/>\n</ihp>\n')
    expect(snippetsDirOf(dir)).toBe(join(dir, 'snippets'))
  })

  it('is null without a snippets directory or a writerside.cfg', () => {
    expect(snippetsDirOf(dir)).toBeNull()
    writeFileSync(join(dir, 'writerside.cfg'), '<ihp version="2.0">\n    <topics dir="topics"/>\n</ihp>\n')
    expect(snippetsDirOf(dir)).toBeNull()
  })
})

describe('published pages', () => {
  const docs = join(__dirname, '../docs')
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? (['.vitepress', 'public'].includes(e.name) ? [] : walk(join(d, e.name))) : e.name.endsWith('.md') ? [join(d, e.name)] : []
    )

  // Pages queued for retranslation are fixed by the next sync: <lang>/<docType>/<name>
  const queued = new Set(
    REPOS.flatMap((repo: any) => {
      const file = join(__dirname, '..', repo.lastCheckFile.replace(/\.txt$/, '.pending.json'))
      if (!existsSync(file)) return []
      return Object.entries(JSON.parse(readFileSync(file, 'utf8')) as Record<string, { langs: string[] }>).flatMap(([key, { langs }]) =>
        langs.map((lang) => `${lang}/${repo.docType}/${basename(key)}`)
      )
    })
  )
  const LANGS = ['ja', 'ko', 'zh-Hant']

  it('have no code block left empty for a {src} snippet', () => {
    const empty = walk(docs).flatMap((file) => {
      const parts = relative(docs, file).split(/[\\/]/)
      const lang = LANGS.includes(parts[0]) ? parts.shift()! : 'zh-Hans'
      if (queued.has(`${lang}/${parts[0]}/${parts[parts.length - 1]}`)) return []
      const text = readFileSync(file, 'utf8')
      return /```[^\n`]*\r?\n[ \t]*```[ \t]*\r?\n(?:[ \t]*\r?\n)?[ \t]*\{[^}\n]*\bsrc="/.test(text) ? [relative(docs, file)] : []
    })
    expect(empty).toEqual([])
  })
})
