import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import markdownItMkAdmonition from '../docs/.vitepress/plugins/markdown/mkdocs/markdown-it-mk-admonitions'
import markdownItMkCodeTabs from '../docs/.vitepress/plugins/markdown/mkdocs/markdown-it-mk-code-tabs'
import { expandMkDocsSnippets } from '../docs/.vitepress/plugins/vite/mkdocs-snippets'
import { rebaseSnippetLinks } from '../docs/.vitepress/plugins/vite/mkdocs-snippet-links'

const koogEnv = { relativePath: 'koog/example.md' }

describe('Koog snippet link context', () => {
  it('rebases links and reference destinations while preserving code and absolute URLs', () => {
    const source = [
      '[Guide](../quickstart.md#install "Read more")',
      '![Image](../images/example.png)',
      '[Named][guide]',
      '[guide]: ../quickstart.md?mode=example#install',
      '[External](https://example.com/guide) [Root](/koog/quickstart.md) [Anchor](#install)',
      '`[Code](../quickstart.md)`',
      '    ```markdown',
      '    [Example](../quickstart.md)',
      '    ```',
      '[Parenthesized](../guide(test).md)',
    ].join('\n')
    const result = rebaseSnippetLinks(source, '/docs/koog/snippets/shared.md', '/docs/koog/features/chat-memory/page.md')

    expect(result).toContain('[Guide](<../../quickstart.md#install> "Read more")')
    expect(result).toContain('![Image](<../../images/example.png>)')
    expect(result).toContain('[guide]: <../../quickstart.md?mode=example#install>')
    expect(result).toContain('[Parenthesized](<../../guide(test).md>)')
    expect(result).toContain('[External](https://example.com/guide) [Root](/koog/quickstart.md) [Anchor](#install)')
    expect(result).toContain('`[Code](../quickstart.md)`')
    expect(result).toContain('    ```markdown\n    [Example](../quickstart.md)\n    ```')
  })

  it('rebases a nested include exactly once at each directory boundary', () => {
    const root = mkdtempSync(join(tmpdir(), 'open-aidoc-koog-'))
    const koogRoot = join(root, 'koog')
    mkdirSync(join(koogRoot, 'snippets', 'nested'), { recursive: true })
    writeFileSync(join(koogRoot, 'snippets', 'parent.md'), '--8<-- "nested/child.md"')
    writeFileSync(join(koogRoot, 'snippets', 'nested', 'child.md'), '[Guide](../../quickstart.md)')

    const expanded = expandMkDocsSnippets('--8<-- "parent.md"', join(koogRoot, 'features', 'memory', 'page.md'))
    expect(expanded).toBe('[Guide](<../../quickstart.md>)')
  })

  it.each(['', 'zh-Hant/', 'ja/', 'ko/'])('resolves the real chat-memory quickstart link for locale %s', (locale) => {
    const relativePath = `${locale}koog/features/chat-memory/chat-agent-with-memory.md`
    const page = join(process.cwd(), 'docs', relativePath)
    const expanded = expandMkDocsSnippets(readFileSync(page, 'utf8'), page)
    const md = new MarkdownIt({ html: true })
    registerMarkdownPlugins(md)
    const html = md.render(expanded, { relativePath })

    expect(html).toContain(`href="/${locale}koog/quickstart"`)
    expect(html).not.toContain('href="../quickstart.md"')
    expect(html).not.toContain('/koog/features/quickstart')
  })
})

describe('Koog repeated footnotes', () => {
  it('uses the official caption for every reference while preserving unique backlinks', () => {
    const md = new MarkdownIt({ html: true })
    registerMarkdownPlugins(md)

    const html = md.render(
      'First[^1] and second[^1].\n\n[^1]: Supported by some models.',
      koogEnv
    )

    expect(html.match(/>\[1\]<\/a>/g)).toHaveLength(2)
    expect(html).not.toContain('>[1:1]</a>')
    expect(html).toContain('id="fnref1"')
    expect(html).toContain('id="fnref1:1"')
    expect(html).toContain('href="#fnref1"')
    expect(html).toContain('href="#fnref1:1"')
  })

  it('keeps the default repeated-reference caption outside Koog', () => {
    const md = new MarkdownIt({ html: true })
    registerMarkdownPlugins(md)

    const html = md.render(
      'First[^1] and second[^1].\n\n[^1]: One note.',
      { relativePath: 'kotlin/example.md' }
    )

    expect(html).toContain('>[1:1]</a>')
  })
})

