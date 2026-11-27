import { codeBlockBodyText } from '../../../../../shared/writerside-code-block'

/**
 * Convert Writerside <code-block> bodies (including XML CDATA) into a Vue-safe
 * self-closing tag with an escaped `code` attribute. A body outside CDATA is
 * XML text, so its entities are decoded first (P3-39).
 *
 * VitePress compiles Markdown HTML with the Vue template compiler, which
 * rejects `<![CDATA[...]]>` outside XML. Leaving raw XML tags inside
 * `<code-block>` would also be parsed as Vue/HTML.
 */
export function normalizeWritersideCodeBlocks(content: string): string {
  content = content.replace(
    /<code-block\b(?![^>]*\/>)\s*([^>]*)>([\s\S]*?)<\/code-block>/gi,
    (match, rawAttrs: string, inner: string) => {
      if (/\s+code="[\s\S]*?"/.test(rawAttrs)) {
        return match
      }
      if (/\bsrc=/i.test(rawAttrs)) {
        return match
      }

      let rawCode = codeBlockBodyText(inner)
      rawCode = rawCode.replace(/^\s*\n/, '').replace(/\n\s*$/, '')
      const space = rawAttrs ? ' ' : ''
      return `<code-block${space}${rawAttrs} code="${escapeCodeBlockText(rawCode)}"/>`
    }
  )

  return content.replace(
    /<!\[CDATA\[([\s\S]*?)]]>/g,
    (_match, inner: string) => escapeCodeBlockText(inner)
  )
}

function escapeCodeBlockText(rawCode: string): string {
  return rawCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;')
}
