import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

const script = resolve(__dirname, '../scripts/verify-internal-links.mjs')

describe('verify-internal-links', () => {
  let dist: string

  // A built site: zh-Hans at the root, ja under /ja/.
  const page = (path: string, main: string) => {
    const file = join(dist, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, `<html><body><nav><a href="/">Home</a> <a href="/ja/">日本語</a></nav><main>${main}</main></body></html>`)
  }
  const run = () => {
    try {
      return { code: 0, out: execFileSync('node', [script], { env: { ...process.env, DIST_DIR: dist }, encoding: 'utf8', stdio: 'pipe' }) }
    } catch (error: any) {
      return { code: error.status as number, out: `${error.stdout}${error.stderr}` }
    }
  }

  beforeEach(() => {
    dist = mkdtempSync(join(tmpdir(), 'dist-'))
    page('index.html', '')
    page('ja/index.html', '')
    page('ktor/server-native.html', '')
    page('ja/ktor/server-native.html', '')
  })

  afterEach(() => {
    rmSync(dist, { recursive: true, force: true })
  })

  it('passes links that stay in the page language', () => {
    page('ktor/server-plugins.html', '<a href="/ktor/server-native">Native</a>')
    page('ja/ktor/server-plugins.html', '<a href="/ja/ktor/server-native">Native</a>')
    expect(run()).toMatchObject({ code: 0 })
  })

  it('reports content linking to another language', () => {
    // The language switcher in the nav links across languages on purpose.
    page('ja/ktor/server-plugins.html', '<a href="/ktor/server-native">Native</a>')
    const { code, out } = run()
    expect(code).toBe(1)
    expect(out).toContain('1 page(s) link to 1 page(s) in another language')
    expect(out).toContain('- /ktor/server-native (from 1 page(s), e.g. /ja/ktor/server-plugins)')
  })

  it('reports //slug as dead, not as another site', () => {
    page('ktor/server-plugins.html', '<a href="//server-native">Native</a> <a href="//cdn.example.com/x.js">CDN</a>')
    const { code, out } = run()
    expect(code).toBe(1)
    expect(out).toContain('- //server-native (1 source page(s)')
    expect(out).not.toContain('cdn.example.com')
  })
})
