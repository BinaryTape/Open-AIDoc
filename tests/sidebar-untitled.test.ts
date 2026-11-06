import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateSidebar } from '../tools/pipeline/processors/SidebarProcessor.mjs'
import { CONTENT_LOCALES } from '../shared/locales'

// The labels of a Writerside sidebar are kept in the locale files. An entry
// with a toc-title shows it; one without shows its page's title (P3-17).
let dir: string
const cwd = process.cwd()
const locale = (lang: string) => JSON.parse(readFileSync(join(dir, `docs/.vitepress/locales/${lang}.json`), 'utf8'))
const tree = (entries: string) => {
  writeFileSync(join(dir, 'mpd.tree'), `<instance-profile id="mpd"><toc-element topic="get-started.md">${entries}</toc-element></instance-profile>`)
  return generateSidebar(join(dir, 'mpd.tree'), 'kmp')
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'sidebar-'))
  mkdirSync(join(dir, 'docs/.vitepress/locales'), { recursive: true })
  mkdirSync(join(dir, 'docs/.vitepress/sidebar'), { recursive: true })
  for (const lang of ['en', ...CONTENT_LOCALES]) writeFileSync(join(dir, `docs/.vitepress/locales/${lang}.json`), JSON.stringify({ 'site.other': lang }))
  process.chdir(dir)
})

afterEach(() => {
  process.chdir(cwd)
  rmSync(dir, { recursive: true, force: true })
})

describe('the sidebar labels of a Writerside tree', () => {
  it('drop the label of an entry upstream no longer gives a toc-title', async () => {
    await tree('<toc-element topic="new-project.md" toc-title="4. Create your own application"/>')
    expect(locale('en')['kmp.new-project']).toBe('4. Create your own application')
    expect(locale('ja')['kmp.new-project']).toBe('4. Create your own application')

    await tree('<toc-element topic="new-project.md"/>')
    for (const lang of ['en', ...CONTENT_LOCALES]) {
      expect(locale(lang)).not.toHaveProperty('kmp.new-project')
      expect(locale(lang)['site.other']).toBe(lang)
    }
  })

  it('keep a label another entry of the tree still gives', async () => {
    await tree('<toc-element topic="setup.md" toc-title="Set up"/><toc-element topic="setup.md"/>')
    expect(locale('en')['kmp.setup']).toBe('Set up')
    expect(locale('zh-Hans')['kmp.setup']).toBe('Set up')
  })

  it('keep the translation of a label upstream still gives', async () => {
    await tree('<toc-element topic="setup.md" toc-title="Set up"/>')
    const zh = locale('zh-Hans'); zh['kmp.setup'] = '设置'
    writeFileSync(join(dir, 'docs/.vitepress/locales/zh-Hans.json'), JSON.stringify(zh))
    await tree('<toc-element topic="setup.md" toc-title="Set up"/><toc-element topic="other.md"/>')
    expect(locale('zh-Hans')['kmp.setup']).toBe('设置')
  })
})
