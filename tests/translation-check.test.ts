import { describe, expect, it } from 'vitest'
import { checkTranslation, lostHeadings, nestedLinks, structureOf, undefinedLeftovers } from '../tools/pipeline/utils/translation-check.mjs'

const section = (n: number) => [
  `## Section ${n}`,
  '',
  `Some prose for section ${n}, see [the guide](guide-${n}.md) and [the API](api-${n}.md).`,
  '',
  '```kotlin',
  `val x${n} = ${n}`,
  '```',
  '',
  `More prose about section ${n}.`,
  '',
].join('\n')

const source = ['[//]: # (title: Guide)', '', 'Intro paragraph.', '', ...[1, 2, 3, 4, 5, 6].map(section)].join('\n')
const faithful = source
  .replace(/Some prose for section (\d)/g, '第 $1 节的说明')
  .replace(/More prose about section (\d)\./g, '关于第 $1 节的更多内容。')

describe('structureOf', () => {
  it('counts Markdown and Writerside forms alike', () => {
    const topic = '<topic><chapter title="A"><code-block lang="kotlin">x</code-block></chapter><a href="b.md">b</a></topic>'
    expect(structureOf(topic)).toMatchObject({ headings: 1, codeBlocks: 1, links: 1 })
    expect(structureOf(source)).toMatchObject({ headings: 6, codeBlocks: 6, links: 12 })
  })

  it('ignores headings inside code blocks', () => {
    expect(structureOf(['```bash', '## not a heading', '```'].join('\n')).headings).toBe(0)
  })
})

describe('checkTranslation', () => {
  it('accepts a complete translation', () => {
    expect(checkTranslation(faithful, source)).toEqual([])
  })

  it('accepts merged paragraphs and a dropped link', () => {
    const merged = faithful.replace('\n\nIntro paragraph.', ' 简介。').replace('[the API](api-1.md)', 'the API')
    expect(checkTranslation(merged, source)).toEqual([])
  })

  it('rejects a summary of the page', () => {
    const summary = '本文介绍了 Guide 的六个部分，包括各节的示例代码和相关链接。'
    expect(checkTranslation(summary, source)).toEqual(expect.arrayContaining(['headings 0/6', 'code blocks 0/6']))
  })

  it('rejects a page cut off halfway', () => {
    const truncated = faithful.slice(0, faithful.indexOf('## Section 4'))
    expect(checkTranslation(truncated, source)).toContain('headings 3/6')
  })

  it('rejects an invented "moved" stub for a Writerside topic', () => {
    const topic = [
      '<topic title="Integrate a database">',
      ...[1, 2, 3, 4].map((n) => `<chapter title="Step ${n}"><code-block lang="kotlin">val a = ${n}</code-block></chapter>`),
      '</topic>',
    ].join('\n')
    const stub = '<topic title="集成数据库"><description>本页面已迁移。</description></topic>'
    expect(checkTranslation(stub, topic)).toEqual(expect.arrayContaining(['headings 0/4', 'code blocks 0/4']))
  })

  it('rejects a code block left open', () => {
    const lastFence = faithful.lastIndexOf('```')
    const open = faithful.slice(0, lastFence) + faithful.slice(lastFence + 3)
    expect(checkTranslation(open, source)).toContain('unclosed code block')
  })

  // kotlin/whatsnew21 in zh-Hans began mid-sentence: its title and first
  // lines were gone, and the page had no H1.
  it('rejects a page that lost its title comment, however little else is missing', () => {
    const headless = faithful.slice(faithful.indexOf('Intro paragraph.'))
    expect(checkTranslation(headless, source)).toEqual(['title comment lost'])
  })

  it('accepts a translated title, and a page that never had a title comment', () => {
    expect(checkTranslation(faithful.replace('(title: Guide)', '(title: 指南)'), source)).toEqual([])
    const untitled = source.replace('[//]: # (title: Guide)\n\n', '')
    expect(checkTranslation(faithful.replace('[//]: # (title: Guide)\n\n', ''), untitled)).toEqual([])
  })
})

