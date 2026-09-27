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

const FENCE = /^\s{0,3}(`{3,}|~{3,})(.*)$/
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
  const headings = []
  let fence = null

  for (let index = 0; index < lines.length; index++) {
    const fenceMatch = lines[index].match(FENCE)
    if (fenceMatch) {
      const [, marker, info] = fenceMatch
      // A fence closes only on the same character, at least as many of it, and
      // with nothing after it. So neither a ``` line inside a ```` block nor a
      // ```kotlin line inside an unterminated ``` block ends the block — and an
      // unterminated fence swallows the rest of the file, exactly as the
      // Markdown renderer sees it.
      if (!fence) fence = marker
      else if (marker[0] === fence[0] && marker.length >= fence.length && !info.trim()) fence = null
      continue
    }
    if (fence) continue

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
 * Copy the source document's heading anchors onto the translated document.
 *
 * Headings are paired by position: translation preserves document structure, so
 * heading N of the translation is heading N of the source. If the documents
 * disagree on how many headings there are, or on their levels, the translation
 * is returned untouched. Partial alignment is not worth attempting — heading
 * levels repeat, so a translation that dropped one heading would silently pair
 * every heading after it with the wrong anchor, and a wrong anchor is worse
 * than a missing one. Such a file needs re-translating, and the caller reports
 * it rather than papering over it.
 *
 * @returns {{content: string, added: number, skipped: string | null}}
 */
export function applySourceAnchors(translated, source) {
  const sourceHeadings = listHeadings(source)
  const targetHeadings = listHeadings(translated)

  if (sourceHeadings.length !== targetHeadings.length) {
    return {
      content: translated,
      added: 0,
      skipped: `heading count differs (source ${sourceHeadings.length}, translation ${targetHeadings.length})`,
    }
  }
  const levelDrift = targetHeadings.findIndex((h, i) => h.level !== sourceHeadings[i].level)
  if (levelDrift !== -1) {
    return { content: translated, added: 0, skipped: `heading level differs at #${levelDrift + 1}` }
  }

  const lines = translated.split('\n')
  const used = new Set(
    targetHeadings.map((h) => h.attrs?.match(/\bid="([^"]+)"/)?.[1]).filter(Boolean)
  )
  const titleAnchor = documentTitleAnchor(translated)
  if (titleAnchor) used.add(titleAnchor)
  let added = 0

  targetHeadings.forEach((target, i) => {
    // The H1 is the page title: VitePress reads its raw text for <title>, so an
    // attribute block there leaks into the browser tab. Nothing links to a
    // page's own title anchor anyway.
    if (target.level === 1) return
    if (target.attrs && /(^|\s)(id=|#)/.test(target.attrs)) return

    const from = sourceHeadings[i]
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

  return { content: lines.join('\n'), added, skipped: null }
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
