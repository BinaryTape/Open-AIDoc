import { SiteLocaleConfig } from '../locales.config'
import { CONTENT_LOCALES, DEFAULT_LOCALE } from '../../../shared/locales'

/**
 * A site message (locales/*.json) in the language of the page at
 * `relativePath` (`ja/ktor/x.md` is Japanese, `ktor/x.md` the default
 * language); the default language's when the page's has none.
 */
export function pageMessage(relativePath: string | undefined, key: string): string | undefined {
  const first = (relativePath ?? '').split('/')[0]
  const locale = (CONTENT_LOCALES as readonly string[]).includes(first) ? first : DEFAULT_LOCALE
  return SiteLocaleConfig[locale]?.messages[key] ?? SiteLocaleConfig[DEFAULT_LOCALE].messages[key]
}
