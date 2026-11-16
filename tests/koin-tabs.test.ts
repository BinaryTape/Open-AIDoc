import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyKoinTabs,
  hasTabLabels,
  KOIN_TABS,
  markdownBlocks,
  officialTabSets,
  tabOfLabel,
  tabOfTitle,
} from '../tools/pipeline/utils/koin-tabs.mjs'
import { fetchKoinSnapshot, MIN_PAGES } from '../tools/pipeline/utils/koin-llms.mjs'

// A tab set as insert-koin.io's pages have it (Docusaurus), each panel given as its blocks
const code = (text: string) =>
  `<div class="language-kotlin codeBlockContainer_Ckt0 theme-code-block"><div class="codeBlockContent_QJqH"><pre tabindex="0" class="prism-code"><code class="codeBlockLines_e6Vv">${text}<br></code></pre><div class="buttonGroup"><button><svg viewBox="0 0 24 24"><path d="M1"/></svg></button></div></div></div>`
const p = (text: string) => `<p>${text}</p>`
const tabSet = (...panels: string[][]) =>
  '<div class="tabs-container tabList__CuJ"><ul role="tablist" aria-orientation="horizontal" class="tabs">'
  + KOIN_TABS.map((tab, i) => `<li role="tab" tabindex="${i ? -1 : 0}" class="tabs__item">${tab.title.replace('/', '&#x2F;')}</li>`).join('')
  + '</ul><div class="margin-top--md">'
  + panels.map((blocks, i) => `<div role="tabpanel" class="tabItem_Ymn6"${i ? ' hidden=""' : ''}>${blocks.join('')}</div>`).join('')
  + '</div></div>'
const sitePage = (...content: string[]) =>
  `<!doctype html><html><head><title>x</title></head><body><nav><div class="tabs-container"><ul role="tablist"><li role="tab">Not docs</li></ul><div></div></div></nav>`
  + `<article><div class="theme-doc-markdown markdown"><h1>Page</h1>${content.join('')}</div></article></body></html>`

const kinds = (...k: ('code' | 'text')[]) => k

describe('the tab sets of a page of insert-koin.io', () => {
  it('reads each tab of each set in the article, and what kind of blocks it holds', () => {
    const html = sitePage(
      p('Intro'),
      tabSet([code('single&lt;A&gt;()')], [code('@Single'), p('A <code>@Module</code> class.')], [code('singleOf(::A)')]),
      p('Between'),
      tabSet([p('With the plugin:'), code('a')], [p('Not available.')], [code('b'), p('c'), code('d')]),
    )
    expect(officialTabSets(html)).toEqual([
      { tabs: KOIN_TABS.map((t) => t.title), panels: [kinds('code'), kinds('code', 'text'), kinds('code')] },
      { tabs: KOIN_TABS.map((t) => t.title), panels: [kinds('text', 'code'), kinds('text'), kinds('code', 'text', 'code')] },
    ])
  })

  it('finds none on a page without tabs', () => {
    expect(officialTabSets(sitePage(p('No tabs'), code('x')))).toEqual([])
  })
})

const SET = { tabs: KOIN_TABS.map((t) => t.title), panels: [kinds('code'), kinds('code', 'text'), kinds('code', 'text')] }

const FLAT = [
  'A definition:',
  '**Compiler Plugin DSL**',
  '```kotlin',
  'single<A>()',
  '```',
  '',
  '**Annotations**',
  '```kotlin',
  '@Single',
  '',
  '**Not a label inside code**',
  '```',
  '',
  'A `@Module` class gathers them.',
  '',
  '**Constructor / Classic DSL**',
  '```kotlin',
  'singleOf(::A)',
  '```',
  '',
  'Write the constructor call when it takes parameters.',
  '',
  'After the tabs.',
].join('\n')

const TABBED = [
  'A definition:',
  '',
  '<tabs group="koin-style">',
  '<tab title="Compiler Plugin DSL" group-key="compiler-plugin">',
  '',
  '```kotlin',
  'single<A>()',
  '```',
  '',
  '</tab>',
  '<tab title="Annotations" group-key="annotations">',
  '',
  '```kotlin',
  '@Single',
  '',
  '**Not a label inside code**',
  '```',
  '',
  'A `@Module` class gathers them.',
  '',
  '</tab>',
  '<tab title="Constructor / Classic DSL" group-key="classic">',
  '',
  '```kotlin',
  'singleOf(::A)',
  '```',
  '',
  'Write the constructor call when it takes parameters.',
  '',
  '</tab>',
  '</tabs>',
  '',
  'After the tabs.',
].join('\n')

