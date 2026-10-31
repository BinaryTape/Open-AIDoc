import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { protectCodeBlocks } from '../tools/pipeline/utils/code-protection.mjs'

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

// A faithful model copies request placeholders instead of receiving the code.
const reply = (text: string, finishReason = 'STOP') => ({ contents }: { contents: string }) => {
  const markers = contents.match(/<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/g) ?? []
  let i = 0
  const masked = protectCodeBlocks(text).content.replace(/<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/g,
    (marker) => markers[i++] ?? marker)
  return { text: masked, candidates: [{ finishReason }] }
}
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
    generateContent.mockImplementationOnce(reply(SUMMARY)).mockImplementation(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['zh-Hans']))

    expect(generateContent).toHaveBeenCalledTimes(2)
    expect(pending).toEqual({})
    expect(translatedPaths).toHaveLength(1)
    expect(readFileSync(join(dir, 'docs/demo/guide.md'), 'utf8')).toContain('正文 4。')
  })

  it('keeps the current translation when no complete one arrives, and leaves it pending', async () => {
    mkdirSync(join(dir, 'docs/ja/demo'), { recursive: true })
    writeFileSync(join(dir, 'docs/ja/demo/guide.md'), 'previous translation')
    generateContent.mockImplementation(reply(SUMMARY))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['ja']))

    expect(generateContent).toHaveBeenCalledTimes(3)
    expect(translatedPaths).toEqual([])
    expect(pending['docs/guide.md'].langs).toEqual(['ja'])
    expect(pending['docs/guide.md'].reason).toMatch(/^code protection:/)
    expect(readFileSync(join(dir, 'docs/ja/demo/guide.md'), 'utf8')).toBe('previous translation')
  })

  it('translates the other languages when one of them fails', async () => {
    generateContent.mockImplementation(async (request: { contents: string }) => {
      const { contents } = request
      if (contents.includes('Korean')) throw apiError(400, 'Request contains an invalid argument.')
      return reply(COMPLETE)(request)
    })

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['zh-Hans', 'ko', 'ja']))

    expect(translatedPaths).toHaveLength(2)
    expect(pending).toEqual({ 'docs/guide.md': { langs: ['ko'], reason: 'Request contains an invalid argument.' } })
  })

  it('does not retry an output cut off at the token limit', async () => {
    generateContent.mockImplementation(reply(COMPLETE.slice(0, 40), 'MAX_TOKENS'))

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
    generateContent.mockImplementationOnce(reply(UNCLOSED)).mockImplementation(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, work(['ja']), { pageCheck })

    expect(generateContent).toHaveBeenCalledTimes(2)
    expect(pending).toEqual({})
    expect(translatedPaths).toHaveLength(1)
    expect(checked).toEqual(['ja/demo/guide.md', 'ja/demo/guide.md'])
  })

  it('keeps the current translation when no answer builds, and says why', async () => {
    mkdirSync(join(dir, 'docs/ja/demo'), { recursive: true })
    writeFileSync(join(dir, 'docs/ja/demo/guide.md'), 'previous translation')
    generateContent.mockImplementation(reply(UNCLOSED))

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
    generateContent.mockImplementation(reply(COMPLETE))

    const { translatedPaths, pending } = await translateFiles(repoConfig, [{ file: 'docs/broken.md', langs: ['ja'] }], { pageCheck })

    expect(translatedPaths).toHaveLength(1)
    expect(pending).toEqual({})
  })
})

describe('translateFiles, code escapes', () => {
  it('keeps source escapes and code whitespace in the written translation', async () => {
    const fence = String.fromCharCode(96).repeat(3)
    const code = [
      fence + 'kotlin', 'val newline = "\\n"', 'val literal = "\\\\n"',
      '', '', 'println("\\t")', fence,
    ].join('\n')
    const original = '# English\n\n' + code + '\n\nEnd.'
    writeFileSync(join(dir, 'clone/docs/escapes.md'), original)
    generateContent.mockImplementation(({ contents }: { contents: string }) => {
      expect(contents).not.toContain('val newline')
      const marker = contents.match(/<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/)![0]
      return { text: '# 中文\n\n' + marker + '\n\n结束。', candidates: [{ finishReason: 'STOP' }] }
    })

    const { translatedPaths, pending } = await translateFiles(repoConfig, [{ file: 'docs/escapes.md', langs: ['ja'] }], { pageCheck: null })
    expect(translatedPaths).toHaveLength(1)
    expect(pending).toEqual({})
    expect(readFileSync(join(dir, 'docs/ja/demo/escapes.md'), 'utf8')).toContain(code)
  })
})
