/**
 * "undefined" a reader sees on a built page, where the sync pipeline once
 * wrote it for content it could not find (fixed in #70; old translations are
 * queued for retranslation, P0-13):
 *
 *   - a paragraph of its own (an <include> it could not resolve)
 *   - a link's hover summary (<Links summary="undefined">)
 *   - a link's text ([undefined](page.md))
 *
 * Code is left out: "undefined" is a JavaScript value there.
 */
const PLACEHOLDERS = [
  /<p>\s*undefined\s*<\/p>/g,
  /class="ws-tooltip"[^>]*>\s*undefined\s*</g,
  /<a\b[^>]*>(?:<!--\[-->)?\s*undefined\s*(?:<!--\]-->)?<\/a>/g,
]

/** How many placeholders the page content (<main>) shows. */
export function visibleUndefined(html) {
  const start = html.indexOf('<main')
  const end = html.lastIndexOf('</main>')
  if (start === -1 || end === -1) return 0
  const content = html.slice(start, end)
    .replace(/<pre\b[\s\S]*?<\/pre>/g, '')
    .replace(/<code\b[\s\S]*?<\/code>/g, '')
  return PLACEHOLDERS.reduce((sum, pattern) => sum + (content.match(pattern) ?? []).length, 0)
}
