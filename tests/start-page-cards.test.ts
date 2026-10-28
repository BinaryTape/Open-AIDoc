import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import TopicCardSection from '../docs/.vitepress/component/TopicCardSection.vue'
import { cardIcon } from '../docs/.vitepress/utils/card-icons'

const vitepress = join(__dirname, '../docs/.vitepress')

// Without scoped-style attributes and slot comments, for readable expectations.
async function renderSection(kind: string, links: Array<Record<string, string>>) {
  const html = await renderToString(createSSRApp({
    render: () => h(TopicCardSection, { kind }, () => [
      h('title', null, 'Section'),
      ...links.map(({ text, ...props }) => h('a', props, text)),
    ]),
  }))
  return html.replace(/ data-v-\w+|<!--[[\]]-->/g, '')
}

describe('start page cards', () => {
  it('shows the icon for the type above the title', async () => {
    const html = await renderSection('spotlight', [
      { href: 'getting-started.md', summary: 'Create a project', type: 'start', text: 'Get started' },
      { href: 'https://play.kotlinlang.org/', summary: 'Run code', type: 'install', text: 'Try online' },
    ])
    expect(html).toContain('<span class="ws-card-icon ws-card-icon--rocket" aria-hidden="true"></span><h3>Get started</h3>')
    // As on kotlinlang.org, `install` has the `learn` picture.
    expect(html).toContain('<span class="ws-card-icon ws-card-icon--learn" aria-hidden="true"></span><h3>Try online</h3>')
  })

  it('shows no icon for a card without a known type', async () => {
    const html = await renderSection('primary', [
      { href: 'basic-syntax.md', summary: 'Syntax', text: 'Basic syntax' },
      { href: 'x.md', summary: 'X', type: 'something-new', text: 'X' },
    ])
    expect(html).not.toContain('ws-card-icon')
    expect(cardIcon('constructor')).toBeUndefined()
  })

  it('names the section tag in a class, for its style', async () => {
    const html = await renderSection('secondary', [{ href: 'a.md', summary: 'A', text: 'A' }])
    expect(html).toMatch(/^<div class="ws-section ws-section--secondary"><h2 class="ws-section-title">Section<\/h2>/)
  })

  it('has a style and an icon file for every icon', () => {
    const css = readFileSync(join(vitepress, 'styles/ws-start-page.css'), 'utf8')
    for (const type of ['start', 'install', 'learn', 'idea', 'cross-platform']) {
      const icon = cardIcon(type)!
      const file = css.match(new RegExp(`\\.ws-card-icon--${icon} \\{[^}]*url\\('\\.\\./([^']+)'\\)`))?.[1]
      expect(file, `${type} → ${icon}`).toBeDefined()
      expect(existsSync(join(vitepress, file!)), file).toBe(true)
    }
  })
})
