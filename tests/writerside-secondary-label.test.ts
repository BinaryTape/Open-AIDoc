import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { parseLabels, syncLabels } from '../tools/pipeline/utils/writerside-labels.mjs'

const LIST = `<?xml version="1.0" encoding="UTF-8"?>
<labels>
    <primary-label id="alpha" name="Alpha" short-name="α" href="components-stability.html" color="strawberry">Alpha &amp; unstable.</primary-label>
    <secondary-label id="maven" name="Maven" color="red"></secondary-label>
    <secondary-label id="IntelliJ IDEA" name="IntelliJ IDEA" color="blue">This tutorial works with
        IntelliJ IDEA.</secondary-label>
    <secondary-label id="Desktop" name="Desktop">Available for desktop</secondary-label>
</labels>`

describe('parseLabels', () => {
  it('reads every label of labels.list: name, colour, description', () => {
    expect(parseLabels(LIST)).toEqual({
      primary: { alpha: { name: 'Alpha', color: 'strawberry', description: 'Alpha & unstable.' } },
      secondary: {
        maven: { name: 'Maven', color: 'red' },
        'IntelliJ IDEA': { name: 'IntelliJ IDEA', color: 'blue', description: 'This tutorial works with IntelliJ IDEA.' },
        Desktop: { name: 'Desktop', description: 'Available for desktop' },
      },
    })
  })
})

describe('syncLabels', () => {
  let root: string
  beforeEach(() => { root = mkdtempSync(join(tmpdir(), 'labels-')) })
  afterEach(() => rmSync(root, { recursive: true, force: true }))

  it('writes the labels of the clone for its doc type', async () => {
    mkdirSync(join(root, 'clone/docs'), { recursive: true })
    writeFileSync(join(root, 'clone/docs/labels.list'), LIST)
    const context = { gitAddPaths: new Set<string>() }

    const file = await syncLabels(join(root, 'clone'), context, 'kotlin', join(root, 'out'))

    expect(file).toBe(join(root, 'out') + '/kotlin.json')
    expect(JSON.parse(readFileSync(file!, 'utf8')).secondary.maven).toEqual({ name: 'Maven', color: 'red' })
    expect([...context.gitAddPaths]).toEqual([file])
  })

  it('leaves the file alone for a clone without labels.list (kotlinx.coroutines)', async () => {
    mkdirSync(join(root, 'out'))
    writeFileSync(join(root, 'out/kotlin.json'), '{"kept":true}')

    expect(await syncLabels(join(root, 'clone'), { gitAddPaths: new Set() }, 'kotlin', join(root, 'out'))).toBeNull()
    expect(readFileSync(join(root, 'out/kotlin.json'), 'utf8')).toBe('{"kept":true}')
  })
})

describe('secondary labels on a page', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath = 'kotlin/whatsnew2320.md') => md.renderAsync(src, { relativePath, cleanUrls: true })

  // Labels from docs/.vitepress/labels/*.json, written by the pipeline
  it('renders a row of labels under a section heading', async () => {
    const html = await render('### 简化设置 {id="simplified"}\n<secondary-label ref="maven"/>\n\nKotlin 2.3.20 让设置更简单。\n')
    expect(html).toContain('</h3>\n<div class="ws-labels"><span class="ws-label ws-label--red">Maven</span></div>')
    expect(html).toContain('<p>Kotlin 2.3.20 让设置更简单。</p>')
    expect(html).not.toContain('<secondary-label')
  })

  it('puts the labels of consecutive lines in one row, before text with no blank line', async () => {
    const html = await render('## 原生 {id="native"}\n<secondary-label ref="native"/>\n<secondary-label ref="gradle"/>\nText right after.\n')
    expect(html).toContain('<div class="ws-labels"><span class="ws-label ws-label--strawberry">Kotlin/Native</span><span class="ws-label ws-label--black">Gradle</span></div>')
    expect(html).toContain('<p>Text right after.</p>')
  })

  it('keeps a primary label heading as it is, the row under it', async () => {
    const html = await render('### Lombok 现已进入 Alpha 阶段 {id="lombok"}\n\n<primary-label ref="alpha"/>\n<secondary-label ref="compiler"/>\n\n正文。\n')
    expect(html).toContain('<TopicTitle id="lombok" level="3" title="Lombok 现已进入 Alpha 阶段" labelRef="alpha"/><div class="ws-labels"><span class="ws-label ws-label--black">Compiler</span></div>')
  })

  it('renders the labels of a topic under its title, with their description', async () => {
    const html = await render('[//]: # (title: 完全共享代码：时区选择器应用)\n<secondary-label ref="IntelliJ IDEA"/>\n<secondary-label ref="Android Studio"/>\n\n本教程。\n', 'kmp/compose-multiplatform-new-project.md')
    expect(html).toMatch(/<\/h1>\n<div class="ws-labels"><span class="ws-label ws-label--blue" title="This tutorial works with IntelliJ IDEA.">IntelliJ IDEA<\/span><span class="ws-label ws-label--green" title="This tutorial works with Android Studio.">Android Studio<\/span><\/div>/)
  })

  it('shows the id of a label labels.list does not have, and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const html = await render('## A {id="a"}\n<secondary-label ref="no-such-label"/>\n\nText.\n')
    expect(html).toContain('<span class="ws-label ws-label--default">no-such-label</span>')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no label "no-such-label"'))
    warn.mockRestore()
  })

  it('leaves pages without labels alone', async () => {
    expect(await render('## A\n\nText.\n')).not.toContain('ws-labels')
  })

  it('has the label data the pages use', () => {
    for (const docType of ['kotlin', 'kmp', 'ktor']) {
      expect(existsSync(`docs/.vitepress/labels/${docType}.json`), docType).toBe(true)
    }
  })
})
