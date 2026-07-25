/**
 * Locale-aware content path helpers for docs layout:
 *   docs/{docType}/...              ← default locale (zh-Hans)
 *   docs/{locale}/{docType}/...     ← other locales
 */

import {
  CONTENT_LOCALES,
  DEFAULT_LOCALE,
  isContentLocale,
  isDefaultLocale,
  type ContentLocale,
} from './locales'

export { CONTENT_LOCALES, DEFAULT_LOCALE, isContentLocale, isDefaultLocale }
export type { ContentLocale }

/** Normalize path separators to POSIX `/`. */
export function normalizePosixPath(value: string): string {
  return value.replaceAll('\\', '/')
}

/**
 * Locale segment in a docs-relative path (e.g. `ja/kotlin/x.md` → `ja`).
 * Default-locale pages have no segment, so this returns `undefined`.
 */
export function findLocaleInPath(
  relativePath: string,
  locales: readonly string[] = CONTENT_LOCALES
): string | undefined {
  const parts = normalizePosixPath(relativePath).split('/').filter(Boolean)
  return parts.find((part) => locales.includes(part))
}

/**
 * Split a docs-relative path into locale + content path (without locale prefix).
 * Matches historical SEO behavior: only non-default locale prefixes are stripped.
 */
export function splitLocalePath(relativePath: string): {
  locale: ContentLocale
  contentPath: string
} {
  const normalized = normalizePosixPath(relativePath)
  const [firstSegment, ...remainingSegments] = normalized.split('/')

  if (
    firstSegment &&
    isContentLocale(firstSegment) &&
    firstSegment !== DEFAULT_LOCALE
  ) {
    return {
      locale: firstSegment,
      contentPath: remainingSegments.join('/'),
    }
  }

  return {
    locale: DEFAULT_LOCALE,
    contentPath: normalized,
  }
}

/**
 * Relative path under `docs/` for a translated content file.
 * @example toContentRelPath('zh-Hans', 'kotlin', 'getting-started.md')
 *   → 'kotlin/getting-started.md'
 * @example toContentRelPath('ja', 'kotlin', 'getting-started.md')
 *   → 'ja/kotlin/getting-started.md'
 */
export function toContentRelPath(
  locale: string,
  docType: string,
  relPath: string
): string {
  const normalizedRel = normalizePosixPath(relPath).replace(/^\/+/, '')
  if (isDefaultLocale(locale)) {
    return joinPosix(docType, normalizedRel)
  }
  return joinPosix(locale, docType, normalizedRel)
}

/**
 * FS path prefix under `docs/` for a locale: `""` or `"ja/"`.
 * Accepts `undefined` for default-locale pages (no segment in path).
 */
export function localeFsPrefix(locale: string | null | undefined): string {
  if (isDefaultLocale(locale)) return ''
  return `${locale}/`
}

/**
 * URL path prefix for a locale: `""` or `"/ja"`.
 * Accepts `undefined` for default-locale pages.
 */
export function localeUrlPrefix(locale: string | null | undefined): string {
  if (isDefaultLocale(locale)) return ''
  return `/${locale}`
}

/**
 * Docs-relative path used to check whether a locale variant of a page exists.
 * @example localePageRelPath('zh-Hans', 'kotlin/home.md') → 'kotlin/home.md'
 * @example localePageRelPath('ja', 'kotlin/home.md') → 'ja/kotlin/home.md'
 */
export function localePageRelPath(locale: string, contentPath: string): string {
  const normalized = normalizePosixPath(contentPath).replace(/^\/+/, '')
  if (isDefaultLocale(locale)) return normalized
  return joinPosix(locale, normalized)
}

/**
 * Convert a markdown path (optionally with locale already stripped) to a site route.
 * @example markdownPathToRoute('index.md') → '/'
 * @example markdownPathToRoute('kotlin/home.md') → '/kotlin/home'
 * @example markdownPathToRoute('kotlin/foo/index.md') → '/kotlin/foo/'
 */
export function markdownPathToRoute(relativePath: string): string {
  let route = normalizePosixPath(relativePath).replace(/\.md$/, '')

  if (route === 'index' || route === '') return '/'
  if (route.endsWith('/index')) {
    route = route.slice(0, -'index'.length)
  }

  return `/${route}`
}

/**
 * Absolute page URL for SEO canonical / hreflang links.
 */
export function absolutePageUrl(
  siteOrigin: string,
  locale: string,
  contentPath: string
): string {
  const route = markdownPathToRoute(contentPath)
  const prefix = localeUrlPrefix(locale)
  return new URL(`${prefix}${route}`, siteOrigin).href
}

/**
 * Site route for a doc page within a locale and docType.
 * @example toContentUrl(undefined, 'kotlin', 'getting-started') → '/kotlin/getting-started'
 * @example toContentUrl('ja', 'kotlin', '') → '/ja/kotlin/'
 * @example toContentUrl('ja', 'kotlin', 'foo', { index: true }) → '/ja/kotlin/foo/'
 */
export function toContentUrl(
  locale: string | null | undefined,
  docType: string,
  target: string,
  options?: { index?: boolean; suffix?: string }
): string {
  const prefix = localeUrlPrefix(locale)
  const normalizedTarget = normalizePosixPath(target).replace(/^\/+|\/+$/g, '')
  const suffix = options?.suffix ?? ''

  if (!normalizedTarget) {
    return `${prefix}/${docType}/${suffix}`
  }

  const routeSuffix = options?.index
    ? `/${normalizedTarget}/`
    : `/${normalizedTarget}`
  return `${prefix}/${docType}${routeSuffix}${suffix}`
}

function joinPosix(...parts: string[]): string {
  return parts
    .map((part) => normalizePosixPath(part).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/')
}