describe('putting the code tabs back', () => {
  it('turns the bold labels into tabs, the last tab ending where it ends on the site', () => {
    expect(applyKoinTabs(FLAT, [SET])).toEqual({ markdown: TABBED, sets: 1 })
  })

  it('reads the labels of a translated page, and writes the titles in English', () => {
    const translated = FLAT
      .replace('**Compiler Plugin DSL**', '**编译器插件 DSL**')
      .replace('**Annotations**', '**어노테이션 (Annotations)**')
      .replace('**Constructor / Classic DSL**', '**建構函式 / 傳統 DSL**')
    expect(applyKoinTabs(translated, [SET], { labelOf: tabOfLabel }).markdown).toBe(TABBED)
    // The upstream's labels are read as written only
    expect(applyKoinTabs(translated, [SET])).toMatchObject({ markdown: translated, sets: 0 })
  })

  it('keeps the line endings of the page', () => {
    expect(applyKoinTabs(FLAT.replaceAll('\n', '\r\n'), [SET]).markdown).toBe(TABBED.replaceAll('\n', '\r\n'))
  })

  it('handles a tab holding text only, and sets one after the other', () => {
    const flat = ['**Compiler Plugin DSL**', '', 'Not available.', '', '**Annotations**', '```', 'a', '```', '**Constructor / Classic DSL**', '```', 'b', '```']
    const two = [...flat, '', ...flat].join('\n')
    const set = { tabs: SET.tabs, panels: [kinds('text'), kinds('code'), kinds('code')] }
    const result = applyKoinTabs(two, [set, set])
    expect(result.sets).toBe(2)
    expect(result.markdown.match(/<tabs /g)).toHaveLength(2)
    expect(result.markdown).toContain('<tab title="Compiler Plugin DSL" group-key="compiler-plugin">\n\nNot available.\n\n</tab>')
    expect(result.markdown).toContain('</tabs>\n\n<tabs group="koin-style">')
  })

  it('changes nothing when the page does not match the site', () => {
    // A tab whose blocks differ from the site's
    const other = { tabs: SET.tabs, panels: [kinds('code'), kinds('code'), kinds('code', 'text')] }
    expect(applyKoinTabs(FLAT, [other])).toEqual({
      markdown: FLAT,
      sets: 0,
      problem: 'tab set 1, Annotations (line 7): blocks code,text, the site has code',
    })
    // More sets on the site than labels on the page
    expect(applyKoinTabs(FLAT, [SET, SET]).problem).toBe('3 tab labels for 2 tab sets on the site')
    // The last tab shorter than on the site
    const longer = { tabs: SET.tabs, panels: [kinds('code'), kinds('code', 'text'), kinds('code', 'text', 'text', 'code')] }
    expect(applyKoinTabs(FLAT, [longer]).markdown).toBe(FLAT)
    // Labels out of order
    const swapped = FLAT.replace('**Compiler Plugin DSL**', '**X**').replace('**Annotations**', '**Compiler Plugin DSL**').replace('**X**', '**Annotations**')
    expect(applyKoinTabs(swapped, [SET]).problem).toMatch(/labels out of order/)
    // Tabs other than the three styles
    expect(applyKoinTabs(FLAT, [{ tabs: ['Gradle', 'Maven'], panels: [] }]).problem).toMatch(/a tab set other than/)
  })

  it('leaves a page without labels or tab sets as it is', () => {
    expect(applyKoinTabs('**Annotation processing**\n\nText.', [])).toEqual({ markdown: '**Annotation processing**\n\nText.', sets: 0 })
  })
})

describe('reading the Markdown', () => {
  it('splits blocks at blank lines and around code, a ::: container being one block', () => {
    const lines = ['Text', 'more', '```kotlin', 'a', '', 'b', '```', ':::note', 'x', '', 'y', ':::', '', '- item', '', '````', '```', '````']
    expect(markdownBlocks(lines).map((b) => [b.start, b.end, b.kind])).toEqual([
      [0, 2, 'text'], [2, 7, 'code'], [7, 12, 'text'], [13, 14, 'text'], [15, 18, 'code'],
    ])
  })

  it('tells the labels of the three styles, as the upstream and the translations write them', () => {
    expect(KOIN_TABS.map((t) => tabOfTitle(t.title))).toEqual([0, 1, 2])
    expect(tabOfTitle('Annotation')).toBe(-1)
    const translated: [string, number][] = [
      ['编译器插件 DSL', 0], ['コンパイラプラグインDSL', 0], ['컴파일러 플러그인 DSL (Compiler Plugin DSL)', 0], ['編譯器外掛程式 DSL', 0],
      ['注解', 1], ['註解（Annotations）', 1], ['アノテーション', 1], ['애너테이션', 1], ['어노테이션(Annotations)', 1], ['애노테이션', 1],
      ['构造函数 / 经典 DSL', 2], ['建構函式 / 傳統 DSL', 2], ['コンストラクタ / クラシック DSL', 2], ['생성자 / 클래식 DSL', 2],
      ['Gradle', -1],
    ]
    for (const [label, tab] of translated) expect(tabOfLabel(label), label).toBe(tab)
    expect(hasTabLabels('Text\n\n**Annotations**\n```')).toBe(true)
    expect(hasTabLabels('Text **Annotations** inline')).toBe(false)
  })
})

