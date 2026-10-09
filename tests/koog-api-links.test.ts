import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'
import {
  apiKeysIn,
  parseNavigation,
  resolveApiKey,
  syncKoogApiLinks,
} from '../tools/pipeline/utils/koog-api-links.mjs'
import markdownItMkApiLinks from '../docs/.vitepress/plugins/markdown/mkdocs/markdown-it-mk-api-links'

// The shape of https://api.koog.ai/navigation.html
const entry = (pageid: string, href: string) =>
  `<div class="toc--part" id="x" pageid="${pageid}" data-nesting-level="2">\n` +
  `    <div class="toc--row">\n` +
  `     <button class="toc--button"></button><a href="${href}" class="toc--link"><span>x</span></a>\n` +
  `    </div>\n</div>`

const NAV = [
  entry('agents-core::////PointingToDeclaration//1', 'agents/agents-core/index.html'),
  entry('agents-core::ai.koog.agents.core.agent////PointingToDeclaration//1', 'agents/agents-core/ai.koog.agents.core.agent/index.html'),
  entry('agents-core::ai.koog.agents.core.agent/AIAgent///PointingToDeclaration//1', 'agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html'),
  entry('prompt-model::ai.koog.prompt.message/ContentPart///PointingToDeclaration//1', 'prompt/prompt-model/ai.koog.prompt.message/-content-part/index.html'),
].join('\n')

const BASE = 'https://api.koog.ai/'
const map = parseNavigation(NAV, `${BASE}navigation.html`)

describe('resolveApiKey', () => {
  it('finds classes and packages in the dotted form the docs use', () => {
    expect(resolveApiKey(map, 'agents-core::ai.koog.agents.core.agent.AIAgent'))
      .toBe(`${BASE}agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html`)
    expect(resolveApiKey(map, 'agents-core::ai.koog.agents.core.agent'))
      .toBe(`${BASE}agents/agents-core/ai.koog.agents.core.agent/index.html`)
    expect(resolveApiKey(map, 'agents-core::')).toBe(`${BASE}agents/agents-core/index.html`)
  })

  it('builds member pages the way Dokka names them', () => {
    const agent = `${BASE}agents/agents-core/ai.koog.agents.core.agent/-a-i-agent`
    expect(resolveApiKey(map, 'agents-core::ai.koog.agents.core.agent.AIAgent.runAndGetResult'))
      .toBe(`${agent}/run-and-get-result.html`)
    expect(resolveApiKey(map, 'agents-core::ai.koog.agents.core.agent.AIAgent.Companion'))
      .toBe(`${agent}/-companion/index.html`)
    expect(resolveApiKey(map, 'agents-core::ai.koog.agents.core.agent.AIAgent.DEFAULT_NAME'))
      .toBe(`${agent}/-d-e-f-a-u-l-t_-n-a-m-e.html`)
  })

  it('resolves nested members through their parents', () => {
    expect(resolveApiKey(map, 'prompt-model::ai.koog.prompt.message.ContentPart.Image.Companion'))
      .toBe(`${BASE}prompt/prompt-model/ai.koog.prompt.message/-content-part/-image/-companion/index.html`)
  })

  it('returns null for keys the API docs do not have', () => {
    expect(resolveApiKey(map, 'http-client-ktor::')).toBeNull()
    expect(resolveApiKey(map, 'vector-storage::ai.koog.rag.vector.FileVectorStorage')).toBeNull()
  })
})

describe('syncKoogApiLinks', () => {
  let dir: string
  const outFile = () => join(dir, 'koog-api-links.json')
  const fetchNav = vi.fn(async () => new Response(NAV))

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'koog-api-'))
    mkdirSync(join(dir, 'upstream'))
    mkdirSync(join(dir, 'ja'))
    writeFileSync(join(dir, 'upstream', 'agents.md'), 'Use [AIAgent](api:agents-core::ai.koog.agents.core.agent.AIAgent).')
    writeFileSync(join(dir, 'ja', 'http.md'), '[Ktor](api:http-client-ktor::) と [AIAgent](api:agents-core::ai.koog.agents.core.agent.AIAgent)')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    fetchNav.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rmSync(dir, { recursive: true, force: true })
  })

  it('writes the URL of every key linked from the docs and the translations', async () => {
    const result = await syncKoogApiLinks([join(dir, 'upstream'), join(dir, 'ja'), join(dir, 'missing')], {
      fetchImpl: fetchNav, outFile: outFile(),
    })

    expect(result).toEqual({ resolved: 1, unresolved: ['http-client-ktor::'] })
    expect(JSON.parse(readFileSync(outFile(), 'utf8'))).toEqual({
      'agents-core::ai.koog.agents.core.agent.AIAgent': `${BASE}agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/index.html`,
    })
  })

  it('drops a guessed member page that does not exist', async () => {
    writeFileSync(join(dir, 'upstream', 'run.md'), '[run](api:agents-core::ai.koog.agents.core.agent.AIAgent.run)')
    const runPage = `${BASE}agents/agents-core/ai.koog.agents.core.agent/-a-i-agent/run.html`
    const fetchImpl = async (url: string) => new Response(url === runPage ? null : NAV, { status: url === runPage ? 404 : 200 })

    const result = await syncKoogApiLinks([join(dir, 'upstream')], { fetchImpl, outFile: outFile() })

    expect(result).toEqual({ resolved: 1, unresolved: ['agents-core::ai.koog.agents.core.agent.AIAgent.run'] })
  })

  it('keeps a link it cannot check', async () => {
    const fetchImpl = async (_url: string, init?: RequestInit) => {
      if (init?.method === 'HEAD') throw new Error('timeout')
      return new Response(NAV)
    }
    const result = await syncKoogApiLinks([join(dir, 'upstream')], { fetchImpl, outFile: outFile() })
    expect(result).toEqual({ resolved: 1, unresolved: [] })
  })

  it('does not fetch anything when no page links the API', async () => {
    const result = await syncKoogApiLinks([join(dir, 'missing')], { fetchImpl: fetchNav, outFile: outFile() })
    expect(result).toBeNull()
    expect(fetchNav).not.toHaveBeenCalled()
  })

  it('keeps the current file when the API docs cannot be reached', async () => {
    writeFileSync(outFile(), '{"kept": "yes"}\n')
    const result = await syncKoogApiLinks([join(dir, 'upstream')], {
      fetchImpl: async () => { throw new Error('offline') }, outFile: outFile(),
    })
    expect(result).toBeNull()
    expect(readFileSync(outFile(), 'utf8')).toBe('{"kept": "yes"}\n')
  })

  it('reads keys from Markdown links only', () => {
    expect(apiKeysIn('[A](api:m::a.B) `api:m::not.a.link` [C](https://x)')).toEqual(['m::a.B'])
    expect(existsSync(outFile())).toBe(false)
  })
})

describe('api: links in the site build', () => {
  const md = new MarkdownIt().use(markdownItMkApiLinks, { 'm::a.B': 'https://api.koog.ai/m/a/-b/index.html' })

  it('links a resolved key to its API page', () => {
    expect(md.renderInline('See [B](api:m::a.B).')).toBe('See <a href="https://api.koog.ai/m/a/-b/index.html">B</a>.')
  })

  it('renders an unresolved key as plain text, formatting kept', () => {
    expect(md.renderInline('See [the `Ktor` client](api:http-client-ktor::) and [docs](guide.md).'))
      .toBe('See the <code>Ktor</code> client and <a href="guide.md">docs</a>.')
  })
})