describe('Koog MkDocs snippets', () => {
  it('expands a named region and preserves the caller indentation', () => {
    const root = mkdtempSync(join(tmpdir(), 'open-aidoc-koog-'))
    const koogRoot = join(root, 'docs', 'koog')
    const snippetDir = join(koogRoot, 'snippets')
    mkdirSync(snippetDir, { recursive: true })

    const page = join(koogRoot, 'guide.md')
    const snippet = join(snippetDir, 'sample.md')
    writeFileSync(snippet, [
      '# --8<-- [start:install]',
      '```kotlin',
      'implementation("example")',
      '```',
      '# --8<-- [end:install]',
    ].join('\n'))

    const expanded = expandMkDocsSnippets(
      '??? tip "Install"\n\n    --8<-- "sample.md:install"',
      page
    )

    expect(expanded).toContain('    ```kotlin')
    expect(expanded).toContain('    implementation("example")')
    expect(expanded).not.toContain('--8<-- "sample.md:install"')
  })

  it('accepts Koog\'s repeated start marker as a region terminator', () => {
    const root = mkdtempSync(join(tmpdir(), 'open-aidoc-koog-'))
    const koogRoot = join(root, 'docs', 'koog')
    const snippetDir = join(koogRoot, 'snippets')
    mkdirSync(snippetDir, { recursive: true })

    const page = join(koogRoot, 'guide.md')
    writeFileSync(join(snippetDir, 'beta.md'), [
      '# --8<-- [start:beta]',
      'Beta content',
      '# --8<-- [start:beta]',
    ].join('\n'))

    expect(expandMkDocsSnippets('--8<-- "beta.md:beta"', page)).toBe('Beta content')
  })

  it('expands the multi-region block form used by the parameter reference', () => {
    const root = mkdtempSync(join(tmpdir(), 'open-aidoc-koog-'))
    const koogRoot = join(root, 'docs', 'koog')
    const snippetDir = join(koogRoot, 'snippets')
    mkdirSync(snippetDir, { recursive: true })

    const page = join(koogRoot, 'parameters.md')
    writeFileSync(join(snippetDir, 'params.md'), [
      '# --8<-- [start:first]',
      'First parameter',
      '# --8<-- [end:first]',
      '# --8<-- [start:second]',
      'Second parameter',
      '# --8<-- [end:second]',
    ].join('\n'))

    const source = [
      '    --8<--',
      '    params.md:first',
      '    params.md:second',
      '    --8<--',
    ].join('\n')
    const expanded = expandMkDocsSnippets(source, page)

    expect(expanded).toContain('    First parameter')
    expect(expanded).toContain('    Second parameter')
    expect(expanded).not.toContain('--8<--')
  })

  it('fails clearly for a missing region', () => {
    const root = mkdtempSync(join(tmpdir(), 'open-aidoc-koog-'))
    const koogRoot = join(root, 'docs', 'koog')
    const snippetDir = join(koogRoot, 'snippets')
    mkdirSync(snippetDir, { recursive: true })

    const page = join(koogRoot, 'guide.md')
    writeFileSync(join(snippetDir, 'sample.md'), 'No regions here')

    expect(() => expandMkDocsSnippets('--8<-- "sample.md:missing"', page))
      .toThrow('region "missing" was not found')
  })

  it('expands every snippet reference in the current Koog quickstart', () => {
    const page = join(process.cwd(), 'docs', 'koog', 'quickstart.md')
    const source = [
      '--8<-- "quickstart-snippets.md:prerequisites"',
      '--8<-- "quickstart-snippets.md:dependencies"',
    ].join('\n')
    const expanded = expandMkDocsSnippets(source, page)

    expect(expanded).toContain('JDK 17+')
    expect(expanded).toContain('ai.koog:koog-agents')
    expect(expanded).not.toContain('--8<-- "')
  })
})