describe('the Koin snapshot', () => {
  const page = (title: string, url: string, body: string) => `# ${title}\n\nSource: https://insert-koin.io/docs/${url}\n\n${body}\n`
  const exportWith = (body: string) => ['# Koin', '', [
    page('Definitions', 'reference/definitions', body),
    ...Array.from({ length: MIN_PAGES }, (_, i) => page(`Page ${i}`, `section/page-${i}`, `Text ${i}.`)),
  ].join('\n---\n\n')].join('\n')
  const site = (pages: Record<string, string>) => {
    const requested: string[] = []
    const fetchImpl = (async (url: string) => {
      requested.push(String(url))
      const body = pages[String(url)]
      return { ok: body !== undefined, status: body === undefined ? 404 : 200, text: async () => body ?? '' } as Response
    }) as typeof fetch
    return { fetchImpl, requested }
  }
  const SITE_SET = tabSet([code('a')], [code('b'), p('c')], [code('d'), p('e')])

  afterEach(() => vi.restoreAllMocks())

  it('puts the tabs back from the page on the site, reading only the pages with labels', async () => {
    const { fetchImpl, requested } = site({
      'https://insert-koin.io/llms-full.txt': exportWith(FLAT),
      'https://insert-koin.io/llms.txt': '# Koin',
      'https://insert-koin.io/docs/reference/definitions': sitePage(SITE_SET),
    })
    const snapshot = await fetchKoinSnapshot({ fetchImpl })
    expect(snapshot['docs/reference/definitions.md']).toBe(`---\ntitle: Definitions\n---\n\n# Definitions\n\n${TABBED}\n`)
    expect(requested.filter((url) => url.includes('/docs/'))).toEqual(['https://insert-koin.io/docs/reference/definitions'])
  })

  it('leaves the labels when the page on the site does not match, with a warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { fetchImpl } = site({
      'https://insert-koin.io/llms-full.txt': exportWith(FLAT),
      'https://insert-koin.io/llms.txt': '# Koin',
      'https://insert-koin.io/docs/reference/definitions': sitePage(p('The tabs are gone')),
    })
    const snapshot = await fetchKoinSnapshot({ fetchImpl })
    expect(snapshot['docs/reference/definitions.md']).toContain('**Compiler Plugin DSL**')
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/reference\/definitions: code tabs left flattened, 3 tab labels for 0 tab sets/))
  })

  it('stops when a page with labels cannot be read, rather than flatten its tabs', async () => {
    const { fetchImpl, requested } = site({
      'https://insert-koin.io/llms-full.txt': exportWith(FLAT),
      'https://insert-koin.io/llms.txt': '# Koin',
    })
    await expect(fetchKoinSnapshot({ fetchImpl, retryDelayMs: 0 })).rejects.toThrow(/docs\/reference\/definitions: HTTP 404/)
    // A missing page is not tried again
    expect(requested.filter((url) => url.includes('/docs/'))).toHaveLength(1)
  })

  it('tries a page again after a network or server error', async () => {
    const { fetchImpl: siteFetch } = site({
      'https://insert-koin.io/llms-full.txt': exportWith(FLAT),
      'https://insert-koin.io/llms.txt': '# Koin',
      'https://insert-koin.io/docs/reference/definitions': sitePage(SITE_SET),
    })
    const failures = [() => Promise.reject(new TypeError('fetch failed')), () => Promise.resolve({ ok: false, status: 503 } as Response)]
    const fetchImpl = ((url: string) =>
      (url.includes('/docs/') && failures.length > 0 ? failures.shift()!() : siteFetch(url))) as typeof fetch
    const snapshot = await fetchKoinSnapshot({ fetchImpl, retryDelayMs: 0 })
    expect(snapshot['docs/reference/definitions.md']).toContain('<tabs group="koin-style">')

    const down = ((url: string) => (url.includes('/docs/') ? Promise.reject(new TypeError('fetch failed')) : siteFetch(url))) as typeof fetch
    await expect(fetchKoinSnapshot({ fetchImpl: down, retryDelayMs: 0 })).rejects.toThrow(/docs\/reference\/definitions: fetch failed/)
  })
})
