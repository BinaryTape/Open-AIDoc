import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  fetchKoinSnapshot,
  koinSidebar,
  MIN_PAGES,
  pageFiles,
  parseLlmsIndex,
  redirectTarget,
  siteRedirects,
  splitLlmsFull,
  toMarkdown,
} from '../tools/pipeline/utils/koin-llms.mjs'
import { koinStrategy } from '../tools/pipeline/sync-strategies/strategy-koin.mjs'

const page = (title: string, url: string, body: string) =>
  `# ${title}\n\nSource: https://insert-koin.io/docs/${url}\n\n${body}\n`

/** llms-full.txt as insert-koin.io writes it: a preamble, then pages separated by `---`. */
const full = (...pages: string[]) =>
  ['# Koin Documentation (full text)', '', '> Every page of the Koin documentation, in sidebar order.', '', pages.join('\n---\n\n')].join('\n')

const INDEX = [
  '# Koin',
  '',
  '## Key facts',
  '',
  '- [Not a page](https://example.com)',
  '',
  '## Documentation',
  '',
  '### Get Started',
  '- [Welcome](https://insert-koin.io/docs/intro): Map of the documentation.',
  '- [Core Concepts](https://insert-koin.io/docs/intro/core-concepts): Modules, definitions.',
  '',
  '### Platforms > Android',
  '- [Starting Koin on Android](https://insert-koin.io/docs/reference/koin-android/start): `startKoin`.',
  '- [Gone](https://insert-koin.io/docs/reference/koin-android/gone): no page.',
  '',
  '### Support',
  '- [Versions](https://insert-koin.io/docs/support/): LTS lines.',
  '<!-- generated:docs-end -->',
  '',
  '## After',
  '- [Ignored](https://insert-koin.io/docs/ignored)',
].join('\n')

describe('splitLlmsFull', () => {
  it('splits the export into pages, without their source line and separator', () => {
    const pages = splitLlmsFull(full(
      page('Welcome', 'intro', 'Map of the docs.\n\n## Where to start\n\nRead on.'),
      page('Definitions', 'reference/koin-core/definitions', '```kotlin\n# not a page\n---\n```\n\nA definition.'),
    ))

    expect(pages).toEqual([
      { url: 'intro', title: 'Welcome', body: 'Map of the docs.\n\n## Where to start\n\nRead on.' },
      { url: 'reference/koin-core/definitions', title: 'Definitions', body: '```kotlin\n# not a page\n---\n```\n\nA definition.' },
    ])
  })

  it('reads CRLF exports and source URLs with a trailing slash', () => {
    const pages = splitLlmsFull(full(page('Support', 'support/', 'LTS.')).replace(/\n/g, '\r\n'))
    expect(pages).toEqual([{ url: 'support', title: 'Support', body: 'LTS.' }])
  })
})

describe('pageFiles', () => {
  it('makes a page with pages under it the index of its directory', () => {
    expect(pageFiles(['intro', 'intro/what-is-koin', 'setup/gradle', 'tooling'])).toEqual(new Map([
      ['intro', 'docs/intro/index.md'],
      ['intro/what-is-koin', 'docs/intro/what-is-koin.md'],
      ['setup/gradle', 'docs/setup/gradle.md'],
      ['tooling', 'docs/tooling.md'],
    ]))
  })
})

describe('toMarkdown', () => {
  it('writes the title front matter and the H1, as the site pages are', () => {
    expect(toMarkdown('Definitions', 'Body.')).toBe('---\ntitle: Definitions\n---\n\n# Definitions\n\nBody.\n')
  })

  it('quotes titles YAML would misread', () => {
    expect(toMarkdown('@Monitor', 'x')).toContain('title: "@Monitor"\n')
    expect(toMarkdown('Koin: the basics', 'x')).toContain('title: "Koin: the basics"\n')
    expect(toMarkdown('Releases & Upgrade Guides', 'x')).toContain('title: Releases & Upgrade Guides\n')
  })
})

describe('parseLlmsIndex', () => {
  it('reads the documentation section only, group by group', () => {
    expect(parseLlmsIndex(INDEX)).toEqual([
      [
        { groups: ['Get Started'], title: 'Welcome', url: 'intro' },
        { groups: ['Get Started'], title: 'Core Concepts', url: 'intro/core-concepts' },
      ],
      [
        { groups: ['Platforms', 'Android'], title: 'Starting Koin on Android', url: 'reference/koin-android/start' },
        { groups: ['Platforms', 'Android'], title: 'Gone', url: 'reference/koin-android/gone' },
      ],
      [{ groups: ['Support'], title: 'Versions', url: 'support' }],
    ])
  })
})

