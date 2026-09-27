/**
 * Retry policy for translation calls.
 *
 * Failures are told apart by what another attempt can achieve:
 *
 *  - transient (rate limits, 5xx, network, timeouts): wait with exponential
 *    backoff, since the quota or the service needs time to recover;
 *  - rejected output (a translation that fails the structural check, a
 *    blocked response): ask again straight away, a new sample may be fine;
 *  - credentials (bad key, no permission): stop the whole run, every other
 *    call would fail the same way;
 *  - anything else: give up on this unit without retrying.
 */

/** A response arrived but is not usable as a translation. */
export class TranslationRejected extends Error {
  constructor(message) {
    super(message)
    this.name = 'TranslationRejected'
  }
}

/** Every call will fail the same way; the run should stop. */
export class FatalApiError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'FatalApiError'
  }
}

const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504])
const NETWORK_ERROR = /fetch failed|network|socket|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|UND_ERR/i
const MAX_BACKOFF_MS = 5 * 60 * 1000

/**
 * @returns {'transient' | 'rejected' | 'fatal' | 'permanent'}
 */
export function classifyError(error) {
  if (error instanceof TranslationRejected) return 'rejected'
  const status = error?.status
  const message = `${error?.message ?? ''} ${error?.cause?.code ?? ''} ${error?.cause?.message ?? ''}`
  // Gemini reports an invalid key as 400 INVALID_ARGUMENT, not 401.
  if (status === 401 || status === 403 || /API[_ ]?key/i.test(message)) return 'fatal'
  if (TRANSIENT_STATUS.has(status)) return 'transient'
  if (status === undefined && (['AbortError', 'TimeoutError'].includes(error?.name) || NETWORK_ERROR.test(message))) {
    return 'transient'
  }
  return 'permanent'
}

/** Server-suggested wait from a 429 body (`"retryDelay": "37s"`), in ms. */
export function suggestedDelayMs(error) {
  const match = String(error?.message ?? '').match(/retryDelay"?\s*:\s*"(\d+(?:\.\d+)?)s"/)
  return match ? Math.ceil(Number(match[1]) * 1000) : null
}

/**
 * Run `fn`, retrying according to the policy above.
 * @param {() => Promise<T>} fn
 * @param {object} options
 * @param {string} options.label - Shown in logs, e.g. `docs/x.md → ja`
 * @param {number} [options.maxAttempts] - Attempts in total, for transient failures
 * @param {number} [options.maxRejections] - Attempts in total, for rejected output
 * @param {number} [options.baseDelayMs] - First backoff delay
 * @param {(ms: number) => Promise<void>} [options.sleep]
 * @returns {Promise<T>}
 * @template T
 */
export async function withRetry(fn, {
  label,
  maxAttempts = 5,
  maxRejections = 3,
  baseDelayMs = 30_000,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  let rejections = 0
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const kind = classifyError(error)
      if (kind === 'fatal') throw new FatalApiError(`${label}: ${error.message}`, { cause: error })
      if (kind === 'permanent' || attempt >= maxAttempts) throw error
      if (kind === 'rejected' && ++rejections >= maxRejections) throw error

      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), MAX_BACKOFF_MS) * (0.75 + Math.random() * 0.5)
      const delay = kind === 'rejected' ? 0 : Math.max(backoff, suggestedDelayMs(error) ?? 0)
      console.warn(`  ↻ ${label}: attempt ${attempt} failed (${error.message})` +
        (delay ? `, retrying in ${Math.round(delay / 1000)}s` : ', retrying'))
      await sleep(delay)
    }
  }
}
