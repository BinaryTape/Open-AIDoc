import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { coilStrategy } from '../tools/pipeline/sync-strategies/strategy-coil.mjs'
import { ktorStrategy } from '../tools/pipeline/sync-strategies/strategy-ktor.mjs'

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
