import { beforeEach, describe, expect, it, vi } from 'vitest'
import { REPOS } from '../tools/pipeline/repos.config.mjs'
import {
  PROJECTS,
  buildPageTree,
  clearSourceCache,
  listSourcePages,
  readSourceFile,
  saveTargetPath,
  targetPathOf,
} from '../translate-tool/sources.mjs'

// insert-koin.io/llms-full.txt: one page after another, each with its Source line
const KOIN_URLS = [
  'intro',
  'intro/what-is-dependency-injection',
  'reference/koin-core/definitions',
  ...Array.from({ length: 40 }, (_, i) => `reference/koin-core/page-${i}`),
]
const LLMS_FULL = KOIN_URLS.map((url) => `# Title of ${url}\n\nSource: https://insert-koin.io/docs/${url}\n\nBody of ${url}.\n\n---\n`).join('\n')
const LLMS_INDEX = '# Koin\n\n## Documentation\n\n### Intro\n- [Intro](https://insert-koin.io/docs/intro)\n'

/** A fetch that answers insert-koin.io and GitHub, and records what was asked. */
function fakeFetch(githubTree: string[] = [], contents: Record<string, string> = {}, { treesApi = true } = {}) {
  const asked: string[] = []
  const fetchImpl = async (url: string) => {
    asked.push(url)
    const text = (body: string) => ({ ok: true, status: 200, text: async () => body, json: async () => JSON.parse(body) })
    if (url === 'https://insert-koin.io/llms-full.txt') return text(LLMS_FULL)
    if (url === 'https://insert-koin.io/llms.txt') return text(LLMS_INDEX)
    if (url.includes('/git/trees/') && treesApi) return text(JSON.stringify({ truncated: false, tree: githubTree.map((path) => ({ path, type: 'blob' })) }))
    // Contents API: the files and directories right in a directory
    const listed = /\/contents\/(.*?)\?ref=/.exec(url)
    if (listed && !treesApi) {
      const dir = listed[1].replace(/\/$/, '')
      const inDir = githubTree.filter((p) => (dir ? p.startsWith(dir + '/') : true)).map((p) => (dir ? p.slice(dir.length + 1) : p))
      const names = [...new Set(inDir.map((p) => p.split('/')[0]))]
      return text(JSON.stringify(names.map((name) => {
        const full = dir ? `${dir}/${name}` : name
        return { name, path: full, type: githubTree.includes(full) ? 'file' : 'dir' }
      })))
    }
    if (url.startsWith('https://raw.githubusercontent.com/')) {
      const file = url.split('/').slice(6).join('/')
      if (file in contents) return text(contents[file])
      if (file.endsWith('.tree')) return { ok: false, status: 404, text: async () => '', json: async () => ({}) }
      return text(`raw ${url}`)
    }
    return { ok: false, status: 404, text: async () => '', json: async () => ({}) }
  }
  return { fetchImpl: fetchImpl as unknown as typeof fetch, asked }
}

