import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from 'vitepress'
import { parse } from 'vue/compiler-sfc'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { mkdocsIconClasses, mkdocsIconSvg } from '../docs/.vitepress/utils/mkdocs-icons'

async function render(markdown: string, relativePath = 'koog/example.md') {
  const md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    config: (md) => registerMarkdownPlugins(md),
  })
  return md.renderAsync(markdown, { relativePath, cleanUrls: true })
}

describe('MkDocs icon sets', () => {
  it.each([
    ['material-rocket-launch', 'viewBox="0 0 24 24"'],
    ['octicons-arrow-right-24', 'viewBox="0 0 24 24"'],
    ['octicons-link-external-16', 'viewBox="0 0 16 16"'],
    ['simple-opentelemetry', 'viewBox="0 0 24 24"'],
  ])('has %s', (name, viewBox) => {
    expect(mkdocsIconSvg(name)).toMatch(new RegExp(`^<svg xmlns="http://www.w3.org/2000/svg" ${viewBox}><path`))
  })

  it('has no icon for an unknown name or set', () => {
    expect(mkdocsIconSvg('material-no-such-icon')).toBeNull()
    expect(mkdocsIconSvg('fontawesome-solid-star')).toBeNull()
  })

  it('reads attribute classes', () => {
    expect(mkdocsIconClasses('{ .lg .middle }')).toBe('lg middle')
    expect(mkdocsIconClasses(undefined)).toBe('')
  })
})

describe('MkDocs icon shortcodes', () => {
  it('renders an icon with its classes in a card title', async () => {
    // Was the text ":material-rocket-launch:{ .lg .middle }".
    const html = await render(':material-rocket-launch:{ .lg .middle } [**Quickstart**](quickstart.md)\n')
    expect(html).toMatch(/^<p><span class="emoji lg middle"><svg [^>]*viewBox="0 0 24 24"><path [^>]*\/><\/svg><\/span> <a href="\/koog\/quickstart"><strong>Quickstart<\/strong><\/a><\/p>/)
    expect(parse(`<template><div>${html}</div></template>`).errors).toEqual([])
  })

  it('renders icons without classes, and keeps an unknown one as text', async () => {
    const html = await render('[:octicons-arrow-right-24: JVM](jvm.md) and :material-no-such-icon: here\n', 'sqldelight/index.md')
    expect(html).toContain('<span class="emoji"><svg')
    expect(html).toContain(':material-no-such-icon: here')
  })

  it('leaves other docs alone', async () => {
    // A Maven coordinate in KMP prose is not an icon.
    const html = await render('Use org.jetbrains.compose.material:material-icons-core:1.7.3 here.\n', 'kmp/whats-new-compose-180.md')
    expect(html).not.toContain('<svg')
  })

  it('renders the icons of a SQLDelight card title', async () => {
    const html = await render('<div class="cash-grid-item" markdown="1">\n<p class="cash-grid-title" markdown="1">:simple-sqlite:{ .lg .middle } __SQLite__</p>\n</div>\n', 'sqldelight/index.md')
    expect(html).toContain('<span class="emoji lg middle"><svg')
    expect(html).toContain('<strong>SQLite</strong>')
  })
})

describe('MkDocs card grids', () => {
  it('render as a list in a grid cards container, for the stylesheet', async () => {
    const html = await render([
      '<div class="grid cards" markdown>',
      '',
      '-   :material-book-open-variant:{ .lg .middle } [**Glossary**](glossary.md)',
      '',
      '    ---',
      '',
      '    Learn the essential terms',
      '',
      '</div>',
      '',
    ].join('\n'))
    expect(html.replace(/\n/g, '')).toMatch(/<div class="grid cards" markdown><ul><li><p><span class="emoji lg middle"><svg[\s\S]*<\/svg><\/span> <a[^>]*><strong>Glossary<\/strong><\/a><\/p><hr><p>Learn the essential terms<\/p><\/li><\/ul><\/div>/)
  })
})
