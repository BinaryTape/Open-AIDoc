/**
 * Content locale constants shared by the sync pipeline and VitePress site.
 * Default locale (zh-Hans) has no path prefix under docs/.
 */

export const DEFAULT_LOCALE = 'zh-Hans' as const

export const CONTENT_LOCALES = [
  'zh-Hans',
  'zh-Hant',
  'ja',
  'ko',
] as const

export type ContentLocale = (typeof CONTENT_LOCALES)[number]

export function isDefaultLocale(
  locale: string | null | undefined
): boolean {
  return !locale || locale === DEFAULT_LOCALE
}

export function isContentLocale(value: string): value is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(value)
}
