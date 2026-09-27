import { describe, expect, it, vi } from 'vitest'
import {
  FatalApiError,
  TranslationRejected,
  classifyError,
  suggestedDelayMs,
  withRetry,
} from '../tools/pipeline/utils/llm-retry.mjs'

const apiError = (status: number, message = `HTTP ${status}`) => Object.assign(new Error(message), { status })

describe('classifyError', () => {
  it('tells failures apart by what a retry can achieve', () => {
    expect(classifyError(apiError(429))).toBe('transient')
    expect(classifyError(apiError(503))).toBe('transient')
    expect(classifyError(new TypeError('fetch failed'))).toBe('transient')
    expect(classifyError(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe('transient')
    expect(classifyError(new TranslationRejected('incomplete'))).toBe('rejected')
    expect(classifyError(apiError(401))).toBe('fatal')
    expect(classifyError(apiError(400, 'API key not valid. Please pass a valid API key.'))).toBe('fatal')
    expect(classifyError(apiError(400, 'Request payload size exceeds the limit'))).toBe('permanent')
    expect(classifyError(new Error('output cut off'))).toBe('permanent')
  })

  it('reads the wait a rate limit response suggests', () => {
    expect(suggestedDelayMs(apiError(429, '{"@type":"RetryInfo","retryDelay":"37s"}'))).toBe(37_000)
    expect(suggestedDelayMs(apiError(429))).toBeNull()
  })
})

describe('withRetry', () => {
  const noSleep = vi.fn(async () => {})

  it('backs off on transient failures, then succeeds', async () => {
    const sleep = vi.fn(async () => {})
    const fn = vi.fn().mockRejectedValueOnce(apiError(429)).mockRejectedValueOnce(apiError(503)).mockResolvedValue('ok')
    await expect(withRetry(fn, { label: 't', sleep, baseDelayMs: 1000 })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
    const [first, second] = sleep.mock.calls.map(([ms]) => ms)
    expect(first).toBeGreaterThanOrEqual(750)
    expect(second).toBeGreaterThanOrEqual(1500)
  })

  it('asks again right away when the output is rejected, up to the rejection limit', async () => {
    const fn = vi.fn().mockRejectedValue(new TranslationRejected('incomplete translation'))
    await expect(withRetry(fn, { label: 't', sleep: noSleep, maxRejections: 3 })).rejects.toThrow('incomplete translation')
    expect(fn).toHaveBeenCalledTimes(3)
    expect(noSleep).toHaveBeenCalledWith(0)
  })

  it('does not retry a permanent failure', async () => {
    const fn = vi.fn().mockRejectedValue(apiError(400, 'bad request'))
    await expect(withRetry(fn, { label: 't', sleep: noSleep })).rejects.toThrow('bad request')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('stops the run on a credentials problem', async () => {
    const fn = vi.fn().mockRejectedValue(apiError(403, 'permission denied'))
    await expect(withRetry(fn, { label: 't', sleep: noSleep })).rejects.toBeInstanceOf(FatalApiError)
  })
})