describe('translate tool: the upstreams of the pipeline', () => {
  beforeEach(() => clearSourceCache())

  it('lists every upstream of the pipeline, with its repository and branch', () => {
    const upstreams = PROJECTS.flatMap((project) => project.repos.map((repo) => ({ ...repo, docType: project.name })))
    expect(upstreams.map((u) => u.id).sort()).toEqual(REPOS.map((r) => r.id).sort())
    for (const repoConfig of REPOS) {
      const upstream = upstreams.find((u) => u.id === repoConfig.id)!
      expect(upstream.docType).toBe(repoConfig.docType)
      expect(`origin/${upstream.branch}`).toBe(repoConfig.branch)
    }
    // Was doc-restructuring-master, a branch left behind since Kotlin/kotlinx.serialization#3055
    expect(upstreams.find((u) => u.id === 'kotlinx-serialization')!.source).toBe('Kotlin/kotlinx.serialization@master')
    expect(PROJECTS.map((p) => p.name)).toEqual(['kotlin', 'kmp', 'ktor', 'koin', 'sqldelight', 'koog', 'coil'])
  })

  it('reads Koin from insert-koin.io/llms-full.txt, as the pipeline does, not the stale docs/ of the repository', async () => {
    expect(PROJECTS.find((p) => p.name === 'koin')!.repos).toEqual([
      expect.objectContaining({ id: 'koin', source: 'insert-koin.io/llms-full.txt' }),
    ])
    const { fetchImpl, asked } = fakeFetch()
    const pages = await listSourcePages('koin', { fetchImpl })
    expect(pages).toHaveLength(KOIN_URLS.length)
    expect(pages).toContainEqual({ path: 'docs/intro/index.md', page: 'intro/index.md' })
    expect(pages).toContainEqual({ path: 'docs/reference/koin-core/definitions.md', page: 'reference/koin-core/definitions.md' })
    expect(pages.map((p) => p.path)).not.toContain('llms.txt')
    expect(asked.some((url) => url.includes('github'))).toBe(false)

    const content = await readSourceFile('koin', 'docs/reference/koin-core/definitions.md', { fetchImpl })
    expect(content).toBe('---\ntitle: Title of reference/koin-core/definitions\n---\n\n# Title of reference/koin-core/definitions\n\nBody of reference/koin-core/definitions.\n')
    await expect(readSourceFile('koin', 'docs/missing.md', { fetchImpl })).rejects.toThrow('快照里没有')
  })

  it('lists the files of a git upstream the pipeline translates, by the page each becomes', async () => {
    const { fetchImpl } = fakeFetch([
      'topics/server-routing.topic',
      'topics/faq.md',
      'topics/lib.topic', // a library of snippets, not a page
      'topics/nested/other.md', // ktor reads topics/*, not below
      'images/a.png',
      'README.md',
    ])
    const pages = await listSourcePages('ktor', { fetchImpl })
    expect(pages).toEqual([
      { path: 'topics/server-routing.topic', page: 'server-routing.md' },
      { path: 'topics/faq.md', page: 'faq.md' },
    ])
    expect(await readSourceFile('ktor', 'topics/faq.md', { fetchImpl })).toBe('raw https://raw.githubusercontent.com/ktorio/ktor-documentation/main/topics/faq.md')
    await expect(readSourceFile('ktor', 'README.md', { fetchImpl })).rejects.toThrow('不是 ktor 的文档文件')
  })

  it('lists one file per page, the one the pipeline copies over the other', async () => {
    // kotlinx.coroutines keeps old placeholders next to its topics; flattening copies the topic over them
    const { fetchImpl } = fakeFetch([
      'docs/channels.md',
      'docs/topics/channels.md',
      'docs/topics/coroutines-basics.md',
      // A stub alone; the pipeline leaves it out (it is not in kc.tree), the
      // tool does not read the tree yet (P3-29)
      'docs/basics.md',
      'docs/debugging.md', // left out by the pipeline
      'docs/topics/debugging.md',
    ])
    expect(await listSourcePages('kotlinx-coroutines', { fetchImpl })).toEqual([
      { path: 'docs/topics/channels.md', page: 'channels.md' },
      { path: 'docs/topics/coroutines-basics.md', page: 'coroutines-basics.md' },
      { path: 'docs/basics.md', page: 'basics.md' },
    ])
  })

  it('shows the pages as the site lays them out', () => {
    const tree = buildPageTree([
      { path: 'docs/intro/index.md', page: 'intro/index.md' },
      { path: 'docs/reference/koin-core/definitions.md', page: 'reference/koin-core/definitions.md' },
      { path: 'docs/topics/jvm/home.topic', page: 'home.md' },
    ])
    expect(tree.map((n) => n.name)).toEqual(['intro', 'reference', 'home.md'])
    expect(tree[1].children[0].children[0]).toEqual({
      name: 'definitions.md', type: 'file', path: 'docs/reference/koin-core/definitions.md', page: 'reference/koin-core/definitions.md',
    })
  })
})

describe('translate tool: where a translation is saved', () => {
  it('saves a page of an upstream where the pipeline writes it', () => {
    // Koin keeps its directories: intro/index.md and setup/index.md no longer overwrite each other
    expect(targetPathOf('koin', 'docs/reference/koin-core/definitions.md', 'ja')).toBe('ja/koin/reference/koin-core/definitions.md')
    expect(targetPathOf('koin', 'docs/intro/index.md', 'zh-Hans')).toBe('koin/intro/index.md')
    expect(targetPathOf('koin', 'docs/setup/index.md', 'zh-Hans')).toBe('koin/setup/index.md')
    expect(targetPathOf('koog', 'docs/docs/a2a/a2a-client.md', 'ko')).toBe('ko/koog/a2a/a2a-client.md')
    // Writerside topics are flattened, and a .topic becomes a page
    expect(targetPathOf('kotlin-web-site', 'docs/topics/jvm/jvm-get-started.md', 'ja')).toBe('ja/kotlin/jvm-get-started.md')
    expect(targetPathOf('kotlin-web-site', 'docs/topics/home.topic', 'zh-Hans')).toBe('kotlin/home.md')
    expect(targetPathOf('kmp', 'topics/development/multiplatform-run-tests.md', 'zh-Hant')).toBe('zh-Hant/kmp/multiplatform-run-tests.md')
    expect(targetPathOf('ktor', 'topics/server-routing.topic', 'ko')).toBe('ko/ktor/server-routing.md')
  })

  it('refuses a file the pipeline does not publish', () => {
    expect(() => targetPathOf('ktor', 'topics/lib.topic', 'ja')).toThrow('流水线不发布这个文件')
    expect(() => targetPathOf('koin', 'llms.txt', 'ja')).toThrow('流水线不发布这个文件')
    expect(() => targetPathOf('koin', 'docs/../../package.json', 'ja')).toThrow('流水线不发布这个文件')
    expect(() => targetPathOf('koin', 'docs/../../README.md', 'ja')).toThrow('流水线不发布这个文件')
  })

  it('saves an uploaded file at the root of its project, and nowhere outside docs/', async () => {
    clearSourceCache()
    const save = (projectName: string, fileName: string, targetLang = 'ja') => saveTargetPath({ projectName, fileName, targetLang })
    expect(await save('kotlin', 'getting-started.md')).toBe('ja/kotlin/getting-started.md')
    expect(await save('kotlin', '../../package.json')).toBe('ja/kotlin/package.json')
    expect(await save('kotlin', '..\\..\\x.md')).toBe('ja/kotlin/x.md')
    await expect(save('../tools', 'x.md')).rejects.toThrow('无效的保存路径')
    await expect(save('kotlin', 'x.md', '../..')).rejects.toThrow('无效的保存路径')
    const { fetchImpl } = fakeFetch()
    expect(await saveTargetPath({ projectName: 'koin', fileName: 'index.md', targetLang: 'ko', sourceId: 'koin', sourcePath: 'docs/intro/index.md' }, { fetchImpl }))
      .toBe('ko/koin/intro/index.md')
  })
})

