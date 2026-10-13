// @ts-ignore - no type declarations available
import markdownItContainer from 'markdown-it-container'
import { isWritersideDoc } from '../../../utils/doctype-utils'
import { calloutClass, calloutLabel, isCalloutType, type CalloutType } from '../../../utils/ws-callout'

// Writerside callouts. A blockquote followed by a `{style="note|tip|warning"}`
// line (or ending with a `> {style="…"}` line) becomes a callout of that
// style; any other blockquote in a Writerside topic is a tip, as on the
// upstream sites.
//
// The source may have CRLF or LF line endings: the local Windows checkout has
// CRLF, the production build on Linux LF.

const QUOTE_LINE = /^([ \t]*)>/
const ATTR_LIST = /^\{((?:[ \t]*[\w-]+="[^"]*")+)[ \t]*\}$/
const FENCE = /^[ \t]*(`{3,}|~{3,})/

export default function markdownItWsContainer(md: any) {
  const escape = md.utils.escapeHtml

  const open = (type: CalloutType, env: any, id?: string) => {
    const path = env?.relativePath
    const idAttr = id ? ` id="${escape(id)}"` : ''
    return `<div${idAttr} class="${calloutClass(type, path)}" role="note" aria-label="${escape(calloutLabel(type, path))}">\n`
  }

  md.core.ruler.before('normalize', 'ws_callouts', (state: any) => {
    if (!isWritersideDoc(state.env)) return
    state.src = transformCallouts(state.src.split(/\r?\n/)).join('\n')
  })

  md.use(markdownItContainer, 'ws-callout', {
    render: (tokens: any[], idx: number, _options: any, env: any) => {
      if (tokens[idx].nesting !== 1) return '</div>\n'
      const [, type, id] = tokens[idx].info.trim().split(/\s+/)
      return open(type, env, id)
    }
  })

  const renderBlockquoteOpen = md.renderer.rules.blockquote_open ??
    ((tokens: any[], idx: number, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options))
  const renderBlockquoteClose = md.renderer.rules.blockquote_close ??
    ((tokens: any[], idx: number, options: any, _env: any, self: any) => self.renderToken(tokens, idx, options))

  md.renderer.rules.blockquote_open = (tokens: any[], idx: number, options: any, env: any, self: any) =>
    isWritersideDoc(env) ? open('tip', env) : renderBlockquoteOpen(tokens, idx, options, env, self)
  md.renderer.rules.blockquote_close = (tokens: any[], idx: number, options: any, env: any, self: any) =>
    isWritersideDoc(env) ? '</div>\n' : renderBlockquoteClose(tokens, idx, options, env, self)
}

function transformCallouts(lines: string[]): string[] {
  const output: string[] = []
  let fence: string | null = null

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    if (fence) {
      if (line.trim().startsWith(fence) && line.trim().replace(/[`~]/g, '') === '') fence = null
      output.push(line)
      continue
    }
    const fenceMatch = line.match(FENCE)
    if (fenceMatch) {
      fence = fenceMatch[1]
      output.push(line)
      continue
    }

    const quoteMatch = line.match(QUOTE_LINE)
    if (!quoteMatch) {
      output.push(line)
      continue
    }

    let end = index
    while (end + 1 < lines.length && QUOTE_LINE.test(lines[end + 1])) end++
    let body = lines.slice(index, end + 1).map(stripQuoteMarker)
    let consumedUpTo = end

    // The style follows the blockquote, or is its last line.
    let attrs = parseAttrList(lines[end + 1])
    if (attrs) {
      consumedUpTo = end + 1
    } else {
      attrs = parseAttrList(body.at(-1))
      if (attrs) body = body.slice(0, -1)
    }

    const type = attrs?.style ?? attrs?.type
    while (body.length && body[0].trim() === '') body.shift()
    while (body.length && body.at(-1)!.trim() === '') body.pop()

    if (!type || !isCalloutType(type) || body.length === 0) {
      output.push(...lines.slice(index, end + 1))
      index = end
      continue
    }

    const indent = quoteMatch[1]
    const id = attrs?.id && /^[\w-]+$/.test(attrs.id) ? ` ${attrs.id}` : ''
    output.push(`${indent}::: ws-callout ${type}${id}`)
    output.push(...body.map((bodyLine) => bodyLine.trim() ? indent + bodyLine : ''))
    output.push(`${indent}:::`)
    index = consumedUpTo
  }

  return output
}

// `> text` → `text`, keeping the indentation of nested Markdown.
function stripQuoteMarker(line: string): string {
  return line.replace(/^[ \t]*>[ \t]?/, '')
}

function parseAttrList(line: string | undefined): Record<string, string> | null {
  const match = line?.trim().match(ATTR_LIST)
  if (!match) return null
  return Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
}
