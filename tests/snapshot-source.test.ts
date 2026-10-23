import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { changedBetween, manifestOf, snapshotSource, sourcesFileFor } from '../tools/pipeline/utils/snapshot-source.mjs'

let root: string
let upstream: Record<string, string>
const source = snapshotSource(async () => ({ ...upstream }))
const repoConfig = () => ({ cloneDir: join(root, 'koin-repo'), lastCheckFile: join(root, '.github/last_check_koin.txt') })

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'snapshot-'))
  upstream = { 'docs/a.md': '# A\n', 'docs/b/c.md': '# C\n', 'llms.txt': '# Index\n' }
})

afterEach(() => rmSync(root, { recursive: true, force: true }))

describe('manifestOf', () => {
  it('gives the same version to the same files, in any order', () => {
    const a = manifestOf({ 'x.md': '1', 'y.md': '2' })
    expect(manifestOf({ 'y.md': '2', 'x.md': '1' })).toEqual(a)
    expect(a.version).toMatch(/^[0-9a-f]{40}$/)
    expect(manifestOf({ 'x.md': '1', 'y.md': '3' }).version).not.toBe(a.version)
  })

  it('lists the files that changed or are new', () => {
    const before = manifestOf({ 'x.md': '1', 'y.md': '2', 'gone.md': '3' })
    expect(changedBetween(before, manifestOf({ 'x.md': '1', 'y.md': '2!', 'new.md': '4' }))).toEqual(['new.md', 'y.md'])
  })
})

describe('snapshotSource', () => {
  it('replaces the clone directory with the snapshot', async () => {
    mkdirSync(join(root, 'koin-repo/docs'), { recursive: true })
    writeFileSync(join(root, 'koin-repo/docs/old.md'), 'left over')

    await source.update(repoConfig())

    expect(readFileSync(join(root, 'koin-repo/docs/b/c.md'), 'utf8')).toBe('# C\n')
    expect(existsSync(join(root, 'koin-repo/docs/old.md'))).toBe(false)
    expect(await source.version(repoConfig())).toBe(manifestOf(upstream).version)
  })

  it('has nothing to compare with before the first checkpoint', async () => {
    await source.update(repoConfig())
    expect(await source.changedFiles(repoConfig())).toBeNull()
  })

  it('finds the pages changed since the checkpoint', async () => {
    await source.update(repoConfig())
    expect(await source.checkpoint(repoConfig())).toEqual([sourcesFileFor(repoConfig())])
    expect(sourcesFileFor(repoConfig())).toBe(join(root, '.github/last_check_koin.sources.json'))

    upstream['docs/a.md'] = '# A, revised\n'
    upstream['docs/d.md'] = '# D\n'
    delete upstream['docs/b/c.md']
    await source.update(repoConfig())

    expect(await source.changedFiles(repoConfig())).toEqual(['docs/a.md', 'docs/d.md'])
  })

  it('changes nothing when the upstream cannot be read', async () => {
    await source.update(repoConfig())
    const failing = snapshotSource(async () => { throw new Error('offline') })

    await expect(failing.update(repoConfig())).rejects.toThrow('offline')
    expect(readFileSync(join(root, 'koin-repo/docs/a.md'), 'utf8')).toBe('# A\n')
  })
})
