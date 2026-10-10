import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pageUrl, redirectRules, writeRedirectsFile } from '../docs/.vitepress/config/redirects.config'

describe('pageUrl', () => {
  it('gives the URL of a page in a locale', () => {
    expect(pageUrl('zh-Hans', 'kmp/amper.md')).toBe('/kmp/amper')
    expect(pageUrl('ja', 'kmp/amper.md')).toBe('/ja/kmp/amper')
    expect(pageUrl('ko', 'koog/a2a/index.md')).toBe('/ko/koog/a2a/')
    expect(pageUrl('zh-Hant', 'koog/agents/basic-agents.md')).toBe('/zh-Hant/koog/agents/basic-agents')
  })
})

describe('redirectRules', () => {
  const built = new Set(['/kmp/kotlin-toolchain', '/ja/kmp/kotlin-toolchain', '/kotlin/lambdas', '/kmp/amper-live', '/ja/kmp/amper-live'])

  it('writes one rule per locale, to built pages only, never from one', () => {
    const rules = redirectRules(
      [
        { from: 'kmp/amper.md', to: 'kmp/kotlin-toolchain.md' },
        { from: 'kmp/amper-live.md', to: 'kmp/kotlin-toolchain.md' }, // its page is built: a live page stays
        { from: 'kotlin/old.md', to: 'kotlin/missing.md' }, // nowhere to go
      ],
      ['zh-Hans', 'ja', 'ko'],
      (url) => built.has(url)
    )
    expect(rules).toEqual([
      '/ja/kmp/amper /ja/kmp/kotlin-toolchain 301',
      '/kmp/amper /kmp/kotlin-toolchain 301',
    ])
  })
})

describe('writeRedirectsFile', () => {
  let dir: string
  const write = (file: string, content: string) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true })
    writeFileSync(join(dir, file), content)
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'redirects-'))
    write('dist/kmp/kotlin-toolchain.html', '')
    write('dist/koog/a2a/index.html', '')
    write('redirects/kmp.json', JSON.stringify([{ from: 'kmp/amper.md', to: 'kmp/kotlin-toolchain.md' }]))
    write('redirects/koog.json', JSON.stringify([{ from: 'koog/a2a-protocol-overview.md', to: 'koog/a2a/index.md' }]))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('writes _redirects after the rules already in the output', () => {
    write('dist/_redirects', '/old-home / 301\n')

    writeRedirectsFile(join(dir, 'dist'), join(dir, 'redirects'))

    expect(readFileSync(join(dir, 'dist/_redirects'), 'utf8')).toBe([
      '/old-home / 301',
      '',
      '# Pages moved upstream (docs/.vitepress/redirects)',
      '/kmp/amper /kmp/kotlin-toolchain 301',
      '/koog/a2a-protocol-overview /koog/a2a/ 301',
      '',
    ].join('\n'))
  })
})
