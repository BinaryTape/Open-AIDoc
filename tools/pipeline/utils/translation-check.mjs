/**
 * Structural check of a translation against its source.
 *
 * Models occasionally return something other than a full translation: a
 * summary of the page, a page cut short, or a made-up "this page has moved"
 * stub. Wording changes in translation, structure does not — headings, code
 * blocks and links survive it — so a translation that lost a good share of
 * them is rejected. Thresholds leave room for legitimate differences (a merged
 * paragraph, a reworded link) and only flag losses a reader would notice.
 */

const FENCE_LINE = /^\s*(```|~~~)/

/**
 * Count structural elements, in both Markdown and Writerside XML form.
 * @returns {{headings: number, codeBlocks: number, links: number, paragraphs: number, fenceLines: number}}
 */
export function structureOf(text) {
  let headings = 0
  let fenceLines = 0
  let inFence = false
  const prose = []

  for (const line of text.split('\n')) {
    if (FENCE_LINE.test(line)) {
      fenceLines++
      inFence = !inFence
      prose.push('')
      continue
    }
    if (inFence) continue
    if (/^\s{0,3}#{2,6}\s/.test(line)) headings++
    prose.push(line)
  }

  const body = prose.join('\n')
  return {
    headings: headings + count(body, /<chapter\b/g),
    codeBlocks: Math.floor(fenceLines / 2) + count(body, /<code-block\b/g),
    links: count(body, /\]\(/g) + count(body, /\bhref=/g),
    paragraphs: body.split(/\n\s*\n/).filter((block) => block.trim()).length,
    fenceLines,
  }
}

/**
 * @param {string} translated
 * @param {string} source
 * @returns {string[]} Problems found; empty when the translation looks complete
 */
export function checkTranslation(translated, source) {
  const src = structureOf(source)
  const out = structureOf(translated)
  const strong = []
  const weak = []

  if (out.fenceLines % 2 !== 0 && src.fenceLines % 2 === 0) {
    strong.push('unclosed code block')
  }
  if (src.headings >= 3 && out.headings <= 0.7 * src.headings && src.headings - out.headings >= 2) {
    strong.push(`headings ${out.headings}/${src.headings}`)
  }
  if (src.codeBlocks >= 2 && out.codeBlocks <= 0.7 * src.codeBlocks && src.codeBlocks - out.codeBlocks >= 2) {
    strong.push(`code blocks ${out.codeBlocks}/${src.codeBlocks}`)
  }
  if (src.links >= 6 && out.links <= 0.6 * src.links && src.links - out.links >= 4) {
    weak.push(`links ${out.links}/${src.links}`)
  }
  if (src.paragraphs >= 12 && out.paragraphs <= 0.5 * src.paragraphs) {
    weak.push(`paragraphs ${out.paragraphs}/${src.paragraphs}`)
  }
  const leftovers = undefinedLeftovers(translated, source)
  if (leftovers > 0) {
    strong.push(`"undefined" ${leftovers}`)
  }

  // One weak signal alone is too noisy: a translation may legitimately merge
  // paragraphs or drop a duplicated link.
  return strong.length > 0 || weak.length > 1 ? [...strong, ...weak] : []
}

// Where the pipeline once wrote "undefined" for content it could not find
// (fixed in #70): an include, a link summary, the text of an empty link.
const UNDEFINED_LEFTOVERS = [
  /^[ \t]*undefined[ \t]*$/gm,
  /\bsummary="undefined"/g,
  /\[undefined\]\(/g,
]

/**
 * How many more "undefined" placeholders the translation has than its
 * source, outside code blocks. A page holding the word itself is fine.
 */
export function undefinedLeftovers(translated, source) {
  const placeholders = (text) => {
    const prose = proseOf(text)
    return UNDEFINED_LEFTOVERS.reduce((sum, pattern) => sum + count(prose, pattern), 0)
  }
  return Math.max(0, placeholders(translated) - placeholders(source))
}

/** The text outside fenced code blocks. */
function proseOf(text) {
  let inFence = false
  return text.split('\n').filter((line) => {
    if (FENCE_LINE.test(line)) {
      inFence = !inFence
      return false
    }
    return !inFence
  }).join('\n')
}

function count(text, pattern) {
  return (text.match(pattern) ?? []).length
}
