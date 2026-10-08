/**
 * Models sometimes return the whole translated document inside one fenced
 * block — ```markdown, but also ```xml for Writerside topics or ```json for
 * locale files. Left in place, the page renders as a single code block.
 *
 * The wrapper is recognised by comparison with the source: it is made of the
 * fence lines the translation has and the source does not. A document that
 * genuinely starts or ends with a code block has those fences in its source
 * too, so it is left alone.
 */

const FENCE_LINE = /^\s*(```|~~~)/
const OPENING_WRAPPER = /^```([\w-]*)\s*$/
const CLOSING_WRAPPER = /^```\s*$/
// Languages a whole document can be wrapped as, as opposed to a code sample.
const DOCUMENT_LANGUAGES = new Set(['markdown', 'md', 'xml', 'html'])

export function countFenceLines(text) {
  return text.split('\n').filter((line) => FENCE_LINE.test(line)).length
}

/**
 * Remove the fence lines that wrap a translation but have no counterpart in
 * its source.
 */
export function stripWrapperFence(translated, source) {
  const lines = translated.trim().split('\n')
  let extra = countFenceLines(translated) - countFenceLines(source)

  if (extra > 0 && OPENING_WRAPPER.test(lines[0])) {
    lines.shift()
    extra--
  }
  if (extra > 0 && lines.length > 0 && CLOSING_WRAPPER.test(lines[lines.length - 1])) {
    lines.pop()
  }
  return lines.join('\n')
}

/**
 * Repair a document translated before wrappers were recognised: the cleanup
 * of the time dropped a trailing fence but kept a ```xml or ```html opener,
 * leaving the whole page inside one unclosed code block.
 *
 * @param {string} translated
 * @param {string | null} source - Upstream source, when one can be paired
 * @returns {{content: string, changed: boolean}}
 */
export function repairUnclosedWrapper(translated, source = null) {
  const unchanged = { content: translated, changed: false }
  const lines = translated.split('\n')
  const first = lines.findIndex((line) => line.trim() !== '')
  const opener = first === -1 ? null : lines[first].match(OPENING_WRAPPER)

  if (!opener || !DOCUMENT_LANGUAGES.has(opener[1])) return unchanged
  // Balanced fences mean the opener is closed somewhere: a real code block.
  if (countFenceLines(translated) % 2 === 0) return unchanged
  if (source !== null && FENCE_LINE.test(source.trimStart())) return unchanged

  return { content: lines.slice(first + 1).join('\n').trimStart(), changed: true }
}

/**
 * Repair a document translated before wrappers were recognised that ends
 * with a code block: the cleanup of the time took its closing fence for the
 * end of a wrapper and dropped it.
 *
 * @param {string} translated
 * @param {string} source - Upstream source
 * @returns {{content: string, changed: boolean}}
 */
export function restoreTrailingFence(translated, source) {
  const unchanged = { content: translated, changed: false }
  if (countFenceLines(translated) % 2 === 0 || countFenceLines(source) % 2 !== 0) return unchanged

  const lastLine = (text) => text.trimEnd().split('\n').pop()
  const closing = lastLine(source)
  if (!FENCE_LINE.test(closing) || FENCE_LINE.test(lastLine(translated))) return unchanged

  return { content: `${translated.trimEnd()}\n${closing.trimEnd()}\n`, changed: true }
}
