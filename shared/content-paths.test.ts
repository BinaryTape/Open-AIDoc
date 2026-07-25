import { describe, expect, it } from 'vitest'
import {
  absolutePageUrl,
  findLocaleInPath,
  localeFsPrefix,
  localePageRelPath,
  localeUrlPrefix,
  markdownPathToRoute,
  normalizePosixPath,
  splitLocalePath,
  toContentRelPath,
  toContentUrl,
} from './content-paths'
import { DEFAULT_LOCALE, isDefaultLocale } from './locales'

describe('normalizePosixPath', () => {
  it('converts backslashes to forward slashes', () => {
    expect(normalizePosixPath('ja\\kotlin\\foo.md')).toBe('ja/kotlin/foo.md')
  })
})

describe('isDefaultLocale / prefixes', () => {
  it('treats empty and zh-Hans as default', () => {
    expect(isDefaultLocale(undefined)).toBe(true)
    expect(isDefaultLocale(null)).toBe(true)
    expect(isDefaultLocale(DEFAULT_LOCALE)).toBe(true)
    expect(isDefaultLocale('ja')).toBe(false)
  })

  it('builds empty prefixes for default locale', () => {
    expect(localeFsPrefix(undefined)).toBe('')
    expect(localeFsPrefix(DEFAULT_LOCALE)).toBe('')
    expect(localeUrlPrefix(undefined)).toBe('')
    expect(localeUrlPrefix(DEFAULT_LOCALE)).toBe('')
  })

  it('builds locale prefixes for non-default locales', () => {
    expect(localeFsPrefix('ja')).toBe('ja/')
    expect(localeUrlPrefix('ja')).toBe('/ja')
    expect(localeUrlPrefix('zh-Hant')).toBe('/zh-Hant')
  })
})

describe('toContentRelPath', () => {
  it('omits locale segment for default locale', () => {
    expect(toContentRelPath('zh-Hans', 'kotlin', 'getting-started.md')).toBe(
      'kotlin/getting-started.md'
    )
  })

  it('includes locale segment for other locales', () => {
    expect(toContentRelPath('ja', 'kotlin', 'getting-started.md')).toBe(
      'ja/kotlin/getting-started.md'
    )
    expect(toContentRelPath('zh-Hant', 'kmp', 'quickstart.md')).toBe(
      'zh-Hant/kmp/quickstart.md'
    )
  })

  it('normalizes nested relative paths and backslashes', () => {
    expect(toContentRelPath('ko', 'koin', 'reference\\core\\dsl.md')).toBe(
      'ko/koin/reference/core/dsl.md'
    )
  })
})

describe('findLocaleInPath / splitLocalePath', () => {
  it('finds non-default locale segments', () => {
    expect(findLocaleInPath('ja/kotlin/foo.md')).toBe('ja')
    expect(findLocaleInPath('kotlin/foo.md')).toBeUndefined()
  })

  it('splits non-default locale prefix from content path', () => {
    expect(splitLocalePath('ja/kotlin/home.md')).toEqual({
      locale: 'ja',
      contentPath: 'kotlin/home.md',
    })
  })

  it('treats root paths as default locale without stripping', () => {
    expect(splitLocalePath('kotlin/home.md')).toEqual({
      locale: 'zh-Hans',
      contentPath: 'kotlin/home.md',
    })
  })

  it('does not strip a leading default-locale segment (layout never uses it)', () => {
    expect(splitLocalePath('zh-Hans/kotlin/home.md')).toEqual({
      locale: 'zh-Hans',
      contentPath: 'zh-Hans/kotlin/home.md',
    })
  })
})

describe('localePageRelPath / markdownPathToRoute / absolutePageUrl', () => {
  it('maps locale page existence paths', () => {
    expect(localePageRelPath('zh-Hans', 'kotlin/home.md')).toBe('kotlin/home.md')
    expect(localePageRelPath('ja', 'kotlin/home.md')).toBe('ja/kotlin/home.md')
  })

  it('converts markdown paths to routes', () => {
    expect(markdownPathToRoute('index.md')).toBe('/')
    expect(markdownPathToRoute('kotlin/home.md')).toBe('/kotlin/home')
    expect(markdownPathToRoute('kotlin/foo/index.md')).toBe('/kotlin/foo/')
  })

  it('builds absolute SEO URLs', () => {
    expect(
      absolutePageUrl('https://openaidoc.org', 'zh-Hans', 'kotlin/home.md')
    ).toBe('https://openaidoc.org/kotlin/home')
    expect(
      absolutePageUrl('https://openaidoc.org', 'ja', 'kotlin/home.md')
    ).toBe('https://openaidoc.org/ja/kotlin/home')
  })
})

describe('toContentUrl', () => {
  it('builds default-locale and localized doc routes', () => {
    expect(toContentUrl(undefined, 'kotlin', 'getting-started')).toBe(
      '/kotlin/getting-started'
    )
    expect(toContentUrl('ja', 'kotlin', 'getting-started')).toBe(
      '/ja/kotlin/getting-started'
    )
    expect(toContentUrl('ja', 'kotlin', '', { suffix: '' })).toBe('/ja/kotlin/')
    expect(toContentUrl('ja', 'kotlin', 'foo', { index: true })).toBe(
      '/ja/kotlin/foo/'
    )
    expect(
      toContentUrl(undefined, 'kotlin', 'x', { suffix: '#section' })
    ).toBe('/kotlin/x#section')
  })
})
