import { beforeAll, describe, expect, it } from 'vitest'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
})

// LF and CRLF sources give the same page, and the page compiles as a Vue template.
async function render(markdown: string, relativePath = 'kotlin/gradle-configure-project.md') {
  const lf = await md.renderAsync(markdown, { relativePath, cleanUrls: true })
  const crlf = await md.renderAsync(markdown.replace(/\n/g, '\r\n'), { relativePath, cleanUrls: true })
  expect(crlf).toBe(lf)
  expect(parse(`<template><div>${lf}</div></template>`).errors).toEqual([])
  // The heading anchors are not what these tests are about.
  return lf.replace(/ <a class="header-anchor"[^>]*>[^<]*<\/a>/g, '').replace(/\n/g, '')
}

const COLLAPSED = '{initial-collapse-state="collapsed" collapsible="true" id="earlier-kgp-versions"}'

describe('Writerside collapsible sections', () => {
  it('folds a section up to the next heading of the same level', async () => {
    // Was an open section, the attributes left on the <h3>.
    const html = await render(`## Apply the plugin\n\nText.\n\n### Earlier KGP versions ${COLLAPSED}\n\n| KGP | Gradle |\n|---|---|\n| 1.9 | 7.6 |\n\n### Kotlin Gradle plugin data\n\nAfter.\n`)
    expect(html).toBe(
      '<h2 id="apply-the-plugin" tabindex="-1">Apply the plugin</h2><p>Text.</p>' +
      '<details class="ws-collapse"><summary class="ws-collapse__summary">' +
      '<h3 id="earlier-kgp-versions" tabindex="-1">Earlier KGP versions</h3>' +
      '</summary><table tabindex="0"><thead><tr><th>KGP</th><th>Gradle</th></tr></thead><tbody><tr><td>1.9</td><td>7.6</td></tr></tbody></table>' +
      '</details>' +
      '<h3 id="kotlin-gradle-plugin-data" tabindex="-1">Kotlin Gradle plugin data</h3><p>After.</p>'
    )
  })

  it('keeps lower headings inside, and ends at a higher one or the end of the page', async () => {
    const html = await render(`### A ${COLLAPSED}\n\nOne.\n\n#### Inside\n\nTwo.\n\n## Higher\n\nThree.\n\n### B {collapsible="true" initial-collapse-state="collapsed"}\n\nLast.\n`)
    expect(html).toMatch(/<details class="ws-collapse">.*<h4 id="inside".*<p>Two\.<\/p><\/details><h2 id="higher"/)
    expect(html).toMatch(/<p>Last\.<\/p><\/details>$/)
  })

  it('nests sections', async () => {
    const html = await render(`### Outer ${COLLAPSED}\n\nOne.\n\n#### Inner {collapsible="true" initial-collapse-state="collapsed"}\n\nTwo.\n\n### Next\n`)
    expect(html).toMatch(/<details class="ws-collapse">.*<h3 id="earlier-kgp-versions".*<p>One\.<\/p><details class="ws-collapse">.*<h4 id="inner".*<p>Two\.<\/p><\/details><\/details><h3 id="next"/)
  })

  it('is open without a collapsed initial state, and reads the older default-state', async () => {
    expect(await render('### A {collapsible="true" id="a"}\n\nText.\n')).toMatch(/^<details class="ws-collapse" open>/)
    expect(await render('### A {collapsible="true" default-state="collapsed"}\n\nText.\n')).toMatch(/^<details class="ws-collapse">/)
  })

  it('ends a section in a list item with the item', async () => {
    const html = await render(`* Item\n\n  #### In list ${COLLAPSED}\n\n  Inside.\n\n* Next item\n`)
    expect(html).toMatch(/<li><p>Item<\/p><details class="ws-collapse">.*<p>Inside\.<\/p><\/details><\/li><li>/)
  })

  it('drops the state attributes from the heading and keeps its id', async () => {
    const html = await render(`### Earlier ${COLLAPSED}\n\nText.\n`)
    expect(html).toContain('<h3 id="earlier-kgp-versions" tabindex="-1">Earlier</h3>')
    expect(html).not.toMatch(/collapsible=|initial-collapse-state=/)
  })

  it('works on every language of the Writerside docs', async () => {
    for (const page of ['ja/kotlin/x.md', 'ko/kmp/x.md', 'zh-Hant/ktor/x.md']) {
      expect(await render(`### A ${COLLAPSED}\n\nText.\n`, page)).toMatch(/^<details class="ws-collapse">/)
    }
  })

  it('leaves the other docs alone', async () => {
    expect(await render(`### A ${COLLAPSED}\n\nText.\n`, 'koog/index.md')).not.toContain('<details')
  })
})
