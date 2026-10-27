import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { decodeSampleRanges, encodeSampleRanges, withSampleMarkers } from '../docs/.vitepress/utils/runnable-code'

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

// LF and CRLF sources give the same page, and the page compiles as a Vue template.
async function render(markdown: string, relativePath = 'kotlin/basic-syntax.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  return lf
}

const wrapper = (html: string) => html.match(/<div class="ws-runnable"[^>]*>/)?.[0]
const codeText = (html: string) => html.match(/<code>([\s\S]*?)<\/code>/)![1].replace(/<[^>]+>/g, '')

const hello =
  '```kotlin\nfun main() {\n//sampleStart\n    println("Hello world!")\n//sampleEnd\n}\n```\n' +
  '{kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="kotlin-basic-syntax-hello-world"}\n'

describe('runnable Kotlin samples', () => {
  it('wraps the highlighted block with what Playground needs', async () => {
    // Was a plain code block, the sample markers dropped and with them the folding.
    const html = await render(hello)
    expect(wrapper(html)).toBe('<div class="ws-runnable" data-sample="1-2" data-min-compiler-version="1.3" id="kotlin-basic-syntax-hello-world">')
    expect(html).toMatch(/<div class="ws-runnable"[^>]*><div class="language-kotlin[\s\S]*<\/div><\/div>\n$/)
  })

  it('still shows the code without the sample markers', async () => {
    expect(codeText(await render(hello))).toBe('fun main() {\n    println("Hello world!")\n}')
  })

  it('keeps several sample ranges, and none', async () => {
    const two = '```kotlin\nclass A\n//sampleStart\nval a = 1\n//sampleEnd\nval b = 2\n//sampleStart\nval c = 3\nval d = 4\n//sampleEnd\n```\n{kotlin-runnable="true"}\n'
    expect(wrapper(await render(two))).toBe('<div class="ws-runnable" data-sample="1-2,3-5">')
    const none = '```kotlin\nfun main() = println(1)\n```\n{kotlin-runnable="true" validate="false"}\n'
    expect(wrapper(await render(none))).toBe('<div class="ws-runnable">')
  })

  it('works on every language of the Writerside docs, and in KMP', async () => {
    expect(wrapper(await render(hello, 'ja/kotlin/basic-syntax.md'))).toContain('data-sample="1-2"')
    expect(wrapper(await render(hello, 'kmp/multiplatform-expect-actual.md'))).toContain('data-sample="1-2"')
  })

  it('leaves blocks that are not runnable alone', async () => {
    const html = await render('```kotlin\nfun main() {\n//sampleStart\n    println(1)\n//sampleEnd\n}\n```\n')
    expect(html).not.toContain('ws-runnable')
    expect(codeText(html)).toBe('fun main() {\n    println(1)\n}')
  })

  it('leaves the other docs alone', async () => {
    expect(await render(hello, 'koog/index.md')).not.toContain('ws-runnable')
  })

  it('goes inside a collapsible block, which keeps the id', async () => {
    const html = await render('```kotlin\nfun main() = println(1)\n```\n{kotlin-runnable="true" collapsible="true" id="solution"}\n')
    expect(html).toMatch(/^<details class="ws-code-collapse" id="solution"[^>]*>.*<div class="ws-runnable">/s)
  })
})

describe('sample markers', () => {
  it('encode and decode', () => {
    expect(encodeSampleRanges([[1, 2], [3, 5]])).toBe('1-2,3-5')
    expect(decodeSampleRanges('1-2,3-5')).toEqual([[1, 2], [3, 5]])
    expect(decodeSampleRanges(undefined)).toEqual([])
    expect(decodeSampleRanges('x,2-4')).toEqual([[2, 4]])
  })

  it('go back where they were', () => {
    // What Playground gets: the code as the source had it.
    expect(withSampleMarkers('fun main() {\n    println("Hello world!")\n}', [[1, 2]]))
      .toBe('fun main() {\n//sampleStart\n    println("Hello world!")\n//sampleEnd\n}')
    expect(withSampleMarkers('class A\nval a = 1\nval b = 2\nval c = 3\nval d = 4', [[1, 2], [3, 5]]))
      .toBe('class A\n//sampleStart\nval a = 1\n//sampleEnd\nval b = 2\n//sampleStart\nval c = 3\nval d = 4\n//sampleEnd')
    expect(withSampleMarkers('val a = 1', [[0, 1]])).toBe('//sampleStart\nval a = 1\n//sampleEnd')
    expect(withSampleMarkers('val a = 1', [])).toBe('val a = 1')
  })
})
