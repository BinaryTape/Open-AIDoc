import { isMkDocsDoc } from '../../../utils/doctype-utils'
import { pageMessage } from '../../../utils/page-messages'

// Material for MkDocs admonitions (`!!!`) and collapsible blocks (`???`,
// `???+`), as Material renders them: a box with a type class and a title,
// styled by styles/mk-admonition.css.
export default function markdownItMkAdmonition(md: any) {
  function transformAdmonitions(state: any) {
    if (!isMkDocsDoc(state.env)) return
    state.src = transformLines(state.src.split('\n'), state.env.relativePath).join('\n')
  }

  function transformLines(lines: string[], relativePath: string | undefined): string[] {
    const output: string[] = []
    let index = 0
    let fence: string | null = null

    while (index < lines.length) {
      const line = lines[index]
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
      if (fenceMatch) {
        const marker = fenceMatch[1][0]
        fence = fence === marker ? null : (fence ?? marker)
        output.push(line)
        index++
        continue
      }

      const match = !fence && line.match(
        /^(\s*)(!!!|\?\?\?\+?)\s+(?:([\w-]+)\s*)?(?:"([^"]*)")?\s*$/
      )
      if (!match) {
        output.push(line)
        index++
        continue
      }

      const leading = match[1]
      const marker = match[2]
      const originalType = (match[3] || 'note').toLowerCase()
      const type = admonitionType(originalType)
      const title = match[4] ?? defaultTitle(originalType, relativePath)
      const contentIndent = leading + '    '
      const content: string[] = []
      let cursor = index + 1
      let contentFence: string | null = null

      while (cursor < lines.length) {
        const contentLine = lines[cursor]
        const strippedLine = contentLine.startsWith(contentIndent)
          ? contentLine.slice(contentIndent.length)
          : contentLine
        const contentFenceMatch = strippedLine.match(/^\s*(`{3,}|~{3,})/)

        if (contentFence) {
          content.push(strippedLine)
          if (
            contentFenceMatch?.[1][0] === contentFence[0] &&
            contentFenceMatch[1].length >= contentFence.length
          ) contentFence = null
          cursor++
          continue
        }
        if (contentLine.startsWith(contentIndent)) {
          content.push(strippedLine)
          if (contentFenceMatch) contentFence = contentFenceMatch[1]
          cursor++
          continue
        }
        if (contentLine.trim() === '') {
          content.push('')
          cursor++
          continue
        }
        break
      }

      if (contentFence) content.push(contentFence)

      while (content.at(-1) === '') content.pop()
      if (content.length === 0) {
        output.push(line)
        index++
        continue
      }

      const transformedContent = transformLines(content, relativePath)
        .map((contentLine) => contentLine ? leading + contentLine : '')

      const className = `mk-admonition mk-admonition--${type}`
      const escapedTitle = md.utils.escapeHtml(title)
      if (marker === '!!!') {
        output.push(`${leading}<div class="${className}">`)
        // `!!! note ""` has no title bar, as in Material.
        if (escapedTitle) output.push(`${leading}<p class="mk-admonition__title">${escapedTitle}</p>`)
      } else {
        const open = marker === '???+' ? ' open' : ''
        output.push(`${leading}<details${open} class="${className}">`)
        output.push(`${leading}<summary class="mk-admonition__title">${escapedTitle}</summary>`)
      }
      output.push('')
      output.push(...transformedContent)
      output.push('')
      output.push(`${leading}</${marker === '!!!' ? 'div' : 'details'}>`)
      // A blank line is required to prevent Markdown following this raw HTML
      // block from being consumed as unparsed content.
      output.push('')

      index = cursor
    }

    return output
  }

  md.core.ruler.before('normalize', 'mkdocs_admonition_transform', transformAdmonitions)
}

// Material's admonition types (each has its own icon and colour), plus
// Koog's `beta`. Material styles a block of any other class as a note.
const ADMONITION_TYPES = new Set([
  'note', 'abstract', 'info', 'tip', 'success', 'question', 'warning',
  'failure', 'danger', 'bug', 'example', 'quote', 'beta',
])

// Material's aliases share their type's icon and colour.
const ALIASES: Record<string, string> = {
  summary: 'abstract',
  tldr: 'abstract',
  todo: 'info',
  hint: 'tip',
  important: 'tip',
  check: 'success',
  done: 'success',
  help: 'question',
  faq: 'question',
  caution: 'warning',
  attention: 'warning',
  fail: 'failure',
  missing: 'failure',
  error: 'danger',
  cite: 'quote',
}

function admonitionType(type: string): string {
  const resolved = ALIASES[type] ?? type
  return ADMONITION_TYPES.has(resolved) ? resolved : 'note'
}

// Python-Markdown titles a block without a title after its type ("Note");
// for a known type we use that word in the page's language.
function defaultTitle(type: string, relativePath: string | undefined): string {
  const resolved = ALIASES[type] ?? type
  return (ADMONITION_TYPES.has(resolved) && pageMessage(relativePath, `admonition.${resolved}`))
    || type.charAt(0).toUpperCase() + type.slice(1)
}
