import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'

const generateContent = vi.hoisted(() => vi.fn())
vi.mock('@google/genai', () => ({
  GoogleGenAI: class { models = { generateContent } },
}))
const fence = String.fromCharCode(96).repeat(3)
const code = [fence + 'kotlin', 'println("\\n")', '', '', 'println("\\\\n")', fence].join('\n')
const source = '# English\n\n' + code + '\n\nEnd.'
let server: Server
let base: string

async function post(route: string, body: object) {
  return fetch(base + route, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
}

beforeAll(async () => {
  const { app } = await import('../translate-tool/server.mjs')
  server = await new Promise<Server>((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
  })
  base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port
})
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})
beforeEach(async () => {
  generateContent.mockReset()
  await fetch(base + '/api/queue', { method: 'DELETE' })
})

const request = { sourceContent: source, targetLang: 'zh-Hans', useTerminology: false, apiKey: 'test-key' }
const faithful = ({ contents }: { contents: string }) => {
  expect(contents).not.toContain('println(')
  const marker = contents.match(/<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/)![0]
  return { text: '# 中文\n\n' + marker + '\n\n结束。' }
}

describe('local translation endpoints', () => {
  it('protects and restores code in a single translation', async () => {
    generateContent.mockImplementation(faithful)
    const response = await post('/api/translate', request)
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ success: true, content: '# 中文\n\n' + code + '\n\n结束。' })
  })

  it('rejects a single response that dropped a placeholder', async () => {
    generateContent.mockResolvedValue({ text: '# 中文\n\nOnly prose.' })
    const response = await post('/api/translate', request)
    expect(response.status).toBe(500)
    expect(await response.json()).toMatchObject({ success: false, error: expect.stringMatching(/code protection:/) })
  })

  it.each([true, false])('protects queued code and reports failures (faithful=%s)', async (valid) => {
    generateContent.mockImplementation(valid ? faithful : () => ({ text: '# 中文\n\nOnly prose.' }))
    const added = await post('/api/queue/add', { ...request, fileName: 'guide.md' })
    const { id } = await added.json()
    await post('/api/queue/process', { apiKey: 'test-key' })
    let item: any
    await vi.waitFor(async () => {
      item = await (await fetch(base + '/api/queue/' + id)).json()
      expect(['completed', 'error']).toContain(item.status)
    })
    if (valid) {
      expect(item.status).toBe('completed')
      expect(item.result).toBe('# 中文\n\n' + code + '\n\n结束。')
    } else {
      expect(item.status).toBe('error')
      expect(item.result).toBeNull()
      expect(item.error).toMatch(/code protection:/)
    }
  })
})
