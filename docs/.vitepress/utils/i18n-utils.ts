import { computed, inject, type App, type ComputedRef } from 'vue'
import type { Router } from 'vitepress'
import { SiteLocaleConfig, SITE_LOCALES } from '../locales.config'
import { DEFAULT_LOCALE } from '../../../shared/locales'

export type I18n = {
  /** The site's message for a key (locales/*.json), in the page's locale */
  t: (key: string) => string
  locale: ComputedRef<string>
}

/** The locale of a page path: its first segment when that is a locale (/ja/…), else the default. */
export function localeOfPath(path: string): string {
  const first = path.split('/')[1]
  return first && SITE_LOCALES.includes(first) ? first : DEFAULT_LOCALE
}

/**
 * The site's own messages, in the locale of the current page. The locale is
 * read from the app's router rather than kept in module state: the build
 * renders pages concurrently, each with its own app, and a page rendered on
 * the server has to be in its own language (P2-21).
 */
export function createI18n(router: Router) {
  const locale = computed(() => localeOfPath(router.route.path))
  const t = (key: string) => SiteLocaleConfig[locale.value]?.messages[key] || key
  const i18n: I18n = { t, locale }
  return {
    install(app: App) {
      app.config.globalProperties.$t = t
      app.provide('i18n', i18n)
    },
  }
}

export function useI18n(): I18n {
  return inject<I18n>('i18n')!
}