describe('translate tool: only the pages a Writerside tree publishes', () => {
  beforeEach(() => clearSourceCache())

  const KTOR_TREE = '<instance-profile id="ktor"><toc-element topic="server-cors.md"/><toc-element topic="welcome.topic"/></instance-profile>'
  const ktorFiles = ['ktor.tree', 'topics/server-cors.md', 'topics/welcome.topic', 'topics/db-persistence.md']

  it('leaves out a ktor topic ktor.tree does not list (a retired tutorial), and does not save it', async () => {
    const { fetchImpl } = fakeFetch(ktorFiles, { 'ktor.tree': KTOR_TREE })
    expect((await listSourcePages('ktor', { fetchImpl })).map((p) => p.page)).toEqual(['server-cors.md', 'welcome.md'])

    const save = (sourcePath: string) => saveTargetPath({ projectName: 'ktor', fileName: 'x.md', targetLang: 'ja', sourceId: 'ktor', sourcePath }, { fetchImpl })
    expect(await save('topics/server-cors.md')).toBe('ja/ktor/server-cors.md')
    await expect(save('topics/db-persistence.md')).rejects.toThrow('流水线不发布这个文件')
  })

  it('leaves out the stubs of kotlinx.coroutines and the KMP pages their trees do not list', async () => {
    const coroutines = fakeFetch(['docs/kc.tree', 'docs/basics.md', 'docs/channels.md', 'docs/topics/channels.md', 'docs/topics/coroutines-basics.md'], {
      'docs/kc.tree': '<instance-profile id="kc"><toc-element topic="coroutines-basics.md" accepts-web-file-names="basics.html"/><toc-element topic="channels.md"/></instance-profile>',
    })
    expect(await listSourcePages('kotlinx-coroutines', { fetchImpl: coroutines.fetchImpl })).toEqual([
      { path: 'docs/topics/channels.md', page: 'channels.md' },
      { path: 'docs/topics/coroutines-basics.md', page: 'coroutines-basics.md' },
    ])

    const kmp = fakeFetch(['mpd.tree', 'topics/start/quickstart.md', 'topics/multiplatform-setup.md', 'topics/shipathon-starter-guide.md'], {
      'mpd.tree': '<instance-profile id="mpd"><toc-element topic="quickstart.md" accepts-web-file-names="multiplatform-setup.html"/>' +
        '<toc-element hidden="true" topic="shipathon-starter-guide.md"/></instance-profile>',
    })
    // a hidden topic is still a page there
    expect((await listSourcePages('kmp', { fetchImpl: kmp.fetchImpl })).map((p) => p.page)).toEqual(['quickstart.md', 'shipathon-starter-guide.md'])
  })

  it('finds a tree at the root when GitHub only lists directories one by one', async () => {
    const { fetchImpl, asked } = fakeFetch(ktorFiles, { 'ktor.tree': KTOR_TREE }, { treesApi: false })
    expect((await listSourcePages('ktor', { fetchImpl })).map((p) => p.page)).toEqual(['server-cors.md', 'welcome.md'])
    expect(asked.some((url) => url.includes('/contents/?ref='))).toBe(true)
  })

  it('lists every page when the tree is missing or cannot be read, and says so', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const missing = fakeFetch(['topics/server-cors.md', 'topics/db-persistence.md'])
    expect(await listSourcePages('ktor', { fetchImpl: missing.fetchImpl })).toHaveLength(2)
    clearSourceCache()
    const unreadable = fakeFetch(ktorFiles) // ktor.tree: 404
    expect(await listSourcePages('ktor', { fetchImpl: unreadable.fetchImpl })).toHaveLength(3)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ktor'))
    // not kept: the tree is asked for again next time, and read once it answers
    const treeAsked = () => unreadable.asked.filter((url) => url.endsWith('/ktor.tree')).length
    await listSourcePages('ktor', { fetchImpl: unreadable.fetchImpl })
    expect(treeAsked()).toBe(2)
    const answering = fakeFetch(ktorFiles, { 'ktor.tree': KTOR_TREE })
    expect(await listSourcePages('ktor', { fetchImpl: answering.fetchImpl })).toHaveLength(2)
    warn.mockRestore()
  })
})