describe('Koog MkDocs admonitions', () => {
  const md = new MarkdownIt({ html: true }).use(markdownItMkAdmonition)

  it('renders fixed and collapsible admonitions', () => {
    const source = [
      '!!! warning "Keep it secret"',
      '    Do not expose the key.',
      '',
      '??? tip "More"',
      '    **Details** here.',
      '',
      '???+ note "Initially open"',
      '    Visible content.',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain('<div class="mk-admonition mk-admonition--warning">\n<p class="mk-admonition__title">Keep it secret</p>')
    expect(html).toContain('<details class="mk-admonition mk-admonition--tip">')
    expect(html).toContain('<strong>Details</strong>')
    expect(html).toContain('<details open class="mk-admonition mk-admonition--note">')
    expect(html).not.toContain('???')
  })

  it('does not transform non-MkDocs documentation', () => {
    const source = '??? tip "Keep source"\n\n    Content'
    expect(md.render(source, { relativePath: 'kotlin/example.md' })).toContain('??? tip')
  })

  it('keeps de-indented translated lines inside an admonition code fence', () => {
    const source = [
      '!!! tip "Example"',
      '    ```kotlin',
      '    val text = "first',
      'second"',
      '    ```',
      '',
      'After the block.',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain('second&quot;')
    expect(html).toContain('After the block.')
    expect(html).not.toContain('```')
  })
})

describe('Koog MkDocs content tabs', () => {
  const md = new MarkdownIt({ html: true }).use(markdownItMkCodeTabs)
  // A tab group closes with three `</div>` lines: the last body, the bodies
  // wrapper, and the container.
  const groupEnd = '</div>\n</div>\n</div>'
  const groupStart = '<div class="ws-tabs-container ws-tabs-static">'

  it.each(['koog', 'sqldelight'])('keeps following standalone code outside %s tabs with its indentation intact', (docType) => {
    const source = [
      '=== "Kotlin"',
      '    ```kotlin',
      '    kotlinDependency()',
      '    ```',
      '=== "Groovy"',
      '    ```groovy',
      '    groovyDependency()',
      '    ```',
      '',
      '```kotlin',
      'fun before() {',
      '  initializeDriver()',
      '}',
      '```',
    ].join('\n')
    const html = md.render(source, { relativePath: `${docType}/example.md` })

    expect(html).toContain(`${groupEnd}\n<pre><code class="language-kotlin">fun before() {\n  initializeDriver()`)
    expect(html.slice(0, html.indexOf(groupEnd))).not.toContain('initializeDriver')
  })

  it.each([
    ['android_sqlite/testing.md', '@Before'],
    ['common/rxjava.md', 'val players:'],
    ['common/index_server.md', 'val driver:'],
  ])('keeps the shared example visible after tabs in SQLDelight %s', (file, example) => {
    const relativePath = `sqldelight/${file}`
    const source = readFileSync(join(process.cwd(), 'docs', relativePath), 'utf8')
    const html = md.render(source, { relativePath })
    const exampleIndex = html.indexOf(example)

    expect(exampleIndex).toBeGreaterThan(0)
    expect(html.lastIndexOf(groupEnd, exampleIndex)).toBeGreaterThan(html.lastIndexOf(groupStart, exampleIndex))
  })

  it('renders prose, code, and nested content tabs', () => {
    const source = [
      '=== "OpenAI"',
      '',
      '    Provider instructions.',
      '',
      '    === "Linux/macOS"',
      '',
      '        ```shell',
      '        export API_KEY=value',
      'a translated continuation that lost indentation',
      '        ```',
      '',
      '    === "Windows"',
      '',
      '        ```cmd',
      '        set API_KEY=value',
      '        ```',
      '',
      '=== "Ollama"',
      '',
      '    Local provider.',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain(groupStart)
    expect(html).toContain('data-title="OpenAI"')
    expect(html).toContain('data-title="Linux/macOS"')
    expect(html).toContain('export API_KEY=value')
    expect(html).toContain('data-title="Ollama"')
    expect(html).not.toContain('=== &quot;')

    // A nested group needs its own radio name, or selecting a tab in the inner
    // group would clear the outer one.
    const names = [...html.matchAll(/name="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(names).size).toBe(2)
  })

  it('closes a truncated final code fence before generated Vue tags', () => {
    const source = [
      '=== "Groovy"',
      '    ```groovy',
      '    dependencies {',
      '    }',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain('</code></pre>')
    expect(html).toContain(groupEnd)
  })

  it('checks the first tab and pairs every label with its own radio', () => {
    const source = [
      '=== "Kotlin"',
      '    ```kotlin',
      '    first()',
      '    ```',
      '=== "Groovy"',
      '    ```groovy',
      '    second()',
      '    ```',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain('<input type="radio" name="ws-tabs-0" id="ws-tabs-0-0" checked>')
    expect(html).toContain('<input type="radio" name="ws-tabs-0" id="ws-tabs-0-1">')
    expect(html).toContain('<label class="ws-tab" data-title="Kotlin" for="ws-tabs-0-0">Kotlin</label>')
    expect(html).toContain('<label class="ws-tab" data-title="Groovy" for="ws-tabs-0-1">Groovy</label>')
    // The radios must precede the tab bar and the bodies: the stylesheet
    // reaches both with `input:checked ~ …`.
    expect(html.indexOf('<input type="radio"')).toBeLessThan(html.indexOf('<div class="ws-tablist">'))
  })

  it('keeps Markdown after a tab group outside the generated HTML block', () => {
    const source = [
      '=== "Kotlin"',
      '',
      '    ```kotlin',
      '    println("tab")',
      '    ```',
      '',
      '## Following heading',
      '',
      '```mermaid',
      'graph TD',
      '```',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain(`${groupEnd}\n<h2>Following heading</h2>`)
    expect(html).toContain('<code class="language-mermaid">graph TD')
    expect(html).not.toContain('```mermaid')
  })
})

describe('Koog collapsible admonition boundaries', () => {
  const md = new MarkdownIt({ html: true }).use(markdownItMkAdmonition)

  it('keeps following Markdown outside the generated details block', () => {
    const source = [
      '??? note "Details"',
      '    Collapsible content.',
      '',
      '## Following heading',
    ].join('\n')
    const html = md.render(source, koogEnv)

    expect(html).toContain('</details>\n<h2>Following heading</h2>')
    expect(html).not.toContain('## Following heading')
  })
})
