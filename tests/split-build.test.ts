import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const vitepress = resolve('node_modules/vitepress/bin/vitepress.js')
const script = resolve('scripts/build-docs.mjs')
let dir: string

afterEach(() => rmSync(dir, { recursive: true, force: true }))

/** A small default-theme site; inside the repo (gitignored) so pages resolve vue. */
function site() {
  mkdirSync(resolve('.cache'), { recursive: true })
  dir = mkdtempSync(resolve('.cache/split-build-'))
  const write = (file: string, content: string) => {
    mkdirSync(join(dir, file, '..'), { recursive: true })
    writeFileSync(join(dir, file), content)
  }
  write('.vitepress/config.mjs', `import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
export default {
  title: 'Split',
  cleanUrls: true,
  metaChunk: true,
  sitemap: { hostname: 'https://example.org' },
  buildEnd(config) { writeFileSync(join(config.outDir, 'build-end.txt'), 'done') },
}
`)
  write('index.md', '# Home\n\n<Counter />\n\n<script setup>\nimport Counter from \'./Counter.vue\'\n</script>\n')
  write('Counter.vue', '<script setup>\nimport { ref } from \'vue\'\nconst n = ref(0)\n</script>\n<template><button @click="n++">{{ n }}</button></template>\n')
  write('guide/intro.md', '# Intro\n\n```kotlin\nfun main() = println("hi")\n```\n')
  write('public/robots.txt', 'User-agent: *\n')
  return dir
}

function files(root: string): Map<string, string> {
  const result = new Map<string, string>()
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const path = join(d, entry.name)
      if (entry.isDirectory()) walk(path)
      else result.set(relative(root, path).replaceAll('\\', '/'), readFileSync(path, 'utf8'))
    }
  }
  walk(root)
  return result
}

function run(args: string[], env: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8', env: { ...process.env, ...env } })
  expect(result.status, result.stdout + result.stderr).toBe(0)
  return result
}

describe('build-docs (VITEPRESS_BUILD_STEP)', () => {
  it('builds the same site in three processes as in one', () => {
    const root = site()
    const dist = join(root, '.vitepress/dist')
    run([vitepress, 'build', root])
    renameSync(dist, join(root, 'dist-one-process'))

    const result = run([script, root])
    expect(result.stdout).toContain('client bundle built')
    expect(result.stdout).toContain('server bundle built')
    expect(result.stdout).toContain('build complete')

    const expected = files(join(root, 'dist-one-process'))
    const actual = files(dist)
    expect([...actual.keys()].sort()).toEqual([...expected.keys()].sort())
    for (const [file, content] of expected) expect(actual.get(file), file).toBe(content)
    expect(actual.get('build-end.txt')).toBe('done')
    expect(actual.has('sitemap.xml')).toBe(true)

    // Nothing left behind for the next build.
    expect(existsSync(join(root, '.vitepress/.temp'))).toBe(false)
    expect(existsSync(join(root, '.vitepress/cache/split-build-client.json'))).toBe(false)
  }, 180_000)

  it('stops at the failed step', () => {
    const root = site()
    writeFileSync(join(root, 'guide/intro.md'), '# Intro\n\n<Missing />\n\n<script setup>\nimport Missing from \'./missing.vue\'\n</script>\n')
    const result = spawnSync(process.execPath, [script, root], { encoding: 'utf8' })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('build-docs: client step failed')
    expect(result.stdout).not.toContain('server bundle built')
  }, 180_000)

  it('rejects an unknown step', () => {
    const root = site()
    const result = spawnSync(process.execPath, [vitepress, 'build', root], {
      encoding: 'utf8',
      env: { ...process.env, VITEPRESS_BUILD_STEP: 'all' },
    })
    expect(result.status).not.toBe(0)
    expect(result.stdout + result.stderr).toContain('Unknown VITEPRESS_BUILD_STEP: all')
  }, 60_000)
})
