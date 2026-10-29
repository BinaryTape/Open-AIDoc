import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const script = resolve(__dirname, '../scripts/verify-anchors.mjs')

describe('verify-anchors', () => {
  let dist: string

  const page = (path: string, main: string) => {
    const file = join(dist, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `<html><body><nav><a href="/x#nav">Nav</a></nav><main>${main}</main></body></html>`)
  }
  const run = (baseline = 0) => {
    const env = { ...process.env, DIST_DIR: dist, ANCHOR_BASELINE: String(baseline) }
    try {
      return { code: 0, out: execFileSync('node', [script], { env, encoding: 'utf8', stdio: 'pipe' }) }
    } catch (error: any) {
      return { code: error.status as number, out: `${error.stdout}${error.stderr}` }
    }
  }

  beforeEach(() => {
    dist = mkdtempSync(join(tmpdir(), 'dist-'))
    page('ja/kotlin/typecasts.html', '<h2 id="smart-casts">スマートキャスト</h2>')
  })

  afterEach(() => {
    rmSync(dist, { recursive: true, force: true })
  })

  it('passes links to sections that exist', () => {
    page(
      'ja/kotlin/control-flow.html',
      '<a href="./typecasts#smart-casts">a</a> <a href="/ja/kotlin/typecasts.html#smart-casts">b</a> <a href="#top">c</a><span id="top"></span>'
    )
    const { code, out } = run()
    expect(code).toBe(0)
    expect(out).toContain('0 link(s) to 0 missing section(s), of 3 section link(s)')
  })

  it('fails on a link to a section the page lacks', () => {
    page('ja/kotlin/control-flow.html', '<a href="./typecasts#%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88">a</a>')
    const { code, out } = run()
    expect(code).toBe(1)
    expect(out).toContain('/ja/kotlin/typecasts#スマート (from 1 page(s), e.g. /ja/kotlin/control-flow)')
  })

  it('tolerates the known broken links up to the baseline', () => {
    page('ja/kotlin/control-flow.html', '<a href="./typecasts#missing">a</a>')
    expect(run(1).code).toBe(0)
    expect(run(2).out).toContain('lower BASELINE')
  })

  it('leaves links outside the content and to other sites or missing pages alone', () => {
    page(
      'ja/kotlin/control-flow.html',
      '<a href="https://kotlinlang.org/docs/typecasts.html#x">a</a> <a href="./no-such-page#x">b</a>'
    )
    expect(run().code).toBe(0)
  })
})
