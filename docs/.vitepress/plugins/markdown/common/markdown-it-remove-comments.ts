/**
 * Hides Markdown comments: `[//]: # (text)`.
 *
 * markdown-it only hides such a comment when it happens to be a valid link
 * reference definition. Upstream sources break that in several ways, and the
 * comment then shows up as page text:
 * - parentheses in the text: `[//]: # (description: … (KSP) …)`
 * - punctuation after it: `[//]: # (TODO …).`
 * - HTML spread over several lines, whose `</p>` ends the paragraph early
 *   (and nests a `<p>` in a `<p>`, breaking hydration)
 * The upstream sites hide all of these.
 *
 * A block rule, so markdown-it has already settled fences, lists and
 * blockquotes: a comment in a code sample never reaches it. A comment starts
 * a block and runs until its parentheses balance, ignoring backslash
 * escapes, without crossing a blank line or leaving its container; a `.` or
 * `。` after it goes with it. Anything that does not close cleanly is left to
 * the other rules.
 */
const COMMENT_START = '[//]: # ('
const TRAILING = /^[.。]?\s*$/

function lineText(state: any, line: number): string {
  return state.src.slice(state.bMarks[line] + state.tShift[line], state.eMarks[line])
}

function comment(state: any, startLine: number, endLine: number, silent: boolean): boolean {
  if (state.sCount[startLine] - state.blkIndent >= 4) return false
  const first = lineText(state, startLine)
  if (!first.startsWith(COMMENT_START)) return false

  let depth = 0
  for (let line = startLine; line < endLine; line++) {
    if (line > startLine && (state.isEmpty(line) || state.sCount[line] < state.blkIndent)) return false
    const text = line === startLine ? first.slice(COMMENT_START.length - 1) : lineText(state, line)
    for (let k = 0; k < text.length; k++) {
      const c = text[k]
      if (c === '\\') k++
      else if (c === '(') depth++
      else if (c === ')' && --depth === 0) {
        if (!TRAILING.test(text.slice(k + 1))) return false
        if (!silent) state.line = line + 1
        return true
      }
    }
  }
  return false
}

export default function markdownItRemoveComments(md: any) {
  // Before `reference`, which would take the comments it can parse and show
  // the rest. Like a heading, a comment may interrupt a paragraph.
  md.block.ruler.before('reference', 'md_comment', comment, { alt: ['paragraph', 'reference'] })
}
