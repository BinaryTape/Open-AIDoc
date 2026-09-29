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

  // One weak signal alone is too noisy: a translation may legitimately merge
  // paragraphs or drop a duplicated link.
  return strong.length > 0 || weak.length > 1 ? [...strong, ...weak] : []
}

function count(text, pattern) {
  return (text.match(pattern) ?? []).length
}
