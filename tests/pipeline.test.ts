/**
 * End-to-end run of the docs pipeline against local repositories.
 *
 * Every stage runs for real — clone/fetch, change detection, strategy hooks,
 * translation with its checks and retries, pending files, checkpoints, commit
 * and push — except the model: @google/genai is replaced by a fake that
 * returns a structurally faithful "translation" (prose lines tagged with the
 * target language). Upstream repositories and the site's `origin` are
 * throwaway git repositories in a temp directory. The same sync is also run
 * the way CI runs it: one job per repository, then one job that commits.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const generateContent = vi.hoisted(() => vi.fn())
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent }
  },
}))

const { runPipeline, translateRepos, finalizeRun } = await import('../tools/pipeline/docs-pipeline.mjs')
const { exportRepoChanges } = await import('../tools/pipeline/sync-artifacts.mjs')
const { defaultStrategy } = await import('../tools/pipeline/sync-strategies/strategy.mjs')
const { koogStrategy } = await import('../tools/pipeline/sync-strategies/strategy-koog.mjs')
const { FatalApiError } = await import('../tools/pipeline/utils/llm-retry.mjs')

const LANGS = ['zh-Hans', 'zh-Hant', 'ja', 'ko']
const LOCALE_PREFIX: Record<string, string> = { 'zh-Hans': '', 'zh-Hant': 'zh-Hant/', ja: 'ja/', ko: 'ko/' }

// ─── Fake model ──────────────────────────────────────────────────────────────

const LANG_BY_NAME: Record<string, string> = { 简体中文: 'zh-Hans', 繁体中文: 'zh-Hant', Japanese: 'ja', Korean: 'ko' }

function languageOf(prompt: string) {
  const name = Object.keys(LANG_BY_NAME).find((n) => prompt.includes(n))
  if (!name) throw new Error('fake model: no target language in prompt')
  return LANG_BY_NAME[name]
}

/** Tag every prose line with the language; headings, code and comments stay. */
function fakeTranslate(source: string, lang: string) {
  let inFence = false
  return source
    .split('\n')
    .map((line) => {
      if (/^\s*```/.test(line)) inFence = !inFence
      return !inFence && /^[A-Za-z]/.test(line) ? `[${lang}] ${line}` : line
    })
    .join('\n')
}

type Override = (source: string, lang: string) => string | Error | undefined
let override: Override = () => undefined

function fakeModel({ contents: prompt }: { contents: string }) {
  const lang = languageOf(prompt)
  const reply = (text: string) => ({ text, candidates: [{ finishReason: 'STOP' }] })

  const locale = prompt.match(/return valid JSON per the rules above:\n\n([\s\S]*)$/)
  if (locale) {
    const values = JSON.parse(locale[1])
    for (const key of Object.keys(values)) {
      if (!String(values[key]).startsWith(`[${lang}]`)) values[key] = `[${lang}] ${values[key]}`
    }
    return reply(JSON.stringify(values, null, 2))
  }

  const doc = prompt.match(/```markdown\n {4}([\s\S]*)\n {4}```$/)
  if (!doc) throw new Error('fake model: unrecognised prompt')
  const custom = override(doc[1], lang)
  if (custom instanceof Error) throw custom
  return reply(custom ?? fakeTranslate(doc[1], lang))
}

const markdownCalls = () =>
  generateContent.mock.calls.filter(([{ contents }]) => contents.includes('```markdown'))

// ─── Sandbox ─────────────────────────────────────────────────────────────────

const doc = (title: string, sections: string[]) =>
  [
    `[//]: # (title: ${title})`,
    '',
    `Intro to ${title}.`,
    '',
    ...sections.flatMap((s, i) => [`## ${s}`, '', `Details about ${s}.`, '', '```kotlin', `val step${i} = "${s}"`, '```', '']),
  ].join('\n')

const UPSTREAM: Record<string, Record<string, string>> = {
  demo: {
    'docs/guide.md': doc('Guide', ['Install', 'Configure', 'Run']),
    'docs/nested/setup.md': doc('Setup', ['Gradle', 'Maven', 'Verify']),
  },
  mk: {
    'docs/mkdocs.yml': 'site_name: Mk\nnav:\n  - Overview: index.md\n  - Usage: usage.md\n',
    'docs/docs/index.md': doc('Overview', ['What', 'Why', 'How']),
    'docs/docs/usage.md': doc('Usage', ['Basics', 'Options', 'Tips']),
    'docs/docs/img/logo.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
  },
}

// The mk navigation reordered and a page renamed; no document changed
const NAV_ONLY_CHANGE = 'site_name: Mk\nnav:\n  - Using Mk: usage.md\n  - Overview: index.md\n'

const repos = [
  {
    id: 'demo', docType: 'demo', sidebarId: 'demo', repo: 'test/demo', branch: 'origin/main',
    cloneDir: 'demo-repo', sourceDocRoot: './docs', lastCheckFile: '.github/last_check_demo.txt',
    syncStrategy: defaultStrategy,
  },
  {
    id: 'mk', docType: 'mk', sidebarId: 'mk', repo: 'test/mk', branch: 'origin/main',
    cloneDir: 'mk-repo', sourceDocRoot: './docs/docs', lastCheckFile: '.github/last_check_mk.txt',
    assets: { src: 'docs/docs/img', dest: 'docs/public/mk' },
    syncStrategy: koogStrategy,
  },
]

let root: string
const originalCwd = process.cwd()
const originalEnv = { ...process.env }

const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

function write(dir: string, files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true })
    writeFileSync(join(dir, path), content)
  }
}

function commitUpstream(id: string, files: Record<string, string>, message: string, removed: string[] = []) {
  const dir = join(root, 'upstream', id)
  write(dir, files)
  removed.forEach((file) => rmSync(join(dir, file)))
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', message)
  return git(dir, 'rev-parse', 'HEAD')
}

// Upstream deletes a demo page, and moves an mk page, declaring the move as
// MkDocs does (redirects plugin)
function deleteAndMovePages() {
  commitUpstream('demo', {}, 'remove setup', ['docs/nested/setup.md'])
  commitUpstream('mk', {
    'docs/mkdocs.yml': [
      'site_name: Mk',
      'nav:',
      '  - Overview: index.md',
      '  - Usage: guide/usage.md',
      'plugins:',
      '  - redirects:',
      '      redirect_maps:',
      "        'usage.md': 'guide/usage.md'",
      '',
    ].join('\n'),
    'docs/docs/guide/usage.md': UPSTREAM.mk['docs/docs/usage.md'],
  }, 'move usage', ['docs/docs/usage.md'])
}

const LANG_FILES = (page: string) => LANGS.map((lang) => `docs/${LOCALE_PREFIX[lang]}${page}`)

const site = () => join(root, 'site')
const origin = () => join(root, 'origin.git')
const siteFile = (path: string) => join(site(), path)
const readSite = (path: string) => readFileSync(siteFile(path), 'utf8')
const originLog = () => git(origin(), 'log', '--format=%s', 'main').split('\n')
const originHas = (path: string) => {
  try {
    git(origin(), 'cat-file', '-e', `main:${path}`)
    return true
  } catch {
    return false
  }
}
const repoUrl = (r: { id: string }) => join(root, 'upstream', r.id)
const run = (options = {}) => runPipeline({ repos, repoUrl, ...options })

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'pipeline-'))
  const emptyConfig = join(root, 'gitconfig')
  writeFileSync(emptyConfig, '')
  Object.assign(process.env, {
    // Keep the machine's git config (signing, autocrlf, hooks) out of the sandbox.
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_AUTHOR_NAME: 'sync-bot',
    GIT_AUTHOR_EMAIL: 'sync-bot@example.com',
    GIT_COMMITTER_NAME: 'sync-bot',
    GIT_COMMITTER_EMAIL: 'sync-bot@example.com',
    GITHUB_REF_NAME: 'main',
  })
  delete process.env.GITHUB_HEAD_REF
  delete process.env.GITHUB_STEP_SUMMARY
  delete process.env.TRANSLATE_TIME_BUDGET_MINUTES

  for (const id of Object.keys(UPSTREAM)) {
    mkdirSync(join(root, 'upstream', id), { recursive: true })
    git(join(root, 'upstream', id), 'init', '-q', '-b', 'main')
    commitUpstream(id, UPSTREAM[id], 'initial docs')
  }

  git(root, 'init', '-q', '--bare', '-b', 'main', origin())
  git(root, 'clone', '-q', origin(), site())
  const locales = { en: { 'site.title': 'Docs' } } as Record<string, Record<string, string>>
  for (const lang of LANGS) locales[lang] = { 'site.title': `[${lang}] Docs` }
  write(site(), {
    '.gitignore': '*-repo/\n',
    'docs/.vitepress/sidebar/.gitkeep': '',
    ...Object.fromEntries(
      Object.entries(locales).map(([lang, values]) => [`docs/.vitepress/locales/${lang}.json`, JSON.stringify(values, null, 2) + '\n'])
    ),
  })
  git(site(), 'add', '-A')
  git(site(), 'commit', '-q', '-m', 'site skeleton')
  git(site(), 'push', '-q', 'origin', 'main')

  process.chdir(site())
  override = () => undefined
  generateContent.mockReset()
  generateContent.mockImplementation(async (request: { contents: string }) => fakeModel(request))
  for (const method of ['log', 'warn', 'error'] as const) vi.spyOn(console, method).mockImplementation(() => {})
})

