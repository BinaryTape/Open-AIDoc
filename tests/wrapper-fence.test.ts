import { describe, expect, it } from 'vitest'
import { repairUnclosedWrapper, stripWrapperFence } from '../tools/pipeline/utils/wrapper-fence.mjs'
import { cleanupTranslation } from '../tools/pipeline/translate.mjs'

const topicSource = ['<topic title="Frameworks">', '  <chapter title="Intro">', '    <p>Text</p>', '  </chapter>', '</topic>'].join('\n')

describe('stripWrapperFence', () => {
  it('removes an ```xml wrapper around a translated topic', () => {
    const translated = ['```xml', '<topic title="框架">', '  <p>文本</p>', '</topic>', '```'].join('\n')
    expect(stripWrapperFence(translated, topicSource)).toBe(['<topic title="框架">', '  <p>文本</p>', '</topic>'].join('\n'))
  })

  it('removes a ```markdown wrapper and keeps the code blocks inside', () => {
    const source = ['# Title', '', '```kotlin', 'val a = 1', '```', '', 'Done.'].join('\n')
    const translated = ['```markdown', '# 标题', '', '```kotlin', 'val a = 1', '```', '', '完成。', '```'].join('\n')
    expect(stripWrapperFence(translated, source)).toBe(['# 标题', '', '```kotlin', 'val a = 1', '```', '', '完成。'].join('\n'))
  })

  it('keeps a document that starts and ends with code blocks like its source', () => {
    const source = ['```kotlin', 'val a = 1', '```', '', 'Middle.', '', '```kotlin', 'val b = 2', '```'].join('\n')
    const translated = ['```kotlin', 'val a = 1', '```', '', '中间。', '', '```kotlin', 'val b = 2', '```'].join('\n')
    expect(stripWrapperFence(translated, source)).toBe(translated)
  })

  it('removes only the opener when the model left the wrapper unclosed', () => {
    const translated = ['```xml', '<topic title="框架">', '</topic>'].join('\n')
    expect(stripWrapperFence(translated, topicSource)).toBe(['<topic title="框架">', '</topic>'].join('\n'))
  })
})

describe('cleanupTranslation', () => {
  it('unwraps an ```xml wrapped topic', () => {
    const translated = ['```xml', '<topic title="框架">', '</topic>', '```'].join('\n')
    expect(cleanupTranslation(translated, topicSource)).toBe(['<topic title="框架">', '</topic>'].join('\n'))
  })

  it('keeps the closing fence of a document that ends with a code block', () => {
    const source = ['# Title', '', '```kotlin', 'val a = 1', '```'].join('\n')
    const translated = ['# 标题', '', '```kotlin', 'val a = 1', '```'].join('\n')
    expect(cleanupTranslation(translated, source)).toBe(translated)
  })

  it('unwraps a ```json locale file', () => {
    const source = '{\n  "koin.setup": "Setup"\n}'
    const translated = '```json\n{\n  "koin.setup": "配置"\n}\n```'
    expect(cleanupTranslation(translated, source)).toBe('{\n  "koin.setup": "配置"\n}')
  })
})

describe('repairUnclosedWrapper', () => {
  it('drops the opener left behind by the old cleanup', () => {
    const broken = ['```xml', '<topic title="框架">', '```kotlin', 'val a = 1', '```', '</topic>'].join('\n')
    const { content, changed } = repairUnclosedWrapper(broken, null)
    expect(changed).toBe(true)
    expect(content).toBe(['<topic title="框架">', '```kotlin', 'val a = 1', '```', '</topic>'].join('\n'))
  })

  it('leaves a page whose source also starts with a code block', () => {
    const source = ['```kotlin', 'val a = 1', '```', 'Text'].join('\n')
    const translated = ['```xml', '<a/>', '```', '文本', '```kotlin'].join('\n')
    expect(repairUnclosedWrapper(translated, source).changed).toBe(false)
  })

  it('leaves a code sample opener without a source to compare against', () => {
    const translated = ['```kotlin', 'val a = 1', '```', '文本', '```kotlin', 'val b = 2'].join('\n')
    expect(repairUnclosedWrapper(translated, null).changed).toBe(false)
  })

  it('leaves a closed ```xml block at the top of a page', () => {
    const translated = ['```xml', '<dependency/>', '```', '', '文本'].join('\n')
    expect(repairUnclosedWrapper(translated, null).changed).toBe(false)
  })
})
