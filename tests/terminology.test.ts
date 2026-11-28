import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Every zh-Hans and zh-Hant translation is given the whole glossary
// (translate.mjs, getTerminologyForLang).
const [zhHans, zhHant] = JSON.parse(readFileSync('tools/pipeline/terminology.json', 'utf8')) as Record<string, string>[]

describe('the glossary', () => {
  // A few translations had moved up one row: "dependency injection" was
  // "SQL 注入", and six zh-Hans pages said so; "injection" was "受限标识符"
  // (P3-31).
  it("gives a term its own translation, not the next term's (P3-31)", () => {
    expect(zhHans['dependency injection']).toBe('依赖注入')
    expect(zhHans['SQL injection']).toBe('SQL 注入')
    expect(zhHans['injection']).toBe('注入')
    expect(zhHant['performance']).toBe('效能')
    expect(zhHant['snapshot']).toBe('快照')
  })
})
