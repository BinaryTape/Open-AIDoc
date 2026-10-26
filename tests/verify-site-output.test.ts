import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = resolve('scripts/verify-site-output.mjs')
let dir: string

afterEach(() => rmSync(dir, { recursive: true, force: true }))

/** Run the check on a site of these pages; the other checks fail too, only its report matters. */
function verify(pages: Record<string, string>, files: Record<string, string> = {}) {
  dir = mkdtempSync(join(tmpdir(), 'verify-site-'))
  const dist = join(dir, 'docs/.vitepress/dist')
  const write = (file: string, content: string) => {
    mkdirSync(join(dist, file, '..'), { recursive: true })
    writeFileSync(join(dist, file), content)
  }
  for (const [file, main] of Object.entries(pages)) {
    write(file, `<html><head></head><body><main class="main">${main}</main></body></html>`)
  }
  for (const [file, content] of Object.entries(files)) write(file, content)
  writeFileSync(join(dist, 'sitemap.xml'), '<urlset></urlset>')
  writeFileSync(join(dist, 'robots.txt'), '')
  return spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' })
}

describe('verify-site-output', () => {
  it('fails on a page that shows "undefined"', () => {
    // Was a warning while the pages from before #70 waited for retranslation (P0-13).
    const result = verify({ 'ktor/server-native.html': '<ul><li>CIO only</li></ul><p>undefined</p>' })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('- ktor/server-native.html: shows "undefined" where content is missing (1)')
    expect(result.stdout + result.stderr).not.toContain('Warning:')
  })

  it('does not report a page without one', () => {
    const result = verify({ 'ktor/server-native.html': '<p>Returns <code>undefined</code>.</p>' })
    expect(result.stderr).not.toContain('undefined')
  })

  it('fails on a lean page module that lost code with the static HTML', () => {
    // P0-10: the code between two static strings went with them.
    const full = 'o[0]||=[a(`<p>One</p>`,2),i(`li`,null,[o[1]||=a(`<p>Two</p>`,2)])]'
    const result = verify({}, {
      'assets/kotlin_lincheck.md.X1.js': full,
      'assets/kotlin_lincheck.md.X1.lean.js': 'o[0]||=[a("",2)])]',
      'assets/kotlin_ok.md.X2.js': full,
      'assets/kotlin_ok.md.X2.lean.js': 'o[0]||=[a("",2),i(`li`,null,[o[1]||=a("",2)])]',
    })
    expect(result.status).toBe(1)
    expect(result.stderr).toContain('- assets/kotlin_lincheck.md.X1.lean.js: code stripped with the static HTML (a(…) called 2 times in the full module, 1 in the lean one)')
    expect(result.stderr).not.toContain('kotlin_ok')
  })
})
