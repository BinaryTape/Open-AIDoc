/**
 * Writerside marks file names, UI labels and keys with inline tags:
 *
 *   Open the <path>application.conf</path> file placed in <path>src/main/resources</path>.
 *
 * Models translating these files sometimes wrap such a tag in backticks as
 * well (`` `<Path>application.conf</Path>` ``). That turns it into inline code,
 * and the page shows the tag itself instead of a highlighted path.
 *
 * Take the backticks off again, for a tag the source never writes inside
 * backticks; a source that does is talking about the tag, and is left alone.
 */

const TAGS = ['path', 'ui-path', 'control', 'shortcut', 'emphasis']
const FENCE = /^\s{0,3}(`{3,}|~{3,})(.*)$/
// A single backtick on each side, around one whole tag
const CODED = new RegExp(`(?<!\`)\`(<(${TAGS.join('|')})>[^\`<]*</\\2>)\`(?!\`)`, 'gi')

/**
 * @returns {{content: string, unwrapped: number}}
 */
export function unwrapCodedTags(translated, source) {
  const codedInSource = new Set(
    [...source.matchAll(new RegExp(`\`<(${TAGS.join('|')})>`, 'gi'))].map(([, tag]) => tag.toLowerCase())
  )

  let unwrapped = 0
  let fence = null
  const lines = translated.split('\n').map((line) => {
    const fenceMatch = line.match(FENCE)
    if (fenceMatch) {
      const [, marker, info] = fenceMatch
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length && !info.trim()) fence = null
      return line
    }
    if (fence) return line

    return line.replace(CODED, (match, tagged, tag) => {
      if (codedInSource.has(tag.toLowerCase())) return match
      unwrapped++
      return tagged
    })
  })

  return { content: lines.join('\n'), unwrapped }
}
