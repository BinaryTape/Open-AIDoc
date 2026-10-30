import type { DefaultTheme } from 'vitepress'

/**
 * Navigation items definition (without language prefix)
 * To add a new doc, simply add a new entry here
 */
export const NAV_ITEMS: Array<{ text: string; link: string }> = [
  { text: 'Kotlin', link: '/kotlin/home' },
  { text: 'Kotlin Multiplatform', link: '/kmp/get-started' },
  { text: 'Ktor', link: '/ktor/welcome' },
  { text: 'Koog', link: '/koog/' },
  { text: 'Koin', link: '/koin/intro/' },
  { text: 'SQLDelight', link: '/sqldelight/index' },
  { text: 'Coil', link: '/coil/overview' },
]

/**
 * Generate navigation items with language prefix
 * @param localeKey - Language key ('zh-Hans' | 'zh-Hant' | 'ja' | 'ko')
 * @returns Navigation items with appropriate prefix
 */
export function generateNav(localeKey: string): DefaultTheme.NavItem[] {
  // zh-Hans is the default language, no prefix needed
  const prefix = localeKey === 'zh-Hans' ? '' : `/${localeKey}`

  return NAV_ITEMS.map(item => ({
    text: item.text,
    link: `${prefix}${item.link}`
  }))
}
