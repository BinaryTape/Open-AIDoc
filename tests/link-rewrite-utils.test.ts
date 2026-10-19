import { describe, expect, it } from 'vitest'
import {
  getPageLocale,
  hasFileExtension,
  isExternalOrFragment,
  localizedDocRoute,
  normalizeDocTarget,
  resolveRelativeDocTarget,
  splitHref,
} from '../docs/.vitepress/link-rewrites/link-rewrite-utils'
import { kotlinRewriteHref } from '../docs/.vitepress/link-rewrites/kotlin.link-rewrite'
import { kmpRewriteHref } from '../docs/.vitepress/link-rewrites/kmp.link-rewrite'
import { ktorRewriteHref } from '../docs/.vitepress/link-rewrites/ktor.link-rewrite'
import { koogRewriteHref } from '../docs/.vitepress/link-rewrites/koog.link-rewrite'
import { koinRewriteHref } from '../docs/.vitepress/link-rewrites/koin.link-rewrite'

describe('isExternalOrFragment', () => {
  it('detects external schemes and fragments', () => {
    expect(isExternalOrFragment('https://example.com/a')).toBe(true)
    expect(isExternalOrFragment('http://example.com')).toBe(true)
    expect(isExternalOrFragment('mailto:a@b.c')).toBe(true)
    expect(isExternalOrFragment('tel:+123')).toBe(true)
    expect(isExternalOrFragment('data:text/plain,hi')).toBe(true)
    expect(isExternalOrFragment('//cdn.example.com/x')).toBe(true)
    expect(isExternalOrFragment('#section')).toBe(true)
  })

  it('treats site-relative and doc paths as internal', () => {
    expect(isExternalOrFragment('/kotlin/home')).toBe(false)
    expect(isExternalOrFragment('getting-started.md')).toBe(false)
    expect(isExternalOrFragment('../other.md')).toBe(false)
  })
})

describe('splitHref', () => {
  it('separates pathname from query and hash', () => {
    expect(splitHref('/kotlin/home.md#intro')).toEqual({
      pathname: '/kotlin/home.md',
      suffix: '#intro',
    })
    expect(splitHref('page.md?x=1')).toEqual({
      pathname: 'page.md',
      suffix: '?x=1',
    })
    expect(splitHref('plain.md')).toEqual({
      pathname: 'plain.md',
      suffix: '',
    })
  })
})

describe('normalizeDocTarget / resolveRelativeDocTarget', () => {
  it('strips docType prefix and file extensions', () => {
    expect(normalizeDocTarget('/kotlin/getting-started.md', 'kotlin')).toBe(
      'getting-started'
    )
    expect(normalizeDocTarget('topics/foo.topic', 'kotlin')).toBe('topics/foo')
    expect(normalizeDocTarget('index.md', 'kotlin')).toBe('')
    expect(normalizeDocTarget('/kotlin/foo/index', 'kotlin')).toBe('foo')
  })

  it('resolves absolute and relative targets from the current page', () => {
    const env = { relativePath: 'kotlin/reference/dsl.md' }
    expect(resolveRelativeDocTarget(env, 'kotlin', '/kotlin/home.md')).toBe(
      'home'
    )
    expect(resolveRelativeDocTarget(env, 'kotlin', '../getting-started.md')).toBe(
      'getting-started'
    )
    expect(resolveRelativeDocTarget(env, 'kotlin', 'scopes.md')).toBe(
      'reference/scopes'
    )
  })
})

describe('getPageLocale / localizedDocRoute', () => {
  it('reads locale from the page path when present', () => {
    expect(getPageLocale({ relativePath: 'kotlin/x.md' })).toBeUndefined()
    expect(getPageLocale({ relativePath: 'ja/kotlin/x.md' })).toBe('ja')
  })

  it('builds locale-aware routes via shared path helpers', () => {
    const rootEnv = { relativePath: 'kotlin/getting-started.md' }
    const jaEnv = { relativePath: 'ja/kotlin/getting-started.md' }

    expect(localizedDocRoute(rootEnv, 'kotlin', 'getting-started')).toBe(
      '/kotlin/getting-started'
    )
    expect(localizedDocRoute(jaEnv, 'kotlin', 'getting-started')).toBe(
      '/ja/kotlin/getting-started'
    )
    expect(localizedDocRoute(jaEnv, 'kotlin', '', '#top')).toBe(
      '/ja/kotlin/#top'
    )
  })
})

describe('Writerside site paths', () => {
  it.each([
    ['ktor', ktorRewriteHref, '/ktor/server-native', '/ja/ktor/server-native'],
    ['ktor', ktorRewriteHref, '/ktor/server-native#install', '/ja/ktor/server-native#install'],
    ['kmp', kmpRewriteHref, '/kmp/get-started', '/ja/kmp/get-started'],
  ] as const)('%s localizes the absolute page path %s', (docType, rewriteHref, href, expected) => {
    // Was returned as is: absolute paths were taken for assets.
    expect(rewriteHref({ relativePath: `ja/${docType}/x.md` }, href)).toBe(expected)
    expect(rewriteHref({ relativePath: `${docType}/x.md` }, href)).toBe(href)
  })

  it.each([
    ['ktor', ktorRewriteHref],
    ['kmp', kmpRewriteHref],
  ] as const)('%s leaves absolute file paths alone', (docType, rewriteHref) => {
    expect(rewriteHref({ relativePath: `ja/${docType}/x.md` }, `/${docType}/logo.svg`)).toBe(`/${docType}/logo.svg`)
    expect(rewriteHref({ relativePath: `ja/${docType}/x.md` }, `/${docType}/sample.zip`)).toBe(`/${docType}/sample.zip`)
  })

  it('tells files from pages', () => {
    expect(hasFileExtension('/ktor/logo.svg')).toBe(true)
    expect(hasFileExtension('/ktor/a.zip?x=1')).toBe(true)
    expect(hasFileExtension('/ktor/server-native')).toBe(false)
    expect(hasFileExtension('/ktor/server-native.topic#a')).toBe(false)
    expect(hasFileExtension('/ktor/server-native.md')).toBe(false)
  })
})

describe('docType rewriteHref: external and fragment passthrough', () => {
  const rewriters = [
    ['kotlin', kotlinRewriteHref],
    ['kmp', kmpRewriteHref],
    ['ktor', ktorRewriteHref],
    ['koog', koogRewriteHref],
    ['koin', koinRewriteHref],
  ] as const

  const env = { relativePath: 'kotlin/home.md' }

  it.each(rewriters)(
    '%s leaves external and fragment hrefs unchanged',
    (_docType, rewriteHref) => {
      expect(rewriteHref(env, 'https://example.com/docs')).toBe(
        'https://example.com/docs'
      )
      expect(rewriteHref(env, 'mailto:docs@example.com')).toBe(
        'mailto:docs@example.com'
      )
      expect(rewriteHref(env, '#anchor')).toBe('#anchor')
    }
  )
})
