/**
 * Removes Markdown comments: `[//]: # (text)`.
 *
 * markdown-it only hides such a comment when it happens to be a valid link
 * reference definition. Upstream sources break that in several ways, and the
 * comment then shows up as page text:
 * - parentheses in the text: `[//]: # (description: … (KSP) …)`
 * - punctuation after it: `[//]: # (TODO …).`
 * - HTML spread over several lines, whose `</p>` ends the paragraph early
 *   (and nests a `<p>` in a `<p>`, breaking hydration)
 * The upstream sites hide all of these, so they are removed from the source
 * before parsing.
 *
 * A comment starts a line (up to 3 spaces indent) and runs until its
 * parentheses balance, ignoring backslash escapes, without crossing a blank
 * line; a `.` or `。` after it goes with it. Fenced code is left alone, and so
 * is anything that does not close cleanly.
 */
const COMMENT_START = /^ {0,3}\[\/\/\]: # \(/
const FENCE = /^\s*(`{3,}|~{3,})(.*)$/
const TRAILING = /^[.。]?\s*$/

/** The index of the line that closes the comment starting at `start`, or -1. */
function commentEnd(lines: string[], start: number): number {
  let depth = 0
  for (let i = start; i < lines.length; i++) {
    const line = i === start ? lines[i].slice(lines[i].indexOf('(')) : lines[i]
    if (i > start && line.trim() === '') return -1
    for (let k = 0; k < line.length; k++) {
      const c = line[k]
      if (c === '\\') k++
      else if (c === '(') depth++
      else if (c === ')' && --depth === 0) return TRAILING.test(line.slice(k + 1)) ? i : -1
    }
  }
  return -1
}

export function removeMarkdownComments(src: string): string {
  if (!src.includes('[//]: # (')) return src

  const lines = src.split(/\r?\n/)
  const kept: string[] = []
  let fence: { char: string, length: number } | null = null

  for (let i = 0; i < lines.length; i++) {
    const fenceMatch = lines[i].match(FENCE)
    if (fenceMatch) {
      const [, marker, rest] = fenceMatch
      if (!fence) {
        if (marker[0] === '~' || !rest.includes('`')) fence = { char: marker[0], length: marker.length }
      } else if (marker[0] === fence.char && marker.length >= fence.length && rest.trim() === '') {
        fence = null
      }
    }

    if (!fence && COMMENT_START.test(lines[i])) {
      const end = commentEnd(lines, i)
      if (end >= 0) {
        i = end
        continue
      }
    }
    kept.push(lines[i])
  }
  return kept.join('\n')
}

export default function markdownItRemoveComments(md: any) {
  md.core.ruler.before('normalize', 'remove_comments', (state: any) => {
    state.src = removeMarkdownComments(state.src)
  })
}
