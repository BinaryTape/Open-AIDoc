import fs from 'node:fs'
import path from 'node:path'
import { getDocType } from '../../../utils/doctype-utils'

/**
 * Writerside marks a topic or a section with secondary labels, each on a line
 * of its own under the heading:
 *
 *   ### Simplified setup for Kotlin projects
 *   <secondary-label ref="maven"/>
 *
 * Vue takes `ref` for a template ref, so the tag rendered empty. kotlinlang.org
 * shows a row of coloured labels under the heading; render the same row, from
 * the labels the docs pipeline copies out of the repository's labels.list
 * (tools/pipeline/utils/writerside-labels.mjs), styled by styles/ws-label.css:
 *
 *   <div class="ws-labels"><span class="ws-label ws-label--red">Maven</span></div>
 */

interface Label { name: string, color?: string, description?: string }
interface Labels { secondary?: Record<string, Label> }

const LABELS_DIR = path.resolve('docs/.vitepress/labels')
const LABEL_RE = /<secondary-label\s+ref="([^"]*)"\s*\/?>(?:\s*<\/secondary-label>)?/g
const ONLY_LABELS_RE = /^\s*(?:<secondary-label\s+ref="[^"]*"\s*\/?>(?:\s*<\/secondary-label>)?\s*)+$/

const cache = new Map<string, Labels>()

function labelsOf(docType: string | null): Labels {
  if (!docType) return {}
  if (!cache.has(docType)) {
    const file = path.join(LABELS_DIR, `${docType}.json`)
    cache.set(docType, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {})
  }
  return cache.get(docType)!
}

/** The labels of the tags in this HTML, as one row. */
export function renderLabels(html: string, labels: Labels, escape: (text: string) => string, where = 'page', tag = 'div'): string {
  const items = [...html.matchAll(LABEL_RE)].map(([, ref]) => {
    const label = labels.secondary?.[ref]
    if (!label) console.warn(`[secondary-label] ${where}: no label "${ref}" in labels.list`)
    const color = label?.color && /^[a-z]+$/.test(label.color) ? label.color : 'default'
    const title = label?.description ? ` title="${escape(label.description)}"` : ''
    return `<span class="ws-label ws-label--${color}"${title}>${escape(label?.name ?? ref)}</span>`
  })
  return `<${tag} class="ws-labels">${items.join('')}</${tag}>`
}

export default function markdownItWsSecondaryLabel(md: any) {
  md.core.ruler.after('inline', 'ws_secondary_label', (state: any) => {
    if (!state.src.includes('<secondary-label')) return
    const labels = labelsOf(getDocType(state.env))
    const where = state.env?.relativePath ?? 'page'
    const escape = (text: string) => md.utils.escapeHtml(text)
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      // A run of label lines: one row of labels
      if ((token.type === 'html_inline' || token.type === 'html_block') && ONLY_LABELS_RE.test(token.content)) {
        let html = token.content
        let end = i + 1
        for (;;) {
          while (end < tokens.length && tokens[end].type === 'inline' && !tokens[end].content.trim()) end++
          const next = tokens[end]
          if (!next || !(next.type === 'html_inline' || next.type === 'html_block') || !ONLY_LABELS_RE.test(next.content)) break
          html += next.content
          end++
        }
        token.content = renderLabels(html, labels, escape, where) + (token.type === 'html_block' ? '\n' : '')
        tokens.splice(i + 1, end - i - 1)
        continue
      }
      // A label inside a line of text
      for (const child of token.children ?? []) {
        if (child.type === 'html_inline' && child.content.includes('<secondary-label')) {
          child.content = child.content.replace(LABEL_RE, (match: string) => renderLabels(match, labels, escape, where, 'span'))
        }
      }
    }
  })
}
