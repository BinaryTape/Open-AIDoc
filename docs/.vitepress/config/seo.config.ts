import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import type { HeadConfig, PageData } from 'vitepress'
import {
  absolutePageUrl,
  localePageRelPath,
  splitLocalePath,
} from '../../../shared/content-paths'
import {
  CONTENT_LOCALES,
  DEFAULT_LOCALE,
  type ContentLocale,
} from '../../../shared/locales'

const SITE_ORIGIN = 'https://openaidoc.org'
const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const KOTLIN_HOME_DESCRIPTIONS: Record<ContentLocale, string> = {
  'zh-Hans': 'Kotlin 中文文档：学习语言基础、标准库、协程、Kotlin Multiplatform 与开发工具。',
  'zh-Hant': 'Kotlin 繁體中文文件：學習語言基礎、標準函式庫、協程、Kotlin Multiplatform 與開發工具。',
  ja: 'Kotlin 日本語ドキュメント：言語の基礎、標準ライブラリ、コルーチン、Kotlin Multiplatform、開発ツールを学べます。',
  ko: 'Kotlin 한국어 문서: 언어 기초, 표준 라이브러리, 코루틴, Kotlin Multiplatform 및 개발 도구를 알아보세요.'
}

type SupportedLocale = ContentLocale

export function applySeoMetadata(pageData: PageData) {
  const relativePath = pageData.relativePath
  const sourcePath = resolve(docsRoot, relativePath)

  if (!existsSync(sourcePath)) return

  const source = readFileSync(sourcePath, 'utf8')
  const title = extractTitle(source)
  const { locale, contentPath } = splitLocalePath(relativePath)
  const description = extractDescription(source) ||
    fallbackDescription(locale, contentPath)

  if (title) pageData.title = title
  if (description) pageData.description = description

  pageData.frontmatter.head ??= []
  const head = pageData.frontmatter.head as HeadConfig[]
  addHeadEntry(head, ['link', {
    rel: 'canonical',
    href: absolutePageUrl(SITE_ORIGIN, locale, contentPath)
  }])

  for (const alternateLocale of CONTENT_LOCALES) {
    if (!localePageExists(alternateLocale, contentPath)) continue

    addHeadEntry(head, ['link', {
      rel: 'alternate',
      hreflang: alternateLocale,
      href: absolutePageUrl(SITE_ORIGIN, alternateLocale, contentPath)
    }])
  }

  if (localePageExists(DEFAULT_LOCALE, contentPath)) {
    addHeadEntry(head, ['link', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: absolutePageUrl(SITE_ORIGIN, DEFAULT_LOCALE, contentPath)
    }])
  }
}

function fallbackDescription(locale: SupportedLocale, contentPath: string) {
  return contentPath === 'kotlin/home.md'
    ? KOTLIN_HOME_DESCRIPTIONS[locale]
    : ''
}

function addHeadEntry(head: HeadConfig[], entry: HeadConfig) {
  const [, attributes] = entry
  if (
    head.some((existing) => {
      const [, existingAttributes] = existing
      return existingAttributes.rel === attributes.rel &&
        existingAttributes.hreflang === attributes.hreflang
    })
  ) {
    return
  }

  head.push(entry)
}

function localePageExists(locale: SupportedLocale, contentPath: string) {
  return existsSync(resolve(docsRoot, localePageRelPath(locale, contentPath)))
}

export function extractTitle(source: string) {
  const parsed = matter(source)
  if (typeof parsed.data.title === 'string') {
    return cleanText(parsed.data.title)
  }

  const startingPageTitle = parsed.content.match(
    /<section-starting-page\b[^>]*>[\s\S]*?<title>\s*([\s\S]*?)\s*<\/title>/i
  )?.[1]
  if (startingPageTitle) return cleanText(startingPageTitle)

  const commentTitle = parsed.content.match(
    /^\[\/\/\]:\s*#\s*\(title:\s*(.*?)\s*\)$/im
  )?.[1]
  if (commentTitle) return cleanText(commentTitle)

  const markdownTitle = parsed.content.match(/^#\s+(.+)$/m)?.[1]
  if (markdownTitle) return cleanText(markdownTitle)

  const topicTitle = parsed.content.match(/<topic\b[^>]*\btitle="([^"]+)"/i)?.[1]
  return topicTitle ? cleanText(topicTitle) : ''
}

export function extractDescription(source: string) {
  const parsed = matter(source)
  if (typeof parsed.data.description === 'string') {
    return truncateDescription(cleanText(parsed.data.description))
  }

  const startingPageDescription = parsed.content.match(
    /<section-starting-page\b[^>]*>[\s\S]*?<description\b[^>]*>\s*([\s\S]*?)\s*<\/description>/i
  )?.[1]
  if (startingPageDescription && !startingPageDescription.includes('%')) {
    return truncateDescription(cleanText(startingPageDescription))
  }

  const proseSource = parsed.content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/^\[\/\/\]:.*$/gm, '')

  for (const block of proseSource.split(/\n\s*\n/)) {
    const trimmed = block.trim()
    if (
      !trimmed ||
      /^(#|[-*+]\s|\d+\.\s|:::|<|{|import\s)/.test(trimmed)
    ) {
      continue
    }

    const description = cleanText(trimmed)
    if (description.length >= 16) {
      return truncateDescription(description)
    }
  }

  return ''
}

function cleanText(value: string) {
  return value
    .replace(/!\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_~]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateDescription(description: string) {
  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}…`
    : description
}
