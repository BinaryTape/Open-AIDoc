import { describe, expect, it } from 'vitest'
import type { DefaultTheme } from 'vitepress'
import { breadcrumbTrail } from '../docs/.vitepress/utils/breadcrumbs'
import generateSidebar from '../docs/.vitepress/config/sidebar.config'
import { DocsTypeConfig } from '../docs/.vitepress/docs.config'
import { SiteLocaleConfig } from '../docs/.vitepress/locales.config'

// Breadcrumbs follow the sidebar down to the page, as on kotlinlang.org and
// ktor.io (P2-1).
const sidebar: DefaultTheme.Sidebar = {
  '/ktor/': [
    { text: 'Welcome', link: '/ktor/welcome' },
    {
      text: 'Ktor Server',
      items: [
        {
          text: 'Developing applications',
          items: [
            { text: 'Templating', link: '/ktor/server-templating', items: [{ text: 'FreeMarker', link: '/ktor/server-freemarker' }] },
            { text: 'Routing', link: '/ktor/server-routing' },
          ],
        },
      ],
    },
  ],
  '/ja/ktor/': [{ text: 'Ktor サーバー', items: [{ text: 'ルーティング', link: '/ja/ktor/server-routing' }] }],
  '/koin/': [{ text: 'Get Started', items: [{ text: 'Welcome', link: '/koin/index' }] }],
  '/koog/': [{ text: 'Agents', items: [{ text: 'Overview', link: '/koog/agents/index' }] }],
}

describe('breadcrumbTrail', () => {
  it('lists the sidebar groups down to the page, the page last without a link', () => {
    expect(breadcrumbTrail(sidebar, 'ktor/server-routing.md')).toEqual([
      { text: 'Ktor Server' },
      { text: 'Developing applications' },
      { text: 'Routing' },
    ])
  })

  it('links an ancestor that has its own page', () => {
    expect(breadcrumbTrail(sidebar, 'ktor/server-freemarker.md')).toEqual([
      { text: 'Ktor Server' },
      { text: 'Developing applications' },
      { text: 'Templating', link: '/ktor/server-templating' },
      { text: 'FreeMarker' },
    ])
  })

  it('shows nothing for a page at the top of the sidebar or not in it', () => {
    expect(breadcrumbTrail(sidebar, 'ktor/welcome.md')).toEqual([])
    expect(breadcrumbTrail(sidebar, 'ktor/not-in-sidebar.md')).toEqual([])
    expect(breadcrumbTrail(undefined, 'ktor/server-routing.md')).toEqual([])
  })

  it('uses the sidebar of the page language', () => {
    expect(breadcrumbTrail(sidebar, 'ja/ktor/server-routing.md')).toEqual([{ text: 'Ktor サーバー' }, { text: 'ルーティング' }])
  })

  it('finds an index page', () => {
    expect(breadcrumbTrail(sidebar, 'koin/index.md')).toEqual([{ text: 'Get Started' }, { text: 'Welcome' }])
  })

  it('shows nothing for the MkDocs doc sets, whose sites have no breadcrumbs', () => {
    expect(breadcrumbTrail(sidebar, 'koog/agents/index.md')).toEqual([])
  })
})

describe('breadcrumbs from the site sidebars', () => {
  const siteSidebar = (lang: string, prefix: string) =>
    Object.fromEntries(
      ['kotlin', 'ktor', 'kmp', 'koin', 'koog'].map((type) => [`${prefix}/${type}/`, generateSidebar(SiteLocaleConfig[lang], DocsTypeConfig[type])])
    ) as DefaultTheme.Sidebar

  const ja = siteSidebar('ja', '/ja')
  const texts = (relativePath: string) => breadcrumbTrail(ja, relativePath).map((crumb) => crumb.text)

  it('follows the Writerside tree, linking a group page', () => {
    const trail = breadcrumbTrail(ja, 'ja/ktor/server-freemarker.md')
    expect(trail).toHaveLength(4)
    expect(trail.map((crumb) => crumb.link)).toEqual([undefined, undefined, '/ja/ktor/server-templating', undefined])
  })

  it('goes into an included sidebar (coroutines under kotlin)', () => {
    expect(texts('ja/kotlin/coroutines-basics.md')).toHaveLength(3)
  })

  it('covers the Koin sidebar', () => {
    expect(texts('ja/koin/reference/koin-core/definitions.md')).toHaveLength(2)
  })

  it('leaves out top-level pages and MkDocs pages', () => {
    expect(texts('ja/kotlin/getting-started.md')).toEqual([])
    expect(texts('ja/koog/index.md')).toEqual([])
  })
})