describe('koinSidebar', () => {
  const files = pageFiles(['intro', 'intro/core-concepts', 'reference/koin-android/start', 'support', 'support/releases', 'tooling'])

  it('follows the groups and order of the index, nesting "A > B" groups', () => {
    const { sidebarNodes, translateKeys, missing, unlisted } = koinSidebar(INDEX, files)

    expect(sidebarNodes).toEqual([
      {
        text: 'koin.get-started',
        collapsed: true,
        items: [
          { text: 'koin.intro.index', link: 'intro/index' },
          { text: 'koin.intro.core-concepts', link: 'intro/core-concepts' },
        ],
      },
      {
        text: 'koin.platforms',
        collapsed: true,
        items: [{
          text: 'koin.platforms-android',
          collapsed: true,
          items: [{ text: 'koin.reference.koin-android.start', link: 'reference/koin-android/start' }],
        }],
      },
      { text: 'koin.support', collapsed: true, items: [{ text: 'koin.support.index', link: 'support/index' }] },
    ])
    // Group labels are translated; pages keep the title of their translation
    expect([...translateKeys]).toEqual([
      ['koin.get-started', 'Get Started'],
      ['koin.platforms', 'Platforms'],
      ['koin.platforms-android', 'Android'],
      ['koin.support', 'Support'],
    ])
    expect(missing).toEqual(['reference/koin-android/gone'])
    expect(unlisted).toEqual(['support/releases', 'tooling'])
  })
})

describe('redirectTarget', () => {
  it('reads where a Docusaurus redirect page sends to', () => {
    expect(redirectTarget('<meta http-equiv="refresh" content="0; url=/docs/intro/choosing-your-style">')).toBe('intro/choosing-your-style')
    expect(redirectTarget('<meta content="0; url=https://insert-koin.io/docs/setup/gradle/#bom" http-equiv="refresh"/>')).toBe('setup/gradle')
  })

  it('finds nothing on a normal page or a redirect off the docs', () => {
    expect(redirectTarget('<html><h1>Definitions</h1></html>')).toBeNull()
    expect(redirectTarget('<meta http-equiv="refresh" content="0; url=https://kotzilla.io/">')).toBeNull()
  })
})

/** A fetch answering from these pages, 404 for anything else. */
const site = (pages: Record<string, string>) => async (url: string | URL) => {
  const body = pages[String(url)]
  return { ok: body !== undefined, status: body === undefined ? 404 : 200, text: async () => body ?? '' } as Response
}

const exportOf = (count: number) => full(...Array.from({ length: count }, (_, i) => page(`Page ${i}`, `section/page-${i}`, `Text ${i}.`)))

describe('fetchKoinSnapshot', () => {
  it('writes every page and the index as files of the clone', async () => {
    const snapshot = await fetchKoinSnapshot({
      fetchImpl: site({ 'https://insert-koin.io/llms-full.txt': exportOf(MIN_PAGES), 'https://insert-koin.io/llms.txt': INDEX }),
    })

    expect(Object.keys(snapshot)).toHaveLength(MIN_PAGES + 1)
    expect(snapshot['llms.txt']).toBe(INDEX)
    expect(snapshot['docs/section/page-3.md']).toBe('---\ntitle: Page 3\n---\n\n# Page 3\n\nText 3.\n')
  })

  it('stops when the export has too few pages, as when its format changed', async () => {
    const fetchImpl = site({ 'https://insert-koin.io/llms-full.txt': exportOf(MIN_PAGES - 1), 'https://insert-koin.io/llms.txt': INDEX })
    await expect(fetchKoinSnapshot({ fetchImpl })).rejects.toThrow(/has 39 pages/)
  })

  it('stops when the site cannot be read', async () => {
    await expect(fetchKoinSnapshot({ fetchImpl: site({}) })).rejects.toThrow(/HTTP 404/)
  })
})

describe('Koin moved pages', () => {
  let root: string
  const write = (file: string, content = '') => {
    mkdirSync(dirname(join(root, file)), { recursive: true })
    writeFileSync(join(root, file), content)
  }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'koin-moved-'))
    write('clone/docs/intro/index.md')
    write('clone/docs/intro/choosing-your-style.md')
    write('clone/docs/setup/gradle.md')
    // The site's translations: two pages the snapshot no longer has
    write('site/intro/index.md')
    write('site/intro/what-is-koin-annotations.md')
    write('site/reference/koin-android/r8-proguard.md')
    write('site/setup/koin.md')
  })

  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('redirects a dropped page where the site sends it, when that page exists', async () => {
    const redirect = (to: string) => `<meta http-equiv="refresh" content="0; url=/docs/${to}">`
    const fetchImpl = site({
      'https://insert-koin.io/docs/intro/what-is-koin-annotations': redirect('intro/choosing-your-style'),
      'https://insert-koin.io/docs/setup/koin': redirect('setup/somewhere-else'),
      // r8-proguard: 404 on the site
    })

    const moved = await koinStrategy.getMovedPages(join(root, 'clone'), { fetchImpl, translated: join(root, 'site') })

    expect(moved).toEqual(new Map([['intro/what-is-koin-annotations.md', 'intro/choosing-your-style.md']]))
  })

  it('reaches the site only for pages the snapshot dropped', async () => {
    const asked: string[] = []
    const fetchImpl = async (url: string | URL) => {
      asked.push(String(url))
      return { ok: false, status: 404, text: async () => '' } as Response
    }

    expect(await siteRedirects([], { fetchImpl })).toEqual(new Map())
    await koinStrategy.getMovedPages(join(root, 'clone'), { fetchImpl, translated: join(root, 'site') })
    expect(asked.sort()).toEqual([
      'https://insert-koin.io/docs/intro/what-is-koin-annotations',
      'https://insert-koin.io/docs/reference/koin-android/r8-proguard',
      'https://insert-koin.io/docs/setup/koin',
    ])
  })
})
