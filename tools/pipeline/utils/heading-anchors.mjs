/**
 * Upstream docs derive heading anchors from the English heading text, and
 * cross-page links are written against those anchors (`typecasts.md#intersection-types`).
 * Translating a heading changes the text the anchor is generated from, so every
 * such link silently lands at the top of the page instead of the section.
 *
 * The fix is to give the translated heading the upstream anchor explicitly.
 * VitePress runs markdown-it-attrs, so a trailing `{id="..."}` sets the id —
 * the same form ~4k upstream headings already use when their author pinned an
 * anchor by hand.
 */

// Any indentation: a fence inside a list item is indented with the item, four
// spaces and more under a nested one, and is a fence all the same.
const FENCE = /^\s*(`{3,}|~{3,})(.*)$/
const ATX = /^(\s{0,3})(#{1,6})\s+(.*)$/
const ATTR_BLOCK = /\s*\{([^{}]*)\}\s*$/
// markdown-it-attrs syntax: `#id`, `.class`, `key`, `key=value`, `key="value"`.
// Heading text can end in braces of its own — `-target {es5|es2015|es2020}`,
// `-Xcompiler-plugin-order={plugin.before>plugin.after}` — and those are text.
const ATTR_TOKEN = /^(#[\w-]+|\.[\w-]+|[\w-]+(=("[^"]*"|'[^']*'|[^\s"'{}=]+))?)$/
// `# --8<-- [start:name]` is a pymdownx.snippets region marker, not a heading.
// Koog writes them with a leading `#` so MkDocs hides them from the rendered
// snippet, which makes them indistinguishable from an H1 by shape alone.
const SNIPPET_MARKER = /^-{2}8<-{2}(\s|$)/
// The rendered page opens with an H1 built from the document title, so the
// title claims an anchor even though it is not a heading in the file.
const TITLE = [/^\[\/\/\]: # \(title:\s*(.*?)\)\s*$/m, /^---\n[\s\S]*?^title:\s*(.+?)\s*$/m]
// Latin words a translation keeps from its source: names, identifiers, versions.
const LATIN_WORD = /[a-z][a-z0-9]+|[0-9]+(?:\.[0-9]+)+/g

/**
 * Derive the anchor an upstream heading would have had. Writerside and MkDocs
 * both lowercase the text and join the remaining word characters with hyphens.
 */
export function headingAnchor(text) {
  return stripInlineMarkup(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Heading lines outside fenced code blocks, in document order.
 * `attrs` is the trailing `{...}` block, if the heading carries one.
 */
export function listHeadings(markdown) {
  const lines = markdown.split('\n')
  const code = codeLines(lines)
  const headings = []

  for (let index = 0; index < lines.length; index++) {
    if (code[index]) continue

    const match = lines[index].match(ATX)
    if (!match) continue

    const [, indent, hashes, rest] = match
    if (SNIPPET_MARKER.test(rest.trim())) continue

    const attrMatch = matchAttrBlock(rest)
    headings.push({
      index,
      indent,
      level: hashes.length,
      text: attrMatch ? rest.slice(0, attrMatch.index) : rest,
      attrs: attrMatch ? attrMatch[1] : null,
    })
  }

  return headings
}

/**
 * For each line, whether it belongs to a fenced code block, fence lines included.
 * @param {string[]} lines
 * @returns {boolean[]}
 */
export function codeLines(lines) {
  const code = []
  let fence = null

  for (const line of lines) {
    const fenceMatch = line.match(FENCE)
    // A backtick fence has no backtick in its info string: ```a``` opening a
    // line is inline code.
    if (fenceMatch && !(fenceMatch[1][0] === '`' && fenceMatch[2].includes('`'))) {
      const [, marker, info] = fenceMatch
      // A fence closes only on the same character, at least as many of it, and
      // with nothing after it. So neither a ``` line inside a ```` block nor a
      // ```kotlin line inside an unterminated ``` block ends the block — and an
      // unterminated fence swallows the rest of the file, exactly as the
      // Markdown renderer sees it.
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length && !info.trim()) fence = null
      code.push(true)
      continue
    }
    code.push(fence !== null)
  }

  return code
}

/**
 * Copy the source document's heading anchors onto the translated document.
 *
 * Headings are paired by position: translation preserves document structure, so
 * heading N of the translation is heading N of the source. When the documents
 * disagree — the translation dropped a heading, or predates one upstream added —
 * see pairHeadings: only the headings whose counterpart is certain get an
 * anchor. A wrong anchor is worse than a missing one.
 *
 * @returns {{content: string, added: number, drift: string | null, unpaired: number}}
 *   `drift` describes how the structures disagree, `unpaired` counts the
 *   translated headings left without a counterpart because of it.
 */
export function applySourceAnchors(translated, source) {
  const sourceHeadings = listHeadings(source)
  const targetHeadings = listHeadings(translated)
  const { pairs, drift } = pairHeadings(sourceHeadings, targetHeadings)

  const lines = translated.split('\n')
  const used = new Set(
    targetHeadings.map((h) => h.attrs?.match(/\bid="([^"]+)"/)?.[1]).filter(Boolean)
  )
  const titleAnchor = documentTitleAnchor(translated)
  if (titleAnchor) used.add(titleAnchor)
  let added = 0

  targetHeadings.forEach((target, i) => {
    const from = pairs.get(i)
    if (!from) return
    // The H1 is the page title: VitePress reads its raw text for <title>, so an
    // attribute block there leaks into the browser tab. Nothing links to a
    // page's own title anchor anyway.
    if (target.level === 1) return
    if (target.attrs && /(^|\s)(id=|#)/.test(target.attrs)) return

    const anchor = from.attrs
      ? (from.attrs.match(/\bid="([^"]+)"/)?.[1] ?? headingAnchor(from.text))
      : headingAnchor(from.text)
    // A heading with no ASCII word characters (an upstream heading that is
    // itself CJK, say) has no anchor worth preserving.
    if (!anchor) return
    // Two headings can share a slug; upstream links then point at the first.
    // Leave the later ones to VitePress rather than inventing a suffix — ids
    // have to stay unique within a page or the build fails.
    if (used.has(anchor)) return
    used.add(anchor)

    const hashes = '#'.repeat(target.level)
    const text = target.text.trimEnd()
    const attrs = target.attrs ? `${target.attrs.trim()} id="${anchor}"` : `id="${anchor}"`
    lines[target.index] = `${target.indent}${hashes} ${text} {${attrs}}`
    added++
  })

  return {
    content: lines.join('\n'),
    added,
    drift,
    unpaired: targetHeadings.length - pairs.size,
  }
}

/**
 * Pair translated headings with source headings: translated index → source heading.
 *
 * Same count and levels throughout: heading N is heading N. Otherwise the
 * headings are walked from the front and from the back while level and Latin
 * words agree, which places one dropped or added heading exactly: the front
 * walk is right up to it, the back walk from it on. Heading levels repeat, so
 * the front walk can run on past the gap and pair the wrong headings — but the
 * back walk then claims those same headings with other partners. A heading
 * claimed differently by the two walks is ambiguous and left unpaired, as is
 * anything neither walk reached.
 */
export function pairHeadings(sourceHeadings, targetHeadings) {
  const pairs = new Map()
  const sameShape =
    sourceHeadings.length === targetHeadings.length &&
    targetHeadings.every((h, i) => h.level === sourceHeadings[i].level)
  if (sameShape) {
    targetHeadings.forEach((_, i) => pairs.set(i, sourceHeadings[i]))
    return { pairs, drift: null }
  }

  const drift =
    sourceHeadings.length !== targetHeadings.length
      ? `heading count differs (source ${sourceHeadings.length}, translation ${targetHeadings.length})`
      : `heading level differs at #${targetHeadings.findIndex((h, i) => h.level !== sourceHeadings[i].level) + 1}`

  const candidates = [] // [targetIndex, sourceIndex]
  const shorter = Math.min(sourceHeadings.length, targetHeadings.length)
  for (let i = 0; i < shorter && matches(sourceHeadings[i], targetHeadings[i]); i++) {
    candidates.push([i, i])
  }
  for (let k = 1; k <= shorter; k++) {
    const t = targetHeadings.length - k
    const s = sourceHeadings.length - k
    if (!matches(sourceHeadings[s], targetHeadings[t])) break
    candidates.push([t, s])
  }

  const byTarget = new Map()
  const bySource = new Map()
  const claim = (map, key, value) => map.set(key, map.has(key) && map.get(key) !== value ? -1 : value)
  for (const [t, s] of candidates) {
    claim(byTarget, t, s)
    claim(bySource, s, t)
  }
  for (const [t, s] of byTarget) {
    if (s !== -1 && bySource.get(s) === t) pairs.set(t, sourceHeadings[s])
  }
  return { pairs, drift }
}

/**
 * Whether two headings can be the same heading: same level, and every Latin
 * word the translation kept comes from the source heading — give or take an
 * ending: "API" translates "APIs".
 */
function matches(source, target) {
  if (source.level !== target.level) return false
  const words = source.text.toLowerCase().match(LATIN_WORD) ?? []
  return (target.text.toLowerCase().match(LATIN_WORD) ?? []).every((kept) =>
    words.some((word) => word.startsWith(kept) || kept.startsWith(word))
  )
}

/** The trailing `{...}` of a heading, when it is an attribute block and not text. */
function matchAttrBlock(rest) {
  const match = rest.match(ATTR_BLOCK)
  if (!match) return null
  const tokens = match[1].match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? []
  return tokens.length > 0 && tokens.every((token) => ATTR_TOKEN.test(token)) ? match : null
}

function documentTitleAnchor(markdown) {
  for (const pattern of TITLE) {
    const match = markdown.match(pattern)
    if (match) return headingAnchor(match[1])
  }
  return ''
}

function stripInlineMarkup(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/[*_]{1,3}/g, '') // emphasis
    .trim()
}
