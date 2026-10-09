import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const generateContent = vi.hoisted(() => vi.fn())
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent }
  },
}))

const section = (n: number, prose: string) =>
  [`## Section ${n}`, '', prose, '', '```kotlin', `val x${n} = ${n}`, '```', ''].join('\n')
const SOURCE = ['[//]: # (title: Guide)', '', ...[1, 2, 3, 4].map((n) => section(n, `Prose ${n}.`))].join('\n')
const COMPLETE = ['[//]: # (title: 指南)', '', ...[1, 2, 3, 4].map((n) => section(n, `正文 ${n}。`))].join('\n')
const SUMMARY = '本页介绍了四个部分。'

const reply = (text: string, finishReason = 'STOP') => ({ text, candidates: [{ finishReason }] })
const apiError = (status: number, message: string) => Object.assign(new Error(message), { status })

const repoConfig = { id: 'demo', docType: 'demo', cloneDir: 'clone', sourceDocRoot: './docs' }
const work = (langs: string[]) => [{ file: 'docs/guide.md', langs }]

let translateFiles: typeof import('../tools/pipeline/translate.mjs').translateFiles
let FatalApiError: typeof import('../tools/pipeline/utils/llm-retry.mjs').FatalApiError
const originalCwd = process.cwd()
let dir: string

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'translate-files-'))
  mkdirSync(join(dir, 'clone/docs'), { recursive: true })
  writeFileSync(join(dir, 'clone/docs/guide.md'), SOURCE)
  process.chdir(dir)
  ;({ translateFiles } = await import('../tools/pipeline/translate.mjs'))
  ;({ FatalApiError } = await import('../tools/pipeline/utils/llm-retry.mjs'))
})

afterAll(() => {
  process.chdir(originalCwd)
  rmSync(dir, { recursive: true, force: true })
})

beforeEach(() => {
  generateContent.mockReset()
  rmSync(join(dir, 'docs'), { recursive: true, force: true })
})

describe('translateFiles', () => {
  it('asks again after an incomplete translation and writes the complete one', async () => {
    generateContent.mockResolvedValueOnce(reply(SUMMARY)).mockResolvedValue(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['zh-Hans']))

    expect(generateContent).toHaveBeenCalledTimes(2)
    expect(pending).toEqual({})
    expect(translatedPaths).toHaveLength(1)
    expect(readFileSync(join(dir, 'docs/demo/guide.md'), 'utf8')).toContain('正文 4。')
  })

  it('keeps the current translation when no complete one arrives, and leaves it pending', async () => {
    mkdirSync(join(dir, 'docs/ja/demo'), { recursive: true })
    writeFileSync(join(dir, 'docs/ja/demo/guide.md'), 'previous translation')
    generateContent.mockResolvedValue(reply(SUMMARY))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['ja']))

    expect(generateContent).toHaveBeenCalledTimes(3)
    expect(translatedPaths).toEqual([])
    expect(pending['docs/guide.md'].langs).toEqual(['ja'])
    expect(pending['docs/guide.md'].reason).toMatch(/^incomplete translation: headings 0\/4/)
    expect(readFileSync(join(dir, 'docs/ja/demo/guide.md'), 'utf8')).toBe('previous translation')
  })

  it('translates the other languages when one of them fails', async () => {
    generateContent.mockImplementation(async ({ contents }: { contents: string }) => {
      if (contents.includes('Korean')) throw apiError(400, 'Request contains an invalid argument.')
      return reply(COMPLETE)
    })

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['zh-Hans', 'ko', 'ja']))

    expect(translatedPaths).toHaveLength(2)
    expect(pending).toEqual({ 'docs/guide.md': { langs: ['ko'], reason: 'Request contains an invalid argument.' } })
  })

  it('does not retry an output cut off at the token limit', async () => {
    generateContent.mockResolvedValue(reply(COMPLETE.slice(0, 40), 'MAX_TOKENS'))

    const { pending } = await translateFiles(repoConfig, work(['zh-Hans']))

    expect(generateContent).toHaveBeenCalledTimes(1)
    expect(pending['docs/guide.md'].reason).toMatch(/token limit/)
  })

  it('stops the run when the API key is rejected', async () => {
    generateContent.mockRejectedValue(apiError(400, 'API key not valid. Please pass a valid API key.'))

    await expect(translateFiles(repoConfig, work(['zh-Hans', 'ja']))).rejects.toBeInstanceOf(FatalApiError)
  })


  it('skips a source removed upstream instead of queueing it again', async () => {
    const { pending } = await translateFiles(repoConfig, [{ file: 'docs/gone.md', langs: ['ja'] }])

    expect(generateContent).not.toHaveBeenCalled()
    expect(pending).toEqual({})
    expect(existsSync(join(dir, 'docs/ja/demo/gone.md'))).toBe(false)
  })
})

// The page check stands in for utils/page-check.mjs (the site's own one is
// covered in page-check.test.ts): the page fails while it has an unclosed <div>.
describe('translateFiles, checking that pages build', () => {
  const UNCLOSED = `${COMPLETE}\n<div class="note">\n`
  const checked: string[] = []
  const pageCheck = async (relativePath: string, content: string) => {
    checked.push(relativePath)
    return content.includes('<div class="note">') ? ['Vue: Element is missing end tag.'] : []
  }

  beforeEach(() => {
    checked.length = 0
  })

  it('asks again when the translation would not build, then writes one that does', async () => {
    generateContent.mockResolvedValueOnce(reply(UNCLOSED)).mockResolvedValue(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['ja']), { pageCheck })

    expect(generateContent).toHaveBeenCalledTimes(2)
    expect(pending).toEqual({})
    expect(translatedPaths).toHaveLength(1)
    expect(checked).toEqual(['ja/demo/guide.md', 'ja/demo/guide.md'])
  })

  it('keeps the current translation when no answer builds, and says why', async () => {
    mkdirSync(join(dir, 'docs/ja/demo'), { recursive: true })
    writeFileSync(join(dir, 'docs/ja/demo/guide.md'), 'previous translation')
    generateContent.mockResolvedValue(reply(UNCLOSED))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['ja']), { pageCheck })

    expect(generateContent).toHaveBeenCalledTimes(3)
    expect(translatedPaths).toEqual([])
    expect(pending['docs/guide.md']).toEqual({ langs: ['ja'], reason: 'does not build: Vue: Element is missing end tag.' })
    expect(readFileSync(join(dir, 'docs/ja/demo/guide.md'), 'utf8')).toBe('previous translation')
  })

  // Five upstream sources would not build as they are (a bare `<maker>`, a
  // doubled attribute, ...) while their translations, mended by the model, do.
  it('checks the translation, not a source that would not build itself', async () => {
    writeFileSync(join(dir, 'clone/docs/broken.md'), `${SOURCE}\n<div class="note">\n`)
    generateContent.mockResolvedValue(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, [{ file: 'docs/broken.md', langs: ['ja'] }], { pageCheck })

    expect(translatedPaths).toHaveLength(1)
    expect(pending).toEqual({})
  })
})
