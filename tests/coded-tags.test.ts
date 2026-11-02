import { describe, expect, it } from 'vitest'
import { unwrapCodedTags } from '../tools/pipeline/utils/coded-tags.mjs'

const source = 'Open the <path>Application.kt</path> file placed in the <path>src/main/kotlin</path> folder.'

describe('unwrapCodedTags', () => {
  it('takes a tag the model wrapped in backticks out of them', () => {
    const translated = '打开位于 `<Path>src/main/kotlin</Path>` 文件夹中的 `<Path>Application.kt</Path>` 文件。'
    expect(unwrapCodedTags(translated, source)).toEqual({
      content: '打开位于 <Path>src/main/kotlin</Path> 文件夹中的 <Path>Application.kt</Path> 文件。',
      unwrapped: 2,
    })
  })

  it('leaves a tag alone when the source writes it inside backticks too', () => {
    const translated = '用 `<path>file.txt</path>` 标记文件名。'
    expect(unwrapCodedTags(translated, 'Mark a file name with `<path>file.txt</path>`.').unwrapped).toBe(0)
  })

  it('leaves code blocks and longer code spans alone', () => {
    const translated = ['```xml', '`<path>a</path>`', '```', '``<path>b</path>``', '`<code>c</code>`'].join('\n')
    expect(unwrapCodedTags(translated, source)).toEqual({ content: translated, unwrapped: 0 })
  })
})
