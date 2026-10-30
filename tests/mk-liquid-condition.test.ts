import { beforeAll, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import markdownItMkLiquidCondition, {
  evaluateLiquidConditions,
} from '../docs/.vitepress/plugins/markdown/mkdocs/markdown-it-mk-liquid-condition'

const evaluate = (src: string, vars = {}) => evaluateLiquidConditions(src, vars)

describe('evaluateLiquidConditions', () => {
  it('keeps the if branch when the variable is set, the else branch when not', () => {
    const src = 'selectAll().{% if async %}await{% else %}execute{% endif %}AsList()'
    expect(evaluate(src, { async: true }).text).toBe('selectAll().awaitAsList()')
    expect(evaluate(src).text).toBe('selectAll().executeAsList()')
  })

  it('drops a block without else when its condition does not hold', () => {
    const src = '{% if async %}suspend {% endif %}fun doDatabaseThings()'
    expect(evaluate(src).text).toBe('fun doDatabaseThings()')
    expect(evaluate(src, { async: true }).text).toBe('suspend fun doDatabaseThings()')
  })

  it('negates with not; an unset variable is false, as in Jinja', () => {
    const src = '{% if not server %}## Defining the Schema{% endif %}\n\nText.'
    expect(evaluate(src).text).toBe('## Defining the Schema\n\nText.')
    expect(evaluate(src, { server: true }).text).toBe('\n\nText.')
    expect(evaluate(src, { server: false }).text).toBe('## Defining the Schema\n\nText.')
  })

  it('evaluates blocks over several lines, inside code, and nested', () => {
    const src = [
      '```kotlin',
      'packageName.set("com.example"){% if dialect %}',
      'dialect("{{ dialect }}:{{ versions.sqldelight }}"){% endif %}{% if async %}',
      'generateAsync.set(true){% endif %}',
      '```',
      '{% if a %}A{% if not b %}-not b{% else %}-b{% endif %}{% endif %}',
    ].join('\n')

    expect(evaluate(src, { dialect: 'app.cash.sqldelight:mysql-dialect', a: 1 }).text).toBe([
      '```kotlin',
      'packageName.set("com.example")',
      // versions.* is filled by markdown-it-mk-vars
      'dialect("app.cash.sqldelight:mysql-dialect:{{ versions.sqldelight }}")',
      '```',
      'A-not b',
    ].join('\n'))
    expect(evaluate(src, { async: 'yes' }).text).toBe('```kotlin\npackageName.set("com.example")\ngenerateAsync.set(true)\n```\n')
  })

  it('leaves pages without Jinja tags as they are, Vue interpolation included', () => {
    const src = 'Title: {{ title }} and {{ $frontmatter.title }}'
    expect(evaluate(src, { title: 'X' })).toEqual({ text: src, unsupported: null })
  })

  it('leaves a variable the page does not set, or not a plain value', () => {
    expect(evaluate('{% if x %}{% endif %}{{ dialect }} {{ list }}', { list: [1] }).text).toBe('{{ dialect }} {{ list }}')
  })

  it('drops every block, as before, when a condition is beyond if/not/else', () => {
    for (const src of [
      '{% if a and b %}x{% endif %}y',
      '{% if a %}x{% elif b %}z{% endif %}y',
      '{% if a %}xy',
      'x{% endif %}y',
    ]) {
      const result = evaluate(src, { a: true })
      expect(result.unsupported, src).not.toBeNull()
    }
    expect(evaluate('{% if a == "b" %}x{% endif %}y{% if c %}z{% endif %}', { c: true }).text).toBe('y')
  })
})

// ─── Real SQLDelight pages, rendered with the site's Markdown setup ──────────

let md: MarkdownRenderer

beforeAll(async () => {
  md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    preConfig: (m) => { m.use(markdownItMkLiquidCondition) },
    config: (m) => registerMarkdownPlugins(m),
  })
})

const SQLDELIGHT = join(import.meta.dirname, '../docs/sqldelight')

/** The page with its includes inlined, as vite-liquid-include and VitePress do. */
function expand(file: string): string {
  return readFileSync(join(SQLDELIGHT, file), 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\{%\s*include\s+['"]([^'"]+)['"]\s*%\}/g, (_, path) => expand(path))
}

const render = (file: string) => md.renderAsync(expand(file), { relativePath: `sqldelight/${file}`, cleanUrls: true })
const text = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"')
const headings = (html: string, level: number) =>
  [...html.matchAll(new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, 'g'))].map((m) => text(m[1]).replace(/&#8203;/g, '').trim())

describe('SQLDelight pages', () => {
  it('gives the getting-started code the blocking calls, and the schema heading', async () => {
    const page = text(await render('android_sqlite/index.md'))
    expect(page).toContain('selectAll().executeAsList()')
    expect(page).not.toContain('.AsList()')
    expect(page).not.toContain('{%')
    expect(headings(await render('android_sqlite/index.md'), 2)).toContain('定义架构')
  })

  it('gives the Kotlin/JS page the suspending calls and generateAsync', async () => {
    const page = text(await render('js_sqlite/index.md'))
    expect(page).toContain('suspend fun doDatabaseThings')
    expect(page).toContain('selectAll().awaitAsList()')
    expect(page).toContain('generateAsync.set(true)')
  })

  it('gives the server pages their dialect, and no schema heading', async () => {
    const html = await render('jvm_mysql/index.md')
    expect(text(html)).toContain('dialect("app.cash.sqldelight:mysql-dialect:')
    expect(text(html)).not.toContain('{{')
    expect(headings(html, 2)).not.toContain('定义架构')
  })

  it('gives each foreign keys page one H1, and the multiplatform one a section per platform', async () => {
    const android = await render('android_sqlite/foreign_keys.md')
    expect(headings(android, 1)).toEqual(['外键'])

    const multiplatform = await render('multiplatform_sqlite/foreign_keys.md')
    expect(headings(multiplatform, 1)).toEqual(['外键'])
    expect(headings(multiplatform, 2)).toEqual(['Android SQLite', 'JVM SQLite', '原生 SQLite'])
  })

  it('warns when a page uses a condition it cannot evaluate', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await md.renderAsync('# Page\n\n{% if a or b %}x{% endif %}y\n', { relativePath: 'sqldelight/x.md' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sqldelight/x.md: unsupported {% if a or b %}'))
    warn.mockRestore()
  })
})
