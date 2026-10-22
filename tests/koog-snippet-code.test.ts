import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { expandMkDocsSnippets } from '../docs/.vitepress/plugins/vite/mkdocs-snippets'

function koogPage(snippet: string) {
  const koogRoot = join(mkdtempSync(join(tmpdir(), 'open-aidoc-koog-')), 'docs', 'koog')
  mkdirSync(join(koogRoot, 'snippets'), { recursive: true })
  writeFileSync(join(koogRoot, 'snippets', 'quickstart-snippets.md'), snippet)
  return join(koogRoot, 'quickstart.md')
}

const SNIPPET = [
  '# --8<-- [start:dependencies]',
  '=== "Gradle (Kotlin)"',
  '',
  '    ``` kotlin title="build.gradle.kts"',
  '    dependencies {',
  '        implementation("ai.koog:koog-agents:1.3.0")',
  '    }',
  '    ```',
  '# --8<-- [end:dependencies]',
]

describe('Koog snippet expansion', () => {
  it.each([['LF', '\n'], ['CRLF', '\r\n']])('keeps the snippet line for line with %s line ends', (_, eol) => {
    // Was a blank line after every line: the blank line above the directive
    // was taken into the indent put before each line.
    const page = koogPage(SNIPPET.join(eol))
    const expanded = expandMkDocsSnippets(['## Install', '', '--8<-- "quickstart-snippets.md:dependencies"', '', 'Next.'].join(eol), page)
    expect(expanded.replace(/\r/g, '').split('\n')).toEqual([
      '## Install', '', ...SNIPPET.slice(1, -1), '', 'Next.',
    ])
  })

  it('indents a snippet included in a tab or admonition', () => {
    const page = koogPage(SNIPPET.join('\n'))
    const expanded = expandMkDocsSnippets('!!! note\n\n    --8<-- "quickstart-snippets.md:dependencies"\n', page)
    expect(expanded.split('\n')).toEqual(['!!! note', '', ...SNIPPET.slice(1, -1).map((l) => l ? '    ' + l : ''), ''])
  })
})

async function render(markdown: string, relativePath: string) {
  const md = await createMarkdownRenderer('docs', { config: (md) => registerMarkdownPlugins(md) })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

describe('MkDocs code blocks', () => {
  it('reads the language after a space, and shows the title', async () => {
    // Was <div class="language-"> with no title.
    const html = await render('``` kotlin title="build.gradle.kts"\ndependencies {}\n```\n', 'koog/example.md')
    expect(html).toMatch(/^<div class="vp-code-block-title">\n<div class="vp-code-block-title-bar">build.gradle.kts<\/div>\n<div class="language-kotlin/)
  })

  it('shows titles in SQLDelight too, escaped', async () => {
    const html = await render('```groovy title="build.gradle <root>"\nplugins {}\n```\n', 'sqldelight/android_sqlite/index.md')
    expect(html).toContain('<div class="vp-code-block-title-bar">build.gradle &lt;root&gt;</div>')
    expect(html).toContain('<div class="language-groovy')
  })

  it('leaves code blocks without a title, and other docs, as they were', async () => {
    expect(await render('```kotlin\nval x = 1\n```\n', 'koog/example.md')).toMatch(/^<div class="language-kotlin/)
    expect(await render('```kotlin title="x.kt"\nval x = 1\n```\n', 'kotlin/basic-syntax.md')).not.toContain('vp-code-block-title')
  })

  it('still titles diff blocks', async () => {
    expect(await render('```diff title="Changes"\n-a\n+b\n```\n', 'koog/example.md')).toContain('<div class="vp-code-block-title-bar">Changes</div>')
  })
})
