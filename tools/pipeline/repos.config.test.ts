import { describe, expect, it } from 'vitest'
import { REPOS, validateRepos } from './repos.config.mjs'

describe('REPOS config', () => {
  it('passes structural validation', () => {
    expect(() => validateRepos(REPOS)).not.toThrow()
  })

  it('has unique ids and lastCheckFiles', () => {
    const ids = REPOS.map((r) => r.id)
    const checks = REPOS.map((r) => r.lastCheckFile)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(checks).size).toBe(checks.length)
  })

  it('maps sidebarId to known content families without path munging', () => {
    const kotlinFamily = REPOS.filter((r) => r.docType === 'kotlin')
    expect(kotlinFamily.map((r) => r.sidebarId).sort()).toEqual([
      'api-guidelines',
      'coroutines',
      'dokka',
      'kotlin',
      'lincheck',
    ])

    for (const entry of REPOS) {
      expect(entry).not.toHaveProperty('name')
      expect(entry).not.toHaveProperty('path')
      expect(entry).not.toHaveProperty('docPath')
      expect(entry).not.toHaveProperty('strategy')
      expect(entry.syncStrategy).toBeDefined()
      expect(typeof entry.syncStrategy.getDocPatterns).toBe('function')
    }
  })

  it('rejects duplicate ids', () => {
    const broken = [
      { ...REPOS[0] },
      { ...REPOS[0], lastCheckFile: '.github/last_check_dup.txt' },
    ]
    expect(() => validateRepos(broken)).toThrow(/Duplicate REPOS id/)
  })
})
