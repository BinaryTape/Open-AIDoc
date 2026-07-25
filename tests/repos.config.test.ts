import { describe, expect, it } from 'vitest'
import { REPOS, validateRepos } from '../tools/pipeline/repos.config.mjs'

const SYNC_STRATEGY_HOOKS = [
  'getDocPatterns',
  'postSync',
  'postDetect',
  'postTranslate',
] as const

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

  it('rejects missing required fields', () => {
    const { id: _id, ...withoutId } = REPOS[0]
    expect(() => validateRepos([withoutId as (typeof REPOS)[number]])).toThrow(
      /missing required field "id"/
    )
  })
})

describe('SyncStrategy contract', () => {
  // Multiple REPOS may share one strategy instance (e.g. kotlin family).
  const uniqueStrategyEntries = [
    ...new Map(REPOS.map((r) => [r.syncStrategy, r])).values(),
  ]

  it('exposes the standard hooks on every strategy instance', () => {
    for (const entry of uniqueStrategyEntries) {
      for (const hook of SYNC_STRATEGY_HOOKS) {
        expect(
          typeof entry.syncStrategy[hook],
          `${entry.id}.${hook}`
        ).toBe('function')
      }
    }
  })

  it('returns a non-empty list of glob patterns from getDocPatterns()', () => {
    for (const entry of uniqueStrategyEntries) {
      const patterns = entry.syncStrategy.getDocPatterns()
      expect(Array.isArray(patterns), entry.id).toBe(true)
      expect(patterns.length, entry.id).toBeGreaterThan(0)
      for (const pattern of patterns) {
        expect(typeof pattern, `${entry.id}: ${pattern}`).toBe('string')
        expect(pattern.length, `${entry.id}: ${pattern}`).toBeGreaterThan(0)
      }
    }
  })

  it('shares strategy instances across related REPOS where expected', () => {
    expect(uniqueStrategyEntries.length).toBeGreaterThanOrEqual(7)
    expect(uniqueStrategyEntries.length).toBeLessThan(REPOS.length)
  })
})
