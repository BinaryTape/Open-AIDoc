/**
 * The code a Writerside `<code-block>` body holds, for the sync pipeline
 * (tools/pipeline/processors/TopicProcessor.mjs) and the site
 * (docs/.vitepress/plugins/markdown/writerside/normalize-writerside-code-blocks.ts),
 * which turn the body into a `code` attribute.
 *
 * Writerside reads the body as XML: CDATA as written, any other text with its
 * entities decoded. ktor.io shows server-jwt's `&lt;dependency&gt;` as
 * `<dependency>`, and the `-&gt;` server-configuration-code writes in CDATA as
 * `-&gt;` (P3-39). Only XML's own entities are decoded; any other `&` is text.
 */

const XML_ENTITY = /&(?:(lt|gt|amp|quot|apos)|#([0-9]+)|#x([0-9a-fA-F]+));/g

const NAMED: Record<string, string> = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }

/** Decode XML's five named entities and its character references. */
export function decodeXmlEntities(text: string): string {
  return text.replace(XML_ENTITY, (match, name?: string, decimal?: string, hex?: string) => {
    if (name) return NAMED[name]
    const code = decimal !== undefined ? parseInt(decimal, 10) : parseInt(hex!, 16)
    return code <= 0x10ffff ? String.fromCodePoint(code) : match
  })
}

/** The code of a `<code-block>` body: CDATA as written, other text decoded. */
export function codeBlockBodyText(inner: string): string {
  const code = inner.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '')
  return /^\s*<!\[CDATA\[/.test(inner) ? code : decodeXmlEntities(code)
}