afterEach(() => {
  process.chdir(originalCwd)
  process.env = { ...originalEnv }
  vi.restoreAllMocks()
  rmSync(root, { recursive: true, force: true })
})

// ─── Scenarios ───────────────────────────────────────────────────────────────

describe('docs pipeline', () => {
  it('translates every document on the first run and pushes one commit', async () => {
    await run()

    expect(markdownCalls()).toHaveLength(4 * LANGS.length)
    for (const lang of LANGS) {
      const prefix = LOCALE_PREFIX[lang]
      expect(readSite(`docs/${prefix}demo/guide.md`)).toContain(`[${lang}] Details about Configure.`)
      expect(readSite(`docs/${prefix}demo/nested/setup.md`)).toContain(`[${lang}] Intro to Setup.`)
      expect(readSite(`docs/${prefix}mk/usage.md`)).toContain(`[${lang}] Details about Options.`)
    }

    // Checkpoints, MkDocs sidebar and its translated labels, copied assets
    expect(readSite('.github/last_check_demo.txt')).toBe(git(join(root, 'upstream/demo'), 'rev-parse', 'HEAD'))
    expect(readSite('.github/last_check_mk.txt')).toBe(git(join(root, 'upstream/mk'), 'rev-parse', 'HEAD'))
    expect(JSON.parse(readSite('docs/.vitepress/sidebar/mk.sidebar.json')).map((n: any) => n.text)).toEqual(['mk.overview', 'mk.usage'])
    expect(JSON.parse(readSite('docs/.vitepress/locales/en.json'))['mk.usage']).toBe('Usage')
    expect(JSON.parse(readSite('docs/.vitepress/locales/ja.json'))['mk.usage']).toBe('[ja] Usage')
    expect(existsSync(siteFile('docs/public/mk/logo.svg'))).toBe(true)

    expect(originLog()).toEqual(['docs: [demo, mk] Sync and translate upstream documentation', 'site skeleton'])
    expect(originHas('docs/ko/demo/nested/setup.md')).toBe(true)
    expect(originHas('docs/.vitepress/sidebar/mk.sidebar.json')).toBe(true)
    expect(originHas('.github/last_check_demo.pending.json')).toBe(false)
  })

  it('translates only what changed upstream on a later run', async () => {
    await run()
    const mkCheckpoint = readSite('.github/last_check_mk.txt')
    const newSha = commitUpstream('demo', { 'docs/guide.md': doc('Guide', ['Install', 'Configure', 'Run', 'Upgrade']) }, 'add upgrade section')
    generateContent.mockClear()

    await run()

    expect(markdownCalls()).toHaveLength(LANGS.length)
    expect(markdownCalls().every(([{ contents }]) => contents.includes('## Upgrade'))).toBe(true)
    expect(readSite('docs/ja/demo/guide.md')).toContain('[ja] Details about Upgrade.')
    expect(readSite('.github/last_check_demo.txt')).toBe(newSha)
    expect(readSite('.github/last_check_mk.txt')).toBe(mkCheckpoint)
    expect(originLog()[0]).toBe('docs: [demo] Sync and translate upstream documentation')
  })

  it('commits nothing when upstream has not changed', async () => {
    await run()
    const commits = originLog().length
    generateContent.mockClear()

    await run()

    expect(markdownCalls()).toHaveLength(0)
    expect(originLog()).toHaveLength(commits)
    expect(git(site(), 'status', '--porcelain')).toBe('')
  })

  it('regenerates the sidebar when upstream changed only its navigation', async () => {
    await run()
    const newSha = commitUpstream('mk', { 'docs/mkdocs.yml': NAV_ONLY_CHANGE }, 'reorder nav')
    generateContent.mockClear()

    await run()

    expect(markdownCalls()).toHaveLength(0)
    expect(JSON.parse(readSite('docs/.vitepress/sidebar/mk.sidebar.json')).map((n: any) => n.text)).toEqual(['mk.using-mk', 'mk.overview'])
    expect(JSON.parse(readSite('docs/.vitepress/locales/ja.json'))['mk.using-mk']).toBe('[ja] Using Mk')
    expect(readSite('.github/last_check_mk.txt')).toBe(newSha)
    expect(originLog()[0]).toBe('docs: [mk] Sync and translate upstream documentation')
    expect(git(site(), 'status', '--porcelain')).toBe('')
  })

  // kotlinx.serialization's published docs are on a branch other than its default one
  it('syncs the configured branch, not the default one', async () => {
    const dir = join(root, 'upstream', 'branchy')
    mkdirSync(dir, { recursive: true })
    git(dir, 'init', '-q', '-b', 'main')
    commitUpstream('branchy', { 'docs/old.md': doc('Old', ['A', 'B', 'C']) }, 'main docs')
    git(dir, 'switch', '-q', '-c', 'docs-site')
    commitUpstream('branchy', { 'docs/site.md': doc('Site', ['A', 'B', 'C']) }, 'site docs', ['docs/old.md'])
    git(dir, 'switch', '-q', 'main')
    const branchy = {
      ...repos[0], id: 'branchy', docType: 'branchy', sidebarId: 'branchy', cloneDir: 'branchy-repo',
      lastCheckFile: '.github/last_check_branchy.txt', branch: 'origin/docs-site',
    }

    await runPipeline({ repos: [branchy], repoUrl })

    LANG_FILES('branchy/site.md').forEach((file) => expect(originHas(file), file).toBe(true))
    expect(originHas('docs/branchy/old.md')).toBe(false)
  })

  it('removes the pages deleted or moved upstream, and redirects the moved one', async () => {
    await run()
    deleteAndMovePages()
    generateContent.mockClear()

    await run()

    // The moved page is translated at its new path; nothing else is
    expect(markdownCalls()).toHaveLength(LANGS.length)
    for (const file of [...LANG_FILES('demo/nested/setup.md'), ...LANG_FILES('mk/usage.md')]) {
      expect(originHas(file), file).toBe(false)
    }
    LANG_FILES('mk/guide/usage.md').forEach((file) => expect(originHas(file), file).toBe(true))
    expect(JSON.parse(readSite('docs/.vitepress/redirects/mk.json'))).toEqual([{ from: 'mk/usage.md', to: 'mk/guide/usage.md' }])
    expect(JSON.parse(readSite('.github/last_check_demo.pages.json'))).toEqual(['guide.md'])
    expect(originLog()[0]).toBe('docs: [demo, mk] Sync and translate upstream documentation')
    expect(git(site(), 'status', '--porcelain')).toBe('')
  })

  it('keeps an incomplete translation out, records it as pending, and retries only it next run', async () => {
    write(site(), { 'docs/ja/demo/nested/setup.md': 'previous translation' })
    override = (source, lang) => (lang === 'ja' && source.includes('Intro to Setup.') ? 'このページでは設定について説明します。' : undefined)

    await run()

    // Rejected three times and never written over the previous translation;
    // everything else went through
    expect(markdownCalls().filter(([{ contents }]) => contents.includes('Intro to Setup.') && contents.includes('Japanese'))).toHaveLength(3)
    expect(readSite('docs/ja/demo/nested/setup.md')).toBe('previous translation')
    expect(existsSync(siteFile('docs/ko/demo/nested/setup.md'))).toBe(true)
    const pending = JSON.parse(readSite('.github/last_check_demo.pending.json'))
    expect(Object.keys(pending)).toEqual(['docs/nested/setup.md'])
    expect(pending['docs/nested/setup.md'].langs).toEqual(['ja'])
    expect(pending['docs/nested/setup.md'].reason).toMatch(/^incomplete translation: headings 0\/3/)
    // The checkpoint still moves on; the pending file carries the gap
    expect(readSite('.github/last_check_demo.txt')).toBe(git(join(root, 'upstream/demo'), 'rev-parse', 'HEAD'))
    expect(originHas('.github/last_check_demo.pending.json')).toBe(true)

    override = () => undefined
    generateContent.mockClear()
    await run()

    expect(markdownCalls()).toHaveLength(1)
    expect(readSite('docs/ja/demo/nested/setup.md')).toContain('[ja] Details about Maven.')
    expect(existsSync(siteFile('.github/last_check_demo.pending.json'))).toBe(false)
    expect(originHas('.github/last_check_demo.pending.json')).toBe(false)
  })


  it('stops before committing anything when the API key is rejected', async () => {
    override = () => Object.assign(new Error('API key not valid. Please pass a valid API key.'), { status: 400 })

    await expect(run()).rejects.toBeInstanceOf(FatalApiError)

    expect(originLog()).toEqual(['site skeleton'])
    expect(existsSync(siteFile('.github/last_check_demo.txt'))).toBe(false)
  })
})

