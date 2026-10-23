import { SiteLocaleConfig } from '../locales.config'
import { CONTENT_LOCALES, DEFAULT_LOCALE } from '../../../shared/locales'

/**
 * Writerside callouts: `> …` blockquotes styled `note`, `tip` or `warning`
 * (a blockquote without a style is a tip), and the `<note>`, `<tip>` and
 * `<warning>` tags. Shared by the Markdown plugin and the Note/Tip/Warning
 * components so both render the same markup.
 */
export const CALLOUT_TYPES = ['note', 'tip', 'warning'] as const
export type CalloutType = (typeof CALLOUT_TYPES)[number]

type Tone = 'green' | 'yellow' | 'red' | 'neutral'

// The two upstream sites colour callouts differently. kotlinlang.org (the
// Kotlin and Kotlin Multiplatform docs) restyles Writerside's defaults;
// ktor.io keeps them.
const KOTLINLANG_TONES: Record<CalloutType, Tone> = { note: 'green', tip: 'neutral', warning: 'red' }
const WRITERSIDE_TONES: Record<CalloutType, Tone> = { note: 'yellow', tip: 'green', warning: 'red' }

export function isCalloutType(value: string): value is CalloutType {
  return (CALLOUT_TYPES as readonly string[]).includes(value)
}

function pathSegments(relativePath: string | undefined): string[] {
  return (relativePath ?? '').split('/')
}

function calloutTone(type: CalloutType, relativePath: string | undefined): Tone {
  const tones = pathSegments(relativePath).includes('ktor') ? WRITERSIDE_TONES : KOTLINLANG_TONES
  return tones[type]
}

/** Screen-reader name of the callout, in the page's language. */
export function calloutLabel(type: CalloutType, relativePath: string | undefined): string {
  const first = pathSegments(relativePath)[0]
  const locale = (CONTENT_LOCALES as readonly string[]).includes(first) ? first : DEFAULT_LOCALE
  const key = `callout.${type}`
  return SiteLocaleConfig[locale]?.messages[key] ?? SiteLocaleConfig[DEFAULT_LOCALE].messages[key] ?? type
}

export function calloutClass(type: CalloutType, relativePath: string | undefined): string {
  return `ws-callout ws-callout--${type} ws-callout--${calloutTone(type, relativePath)}`
}