// The pipeline once wrote "undefined" for content it could not find (#70);
// published pages from before still show it (P0-13).
describe('undefinedLeftovers', () => {
  const source = [
    '* only the [CIO engine](server-engines.md) is supported',
    '',
    '> Using Ktor in a Kotlin/Native project requires a new memory manager.',
    '{style="note"}',
    '',
    'See <Links href="server-native.topic" summary="Run a server without a JVM.">Native server</Links>',
    'and [](compose-test.md#locales).',
  ].join('\n')

  it.each([
    ['an include that was not found', source.replace(/> Using[^\n]*\n\{style="note"\}/, 'undefined')],
    ['a link summary', source.replace('summary="Run a server without a JVM."', 'summary="undefined"')],
    ['the text of an empty link', source.replace('[](compose-test.md', '[undefined](compose-test.md')],
  ])('counts %s', (_, translated) => {
    expect(undefinedLeftovers(translated, source)).toBe(1)
    expect(checkTranslation(translated, source)).toContain('"undefined" 1')
  })

  it('leaves the word itself alone', () => {
    const word = 'Nullability of generic type parameters is undefined by default.\n\nSanitizers detect undefined behavior.'
    expect(undefinedLeftovers(word, word)).toBe(0)
    // As many placeholders as the source: nothing the pipeline added.
    expect(undefinedLeftovers('undefined', 'undefined')).toBe(0)
  })

  it('ignores code blocks', () => {
    const code = '```javascript\nlet x\nundefined\n```'
    expect(undefinedLeftovers(code, '```javascript\nlet x\n```')).toBe(0)
  })
})

// ko/ktor/server-integrate-database: reordering the sentence, the model moved
// the <Links> into the <a> before it (P3-6).
describe('nestedLinks', () => {
  const settings = 'Start with <a href="docker-compose.topic#extract-db-settings">extracting the database settings</a> into a <Links href="/ktor/server-configuration-file" summary="Learn how to configure the server.">configuration file</Links>.'
  const nestedKo = '<a href="docker-compose.topic#extract-db-settings">데이터베이스 연결 설정을 <Links href="/ktor/server-configuration-file" summary="구성 파일에서 …">구성 파일</Links>로 추출</a>하는 것부터 시작할 수 있습니다.'

  it('counts a link inside an <a>: an <a>, a <Links> or a Markdown link', () => {
    expect(nestedLinks(nestedKo)).toBe(1)
    expect(nestedLinks('<a href="a">see <a href="b">b</a></a>')).toBe(1)
    expect(nestedLinks('<a href="a">see [b](b.md) too</a>')).toBe(1)
  })

  it('leaves side by side links and code alone', () => {
    expect(nestedLinks(settings)).toBe(0)
    expect(nestedLinks('Write `<a href="x"><a href="y">` in HTML.')).toBe(0)
    expect(nestedLinks('```html\n<a href="x"><Links href="y">y</Links></a>\n```')).toBe(0)
  })

  it('rejects a translation that nests a link its source does not', () => {
    const source = [`[//]: # (title: Guide)`, '', settings].join('\n')
    expect(checkTranslation(['[//]: # (title: 指南)', '', nestedKo].join('\n'), source)).toEqual(['link inside a link 1'])
    expect(checkTranslation(['[//]: # (title: 指南)', '', settings].join('\n'), source)).toEqual([])
  })

  it('accepts a link the source nests too', () => {
    const source = '<a href="a">see <a href="b">b</a></a>'
    expect(checkTranslation('<a href="a">参见 <a href="b">b</a></a>', source)).toEqual([])
  })
})

