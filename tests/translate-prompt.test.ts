import { describe, expect, it } from 'vitest'
import { fillPromptTemplate, getLocalePromptTemplate, getPromptTemplate } from '../tools/pipeline/translate.mjs'

describe('fillPromptTemplate', () => {
  it('preserves `$` in source markdown instead of applying replace substitutions', () => {
    const template = [
      'PREFIX',
      '{RELEVANT_TERMS}',
      '{SOURCE_TEXT}',
      'SUFFIX',
    ].join('\n')
    const sourceText = [
      '**Multidollar interpolation: improved handling of `$` in string literals**',
      '',
      'Use `$$` to escape a dollar sign.',
    ].join('\n')

    const filled = fillPromptTemplate(template, 'zh-Hans', sourceText, '$term')

    expect(filled).toContain(sourceText)
    expect(filled.startsWith('PREFIX\n$term\n')).toBe(true)
    expect(filled.endsWith('\nSUFFIX')).toBe(true)
    expect(filled).not.toContain('{SOURCE_TEXT}')
  })
})

describe('prompt templates', () => {
  it('no longer ask for reference translations', () => {
    for (const lang of ['zh-Hans', 'zh-Hant', 'ja', 'ko']) {
      expect(getPromptTemplate(lang, lang)).not.toContain('{TRANSLATION_REFERENCES}')
    }
    expect(getLocalePromptTemplate('日本語')).not.toContain('{TRANSLATION_REFERENCES}')
  })

  it('names the target language instead of an unexpanded placeholder', () => {
    expect(getPromptTemplate('zh-Hans', '简体中文')).not.toContain('${langDisplayName}')
  })
})