// ─── Per-repository CI jobs ──────────────────────────────────────────────────

/** A CI job's checkout: a fresh clone of the site at the current origin/main. */
function checkout(name: string) {
  const dir = join(root, name)
  git(root, 'clone', '-q', origin(), dir)
  return dir
}

const artifacts = () => join(root, 'artifacts')

async function repoJob(id: string) {
  process.chdir(checkout(`job-${id}`))
  const context = await translateRepos({ repos: repos.filter((r) => r.id === id), repoUrl })
  await exportRepoChanges(context, join(artifacts(), `sync-${id}`))
}

async function finalizeJob(name: string, expected = ['demo', 'mk']) {
  const dir = checkout(name)
  process.chdir(dir)
  const report = await finalizeRun({ artifactsDir: artifacts(), expected })
  return { dir, report }
}

const treeOf = (dir: string) => git(dir, 'rev-parse', 'HEAD^{tree}')

describe('docs pipeline split into per-repository CI jobs', () => {
  it('ends in the same commit tree as a single run', async () => {
    await repoJob('demo')
    await repoJob('mk')
    const { dir, report } = await finalizeJob('finalize')

    expect(git(dir, 'log', '--format=%s', '-1')).toBe('docs: [demo, mk] Sync and translate upstream documentation')
    expect(git(dir, 'rev-list', '--count', 'HEAD')).toBe('2')
    expect(report).toContain('| demo | ✅ updated |')
    expect(report).toContain('| mk | ✅ updated |')

    // The same sync done by one process, pushed to origin
    process.chdir(site())
    await run()
    expect(treeOf(dir)).toBe(git(origin(), 'rev-parse', 'main^{tree}'))
  })

  it('commits the repositories that succeeded and reports the one that failed', async () => {
    await repoJob('demo') // the mk job failed: no artifact
    const { dir, report } = await finalizeJob('finalize')

    expect(git(dir, 'log', '--format=%s', '-1')).toBe('docs: [demo] Sync and translate upstream documentation')
    expect(existsSync(join(dir, '.github/last_check_demo.txt'))).toBe(true)
    expect(existsSync(join(dir, '.github/last_check_mk.txt'))).toBe(false)
    expect(existsSync(join(dir, 'docs/mk/usage.md'))).toBe(false)
    expect(report).toContain('| mk | ❌ failed, retried next run |')
    expect(report).toContain('Re-run failed jobs')
  })

  it('finalizes to the same tree when run again from the same artifacts', async () => {
    await repoJob('demo')
    await repoJob('mk')
    const first = await finalizeJob('finalize-1')
    const second = await finalizeJob('finalize-2')

    expect(treeOf(second.dir)).toBe(treeOf(first.dir))
  })

  it('carries a job\'s pending translations into the commit and the report', async () => {
    override = (source, lang) => (lang === 'ja' && source.includes('Intro to Setup.') ? '概要のみ。' : undefined)
    await repoJob('demo')
    override = () => undefined
    await repoJob('mk')
    const { dir, report } = await finalizeJob('finalize')

    const pending = JSON.parse(readFileSync(join(dir, '.github/last_check_demo.pending.json'), 'utf8'))
    expect(pending['docs/nested/setup.md'].langs).toEqual(['ja'])
    expect(git(dir, 'ls-files', '.github/last_check_demo.pending.json')).not.toBe('')
    expect(report).toMatch(/\| demo \| `docs\/nested\/setup\.md` \| ja \| incomplete translation/)
  })

  it('carries the pages removed by each job, and lists them in the report', async () => {
    await run()
    deleteAndMovePages()
    await repoJob('demo')
    await repoJob('mk')
    const { dir, report } = await finalizeJob('finalize')

    for (const file of [...LANG_FILES('demo/nested/setup.md'), ...LANG_FILES('mk/usage.md')]) {
      expect(existsSync(join(dir, file)), file).toBe(false)
    }
    expect(JSON.parse(readFileSync(join(dir, 'docs/.vitepress/redirects/mk.json'), 'utf8')))
      .toEqual([{ from: 'mk/usage.md', to: 'mk/guide/usage.md' }])
    expect(report).toContain('### Pages removed (deleted or moved upstream)')
    expect(report).toContain('| demo | `nested/setup.md` | — |')
    expect(report).toContain('| mk | `usage.md` | `guide/usage.md` |')

    // The same tree as removing them in one process
    process.chdir(site())
    await run()
    expect(treeOf(dir)).toBe(git(origin(), 'rev-parse', 'main^{tree}'))
  })

  it('carries a sidebar regenerated by a job with no documents to translate', async () => {
    await run()
    commitUpstream('mk', { 'docs/mkdocs.yml': NAV_ONLY_CHANGE }, 'reorder nav')
    generateContent.mockClear()
    await repoJob('demo')
    await repoJob('mk')
    const { dir, report } = await finalizeJob('finalize')

    expect(markdownCalls()).toHaveLength(0)
    const sidebar = JSON.parse(readFileSync(join(dir, 'docs/.vitepress/sidebar/mk.sidebar.json'), 'utf8'))
    expect(sidebar.map((n: any) => n.text)).toEqual(['mk.using-mk', 'mk.overview'])
    const ko = JSON.parse(readFileSync(join(dir, 'docs/.vitepress/locales/ko.json'), 'utf8'))
    expect(ko['mk.using-mk']).toBe('[ko] Using Mk')
    expect(report).toContain('| mk | ✅ updated |')
    expect(report).toContain('| demo | — no changes |')
    expect(git(dir, 'log', '--format=%s', '-1')).toBe('docs: [mk] Sync and translate upstream documentation')
  })

  it('commits nothing when no job changed anything', async () => {
    await run() // origin now holds a synced site
    generateContent.mockClear()
    await repoJob('demo')
    await repoJob('mk')
    const { dir, report } = await finalizeJob('finalize')

    expect(markdownCalls()).toHaveLength(0)
    expect(git(dir, 'rev-list', '--count', 'HEAD')).toBe('2') // skeleton + the earlier sync, nothing new
    expect(git(dir, 'status', '--porcelain')).toBe('')
    expect(report).toContain('| demo | — no changes |')
  })
})
