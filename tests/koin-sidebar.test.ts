import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The sidebar is written from llms.txt on every sync (tests/koin-llms.test.ts)
describe('committed Koin sidebar', () => {
  const sidebar = JSON.parse(readFileSync(resolve(import.meta.dirname, '../docs/.vitepress/sidebar/koin.sidebar.json'), 'utf8'))
  const nodes: any[] = []
  const walk = (list: any[]) => list.forEach((n) => { nodes.push(n); if (n.items) walk(n.items) })
  walk(sidebar)

  it('only links pages that exist', () => {
    const missing = nodes.filter((n) => n.link && !existsSync(resolve(import.meta.dirname, `../docs/koin/${n.link}.md`)))
    expect(missing.map((n) => n.link)).toEqual([])
  })
})
