import type { LocaleConfig } from 'vitepress'
import type { DefaultTheme } from 'vitepress'
import { generateNav } from './nav.config'
import { generateSearchConfig } from './search.config'
import { THEME_TRANSLATIONS, getEditLinkPattern } from './theme.config'
import generateSidebar from './sidebar.config'
import { SiteLocaleConfig } from '../locales.config'
import { DocsTypeConfig, DOCS_TYPES } from '../docs.config'
import { DEFAULT_LOCALE } from '../../../shared/locales'
import { localeUrlPrefix } from '../../../shared/content-paths'

/**
 * Locale mapping configuration
 * Key: VitePress locale key ('root' represents default language)
 * Value: Corresponding language key used in locale files
 */
const LOCALE_MAPPING: Record<string, string> = {
  'root': DEFAULT_LOCALE,
  'zh-Hant': 'zh-Hant',
  'ja': 'ja',
  'ko': 'ko',
}

/**
 * Generate complete sidebar configuration for a specific language
 * @param localeKey - Language key
 * @returns Sidebar configuration object
 */
function generateSidebarConfig(localeKey: string): DefaultTheme.Sidebar {
  const prefix = localeUrlPrefix(localeKey)
  const localeConfig = SiteLocaleConfig[localeKey]

  const sidebar: DefaultTheme.Sidebar = {}

  for (const docType of DOCS_TYPES) {
    const path = `${prefix}/${docType}/`
    sidebar[path] = generateSidebar(localeConfig, DocsTypeConfig[docType])
  }

  return sidebar
}

/**
 * Generate theme configuration for a single locale
 * @param localeKey - Language key
 * @returns Complete theme configuration
 */
function generateLocaleThemeConfig(localeKey: string): DefaultTheme.Config {
  const translations = THEME_TRANSLATIONS[localeKey]

  return {
    nav: generateNav(localeKey),
    sidebar: generateSidebarConfig(localeKey),
    lastUpdated: { text: translations.lastUpdated },
    editLink: {
      pattern: getEditLinkPattern(),
      text: translations.editLink,
    },
    docFooter: {
      prev: translations.prev,
      next: translations.next,
    },
    search: {
      provider: 'algolia',
      options: generateSearchConfig(localeKey),
    },
  }
}

/**
 * Generate configuration for a single locale
 * @param viteLocaleKey - VitePress locale key (e.g., 'root', 'ja')
 * @param localeKey - Actual language key (e.g., 'zh-Hans', 'ja')
 * @returns Complete locale configuration
 */
function generateSingleLocale(viteLocaleKey: string, localeKey: string): LocaleConfig<DefaultTheme.Config>[string] {
  const isRoot = viteLocaleKey === 'root'
  const siteLocale = SiteLocaleConfig[localeKey]

  return {
    ...(isRoot ? {} : { link: `${localeUrlPrefix(localeKey)}/` }),
    lang: siteLocale.lang,
    label: siteLocale.label,
    title: siteLocale.title,
    description: siteLocale.description,
    themeConfig: generateLocaleThemeConfig(localeKey),
  }
}

/**
 * Generate all locale configurations
 * This is the main entry point used in config.mts
 * @returns Complete locale configuration object for VitePress
 */
export function generateAllLocales(): LocaleConfig<DefaultTheme.Config> {
  const locales: LocaleConfig<DefaultTheme.Config> = {}

  for (const [viteKey, localeKey] of Object.entries(LOCALE_MAPPING)) {
    locales[viteKey] = generateSingleLocale(viteKey, localeKey)
  }

  return locales
}

/**
 * Export locale mapping for use in other modules
 */
export { LOCALE_MAPPING }
