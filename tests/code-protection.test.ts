import { describe, expect, it } from 'vitest'
import { assertCodeBlocksUnchanged, protectCodeBlocks } from '../tools/pipeline/utils/code-protection.mjs'
import { cleanupTranslation, finishDocumentTranslation } from '../tools/pipeline/translate.mjs'

const fence = String.fromCharCode(96).repeat(3)
const code = [
  fence + 'kotlin',
  'val newline = ' + JSON.stringify('\n'),
  'val literal = ' + JSON.stringify('\\n'),
  'val tab = ' + JSON.stringify('\t'),
  'val quote = ' + JSON.stringify('"'),
  'val path = ' + JSON.stringify('C:\\temp\\data.txt'),
  '',
  '',
  '// Preserve meaningful blank lines and $ substitution patterns.',
  'println("$& $1")',
  fence,
].join('\n')
const source = '# English\n\n' + code + '\n\nEnd.'
const translated = source.replace('# English', '# 中文').replace('End.', '结束。')

describe('code protection', () => {
  it('sends only placeholders and restores original code bytes', () => {
    const protection = protectCodeBlocks(source)
    expect(protection.content).not.toContain('val newline')
    expect(protection.content).not.toContain('C:\\\\temp')
    expect(protection.restore(protection.content.replace('# English', '# 中文').replace('End.', '结束。')))
      .toBe(translated)
  })

  it.each([
    ['four-backtick fence', fence + String.fromCharCode(96) + 'markdown\n' + fence + 'kotlin\nx\n' + fence + '\n' + fence + String.fromCharCode(96)],
    ['tilde fence', '~~~kotlin\nval x = "\\n"\n~~~'],
    ['indented code', '    val x = "\\n"\n    println(x)\n'],
    ['list', '- Item\n\n  ' + fence + 'kotlin\n  val x = "\\n"\n  ' + fence + '\n'],
    ['blockquote', '> ' + fence + 'kotlin\n> val x = "\\n"\n> ' + fence + '\n'],
    ['CRLF', code.replaceAll('\n', '\r\n') + '\r\n'],
    ['no final newline', code],
    ['trailing spaces', '    println("x")  '],
  ])('preserves %s without re-rendering it', (_, sample) => {
    const protection = protectCodeBlocks(sample)
    expect(protection.content).not.toBe(sample)
    expect(protection.restore(protection.content)).toBe(sample)
  })

  const twoBlocks = source + '\n\n~~~json\n{"a":1}\n~~~\n'
  it.each(['missing', 'duplicated', 'reordered', 'unknown', 'modified', 'inline', 'invented code'])(
    'rejects %s placeholders or output', (kind) => {
      const protection = protectCodeBlocks(twoBlocks)
      const markers = protection.content.match(/<!--OPENAIDOC_CODE_BLOCK_[a-f0-9]+_\d+-->/g)!
      let output = protection.content
      if (kind === 'missing') output = output.replace(markers[0], '')
      if (kind === 'duplicated') output += '\n' + markers[0]
      if (kind === 'reordered') output = output.replace(markers[0], 'TEMP').replace(markers[1], markers[0]).replace('TEMP', markers[1])
      if (kind === 'unknown') output += '\n' + markers[0].replace('_0-->', '_99-->')
      if (kind === 'modified') output = output.replace(markers[0], markers[0].replace('BLOCK', 'CHANGED'))
      if (kind === 'inline') output = output.replace(markers[0], 'prose ' + markers[0])
      if (kind === 'invented code') output += '\n\n' + fence + 'kotlin\nval invented = 1\n' + fence
      expect(() => protection.restore(output)).toThrow(/code protection:/)
    }
  )

  it('detects code changed after restoration, even when block counts match', () => {
    expect(() => assertCodeBlocksUnchanged(source, source.replace('val newline', 'val renamed')))
      .toThrow(/code blocks changed/)
  })

  it('rejects code invented for a source with no code', () => {
    expect(() => protectCodeBlocks('# Heading\n\nProse.').restore('# 标题\n\n' + code))
      .toThrow(/model added code blocks/)
  })
})

describe('translation cleanup and completion', () => {
  it('never decodes escapes in single-line text or inline code', () => {
    const text = 'Use ' + JSON.stringify('\n') + ' and ' + JSON.stringify('\\n') + ' in inline code.'
    expect(cleanupTranslation(text, text)).toBe(text)
    const inline = String.fromCharCode(96) + 'joinToString("\\n")' + String.fromCharCode(96)
    expect(cleanupTranslation(inline, inline)).toBe(inline)
  })

  it('keeps JSON escaping valid without guessing whether it is double encoded', () => {
    const json = JSON.stringify({ newline: '\n', literal: '\\n', path: 'C:\\temp\\data.txt', quote: '"' })
    expect(cleanupTranslation(json, json)).toBe(json)
    expect(JSON.parse(cleanupTranslation(json, json))).toEqual(JSON.parse(json))
  })

  it('cleans prose while keeping escapes and blank lines inside code untouched', () => {
    expect(cleanupTranslation(translated, source)).toBe(translated)
    expect(cleanupTranslation(translated.replace('# 中文\n\n', '# 中文\n\n\n\n'), source)).toBe(translated)
  })

  it('restores code after removing a model wrapper and cleaning prose', () => {
    const protection = protectCodeBlocks(source)
    const answer = fence + 'markdown\n' + protection.content.replace('# English', '# 中文') + '\n' + fence
    expect(finishDocumentTranslation(answer, protection)).toBe(source.replace('# English', '# 中文'))
  })

  it('retains whitespace in code at the document edges', () => {
    const sample = '    val x = "\\n"\n\n    println(x)  \n'
    expect(cleanupTranslation(sample, sample)).toBe(sample)
  })
})

describe('MkDocs container code protection', () => {
  it('keeps nested tab and admonition prose translatable while protecting their code', () => {
    const sample = [
      '=== "Provider"', '', '    Provider instructions.', '',
      '    === "Platform"', '', '        Platform instructions.', '',
      '        ' + fence + 'kotlin', '        println("\\n")', '        ' + fence, '', '        Continue here.',
      '', '!!! note', '', '    Note prose.', '', '    ~~~kotlin', '    println("\\t")', '    ~~~', '', '    Note followup.',
    ].join('\n')
    const protection = protectCodeBlocks(sample)
    expect(protection.content).toContain('Provider instructions.')
    expect(protection.content).toContain('Platform instructions.')
    expect(protection.content).toContain('Note prose.')
    expect(protection.content).toContain('Continue here.')
    expect(protection.content).toContain('Note followup.')
    expect(protection.content).not.toContain('println(')
    expect(protection.restore(protection.content)).toBe(sample)
  })
})
