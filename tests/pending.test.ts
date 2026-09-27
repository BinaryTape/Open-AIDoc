import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mergeWork, pendingFileFor, readPending, writePending } from '../tools/pipeline/utils/pending.mjs'

const LANGS = ['zh-Hans', 'zh-Hant', 'ko', 'ja']

describe('mergeWork', () => {
  it('translates changed files into every language and pending ones into the missing ones', () => {
    const pending = {
      'docs/a.md': { langs: ['ja'], reason: '429' },
      'docs/b.md': { langs: ['ko', 'zh-Hans'], reason: 'incomplete' },
    }
    expect(mergeWork(['docs/b.md', 'docs/c.md'], pending, LANGS)).toEqual([
      { file: 'docs/a.md', langs: ['ja'] },
      { file: 'docs/b.md', langs: LANGS },
      { file: 'docs/c.md', langs: LANGS },
    ])
  })

  it('drops languages that are no longer configured', () => {
    expect(mergeWork([], { 'docs/a.md': { langs: ['fr'], reason: 'x' } }, LANGS)).toEqual([])
  })
})

describe('pending file', () => {
  const repoConfig = { lastCheckFile: join(mkdtempSync(join(tmpdir(), 'pending-')), 'last_check_koin.txt') }

  it('sits next to the checkpoint', () => {
    expect(pendingFileFor(repoConfig)).toBe(repoConfig.lastCheckFile.replace(/\.txt$/, '.pending.json'))
  })

  it('round-trips, sorted, and is removed once empty', async () => {
    const written = await writePending(repoConfig, {
      'docs/b.md': { langs: ['ko', 'ja'], reason: 'r' },
      'docs/a.md': { langs: ['ja'], reason: 'r' },
    })
    expect(written).toEqual({ path: pendingFileFor(repoConfig), removed: false })
    expect(Object.keys(JSON.parse(readFileSync(written!.path, 'utf8')))).toEqual(['docs/a.md', 'docs/b.md'])
    expect((await readPending(repoConfig))['docs/b.md'].langs).toEqual(['ja', 'ko'])

    expect(await writePending(repoConfig, {})).toEqual({ path: pendingFileFor(repoConfig), removed: true })
    expect(existsSync(pendingFileFor(repoConfig))).toBe(false)
    expect(await writePending(repoConfig, {})).toBeNull()
    expect(await readPending(repoConfig)).toEqual({})
  })
})
