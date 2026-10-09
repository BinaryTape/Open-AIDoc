import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { deadLinks, loadPageCheck } from '../tools/pipeline/utils/page-check.mjs'

describe('deadLinks', () => {
  const pages = new Set(['kotlin/home', 'kotlin/lambdas', 'ja/kotlin/lambdas', 'koog/index'])

  it('resolves links like VitePress', () => {
    expect(deadLinks(['lambdas.md#x', './lambdas', '/kotlin/home', '../koog/', 'missing.md'], 'kotlin/strings.md', pages, false))
      .toEqual(['missing.md'])
  })

  it('skips assets and honours ignoreDeadLinks', () => {
    expect(deadLinks(['/kotlin/diagram.svg', 'http://localhost:8080/tasks'], 'kotlin/strings.md', pages, 'localhostLinks')).toEqual([])
    expect(deadLinks(['http://localhost:8080/tasks'], 'kotlin/strings.md', pages, false)).toEqual(['http://localhost:8080/tasks'])
    expect(deadLinks(['missing.md'], 'kotlin/strings.md', pages, true)).toEqual([])
    expect(deadLinks(['/old/page'], 'kotlin/strings.md', pages, [/^\/old\//])).toEqual([])
  })
})

// With the site's own configuration, as the pipeline runs it
describe('page check', () => {
  let check: NonNullable<Awaited<ReturnType<typeof loadPageCheck>>>

  beforeAll(async () => {
    check = (await loadPageCheck('docs'))!
  }, 120_000)

  it('passes the published pages', async () => {
    for (const page of ['kotlin/lambdas.md', 'ja/ktor/server-create-website.md', 'koog/index.md', 'kmp/kmp-learning-resources.md']) {
      expect(await check(page, readFileSync(`docs/${page}`, 'utf8')), page).toEqual([])
    }
  })

  it('rejects what Vue cannot compile', async () => {
    const problems = async (content: string) => (await check('kotlin/new-page.md', content)).join('\n')
    expect(await problems('Text.\n\n<div class="note">\n\nNever closed.\n')).toMatch(/^Vue: Element is missing end tag/)
    expect(await problems('Use {{ value.map( }} here.\n')).toMatch(/^Vue: Error parsing JavaScript expression/)
    expect(await problems('<span v-bind:"x">a</span>\n')).toMatch(/^Vue: /)
  })

  // (Doc-type link rewrites send a relative link to a page the site lacks to
  // the upstream site; a site path is left alone, so it can be dead.)
  it('rejects dead links, except to pages this run adds', async () => {
    const page = 'See [setup](/coil/new-setup) and [FAQ](/coil/faq).\n'
    expect(await check('coil/new-page.md', page)).toEqual(['dead link /coil/new-setup'])
    check.addPages(['coil/new-setup.md'])
    expect(await check('coil/new-page.md', page)).toEqual([])
  })

  it('accepts links to the reader\'s own server', async () => {
    expect(await check('ktor/new-page.md', 'Open [the app](http://localhost:8080/static/index.html).\n')).toEqual([])
  })
})

describe('loadPageCheck', () => {
  it('returns null where there is no VitePress site', async () => {
    expect(await loadPageCheck('tools')).toBeNull()
  })
})