// Every heading line was there, but not every heading was one on the page (P3-35, P3-11, P3-37).
describe('lostHeadings', () => {
  // ktor/azure-app-service: upstream's list items, and zh-Hans written `*   `. The
  // code blocks indented three spaces then left the list, and the closing fence,
  // indented four, no longer closed one: "Step 2" ended up in a code block.
  const port = (marker: string, text: [string, string, string]) => [
    `### ${text[0]} {id="port"}`,
    '',
    `${marker}${text[1]}`,
    '',
    '   ```kotlin',
    '   fun runBasicServer() {',
    '      val port = System.getenv("PORT")?.toIntOrNull() ?: 8080',
    '   }',
    '    ```',
    `${marker}${text[2]}`,
    '',
    '   ```',
    '   ktor {',
    '       deployment {',
    '           port = ${PORT:8080}',
    '       }',
    '   }',
    '   ```',
    '   {style="block"}',
    '',
  ].join('\n')
  const portSource = port('* ', ['Step 1: Set up the port', 'If you used the example with port configuration **in code**:', 'If the server configuration is defined **in the config file**:']) +
    '\n### Step 2: Add plugins {id="plugins"}\nOpen the `build.gradle.kts` file.\n'
  const portZh = (marker: string) => port(marker, ['第 1 步：设置端口', '如果您使用的是**在代码中**配置端口的示例：', '如果服务器配置定义在**配置文件**中：']) +
    '\n### 第 2 步：添加插件 {id="plugins"}\n打开 `build.gradle.kts` 文件。\n'

  // kotlin/whatsnew16: ja moved the `//sampleEnd` of a code block in a list item
  // to the start of its line, which ended the list item and the code block with
  // it; the closing fence then opened another, which ran on over the next heading.
  const duration = (sampleEnd: string, text: [string, string]) => [
    `* ${text[0]}`,
    '',
    '  ```kotlin',
    '  fun main() {',
    '  //sampleStart',
    '      val duration = 10000',
    sampleEnd,
    '  }',
    '  ```',
    '  {kotlin-runnable="true" kotlin-min-compiler-version="1.5" validate="false"}',
    '',
    `### ${text[1]} {id="splitting-regex-into-a-sequence"}`,
    '',
  ].join('\n')
  const durationSource = duration('  //sampleEnd', ['We are bringing back extension properties like `Int.seconds`.', 'Splitting Regex into a sequence'])

  it('counts a heading a code block that does not end takes in (zh-Hans ktor/azure-app-service)', () => {
    expect(lostHeadings(portZh('*   '), portSource)).toBe(1)
    expect(checkTranslation(portZh('*   '), portSource)).toEqual(['Markdown headings lost once parsed 1'])
  })

  it('counts a heading after a code line moved out of its list item (ja kotlin/whatsnew16)', () => {
    const ja = duration('//sampleEnd', ['`Int.seconds` のような拡張プロパティを復活させます。', 'Regex をシーケンスに分割'])
    expect(lostHeadings(ja, durationSource)).toBe(1)
  })

  it('counts a heading written as HTML (ja kotlin/whatsnew1430)', () => {
    const source = '## Serialization updates\n\nWith Kotlin 1.4.30, we are releasing `kotlinx.serialization` 1.1.0-RC.\n'
    expect(lostHeadings('<h2>Serialization の更新</h2>\n\nKotlin 1.4.30 と共に、`kotlinx.serialization` 1.1.0-RC をリリースします。\n', source)).toBe(1)
  })

  it('accepts the same pages translated with the structure kept', () => {
    expect(checkTranslation(portZh('* '), portSource)).toEqual([])
    const ja = duration('  //sampleEnd', ['`Int.seconds` のような拡張プロパティを復活させます。', 'Regex をシーケンスに分割'])
    expect(lostHeadings(ja, durationSource)).toBe(0)
  })

  it('leaves a heading line inside a code block, in the source as in the translation', () => {
    const source = '## Markdown\n\n```markdown\n## Not a heading\n```\n'
    expect(lostHeadings('## Markdown\n\n```markdown\n## 不是标题\n```\n', source)).toBe(0)
  })
})
