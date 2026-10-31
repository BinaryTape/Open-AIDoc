import { randomUUID } from 'node:crypto'
import MarkdownIt from 'markdown-it'
import { TranslationRejected } from './llm-retry.mjs'

const markdown = new MarkdownIt({ html: true })

// MkDocs tabs/admonitions indent their prose as well as their code. Parse the
// bodies at their logical indentation, keeping source-map line numbers intact,
// rather than treating the entire body (including translatable prose) as code.
markdown.block.ruler.before('code', 'documentation_container', (state, start, end, silent) => {
  if (state.sCount[start] - state.blkIndent >= 4) return false
  const line = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start])
  if (!/^(?:===\s+"[^"]+"\s*$|(?:!!!|\?\?\?)\+?(?:\s|$))/.test(line)) return false
  if (silent) return true
  const indent = state.sCount[start] + 4
  let next = start + 1
  while (next < end && (state.isEmpty(next) || state.sCount[next] >= indent)) next++
  const previousIndent = state.blkIndent
  const previousParent = state.parentType
  state.blkIndent = indent
  state.parentType = 'container'
  state.md.block.tokenize(state, start + 1, next)
  state.blkIndent = previousIndent
  state.parentType = previousParent
  state.line = next
  return true
}, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })

const PLACEHOLDER = /<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/g

/** Original source slices, including fences, indentation and line endings. */
function codeBlocks(source) {
  const offsets = [0]
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') offsets.push(i + 1)
  }
  return markdown.parse(source, {})
    .filter((token) => token.type === 'fence' || token.type === 'code_block')
    .map((token) => {
      const start = offsets[token.map[0]]
      const end = offsets[token.map[1]] ?? source.length
      const raw = source.slice(start, end)
      const firstLine = raw.split('\n', 1)[0]
      const prefix = token.type === 'fence'
        ? firstLine.slice(0, firstLine.indexOf(token.markup))
        : firstLine.match(/^[\t ]*/)[0]
      return { start, end, raw, prefix }
    })
}

/** Fail before writing if any code block was added, removed, reordered or changed. */
export function assertCodeBlocksUnchanged(source, translated) {
  const before = codeBlocks(source)
  const after = codeBlocks(translated)
  if (before.length !== after.length ||
      before.some((block, i) => block.raw !== after[i].raw)) {
    throw new TranslationRejected('code protection: code blocks changed')
  }
}

/**
 * Keep CommonMark fenced and indented code out of model requests. MarkdownIt's
 * source maps also cover code nested in lists and blockquotes; raw source
 * slices preserve syntax that a renderer would otherwise normalize.
 */
export function protectCodeBlocks(source) {
  const blocks = codeBlocks(source)
  let namespace
  do {
    namespace = 'OPENAIDOC_CODE_BLOCK_' + randomUUID().replaceAll('-', '') + '_'
  } while (source.includes(namespace))

  let cursor = 0
  let content = ''
  for (const [i, block] of blocks.entries()) {
    block.placeholder = '<!--' + namespace + i + '-->'
    content += source.slice(cursor, block.start) + block.prefix + block.placeholder +
      (block.raw.endsWith('\n') ? '\n' : '')
    cursor = block.end
  }
  content += source.slice(cursor)

  return {
    content,
    instructions: blocks.length === 0 ? '' :
      'Code blocks are protected as HTML comments beginning OPENAIDOC_CODE_BLOCK_. ' +
      'Copy each comment unchanged, keeping its indentation and list/quote prefix, exactly once and in its original order. ' +
      'Translate only the surrounding prose. Do not add code blocks.\n\n',
    restore(translated) {
      const found = [...translated.matchAll(PLACEHOLDER)].map((match) => match[0])
      const expected = blocks.map((block) => block.placeholder)
      // Existing marker-like prose is not part of this request's placeholders.
      const originalMarkers = new Set(source.match(PLACEHOLDER) ?? [])
      const markers = found.filter((marker) => !originalMarkers.has(marker))
      if (markers.length !== expected.length ||
          markers.some((marker, i) => marker !== expected[i])) {
        throw new TranslationRejected('code protection: missing, duplicated, reordered or unknown placeholder')
      }
      if (codeBlocks(translated).some((block) => block.raw.replace(PLACEHOLDER, '').trim())) {
        throw new TranslationRejected('code protection: model added code blocks')
      }

      let restored = translated
      for (const block of blocks) {
        // Restore the whole marker line, including its structural prefix.
        const position = restored.indexOf(block.placeholder)
        const start = restored.lastIndexOf('\n', position - 1) + 1
        const newline = restored.indexOf('\n', position)
        const end = newline === -1 ? restored.length : newline + 1
        const line = restored.slice(start, end).replace(/[\t \r\n]+$/, '')
        if (line !== block.prefix + block.placeholder) {
          throw new TranslationRejected('code protection: placeholder line or container prefix changed')
        }
        restored = restored.slice(0, start) + block.raw + restored.slice(end)
      }
      assertCodeBlocksUnchanged(source, restored)
      return restored
    },
  }
}
