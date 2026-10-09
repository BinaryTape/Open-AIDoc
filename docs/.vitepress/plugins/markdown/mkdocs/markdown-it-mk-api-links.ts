import type MarkdownIt from 'markdown-it'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Koog links to its API reference as `[AIAgent](api:agents-core::ai.koog.agents.core.agent.AIAgent)`.
 * The docs pipeline resolves those keys on every Koog sync
 * (tools/pipeline/utils/koog-api-links.mjs) into
 * docs/.vitepress/variables/koog-api-links.json; this replaces each `api:`
 * link with its URL, and renders a link to a key that did not resolve as
 * plain text rather than a dead link.
 */
const LINKS_FILE = 'docs/.vitepress/variables/koog-api-links.json'

let links: Record<string, string> | null = null

function loadLinks(): Record<string, string> {
  if (links) return links
  try {
    links = JSON.parse(fs.readFileSync(path.resolve(LINKS_FILE), 'utf8'))
  } catch {
    links = {}
  }
  return links!
}

export function resolveApiHref(href: string, table: Record<string, string> = loadLinks()): string | null {
  let key = href.slice('api:'.length)
  try {
    key = decodeURI(key)
  } catch {
    // keep the key as written
  }
  return table[key] ?? null
}

export default function markdownItMkApiLinks(md: MarkdownIt, table?: Record<string, string>) {
  md.core.ruler.after('inline', 'mk-api-links', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue

      const children = token.children
      for (let i = 0; i < children.length; i++) {
        const open = children[i]
        if (open.type !== 'link_open') continue
        const href = open.attrGet('href')
        if (!href?.startsWith('api:')) continue

        const url = resolveApiHref(href, table)
        if (url) {
          open.attrSet('href', url)
          continue
        }

        // Unresolved: keep the link text, drop the link
        let depth = 0
        for (let j = i + 1; j < children.length; j++) {
          if (children[j].type === 'link_open') depth++
          if (children[j].type === 'link_close' && depth-- === 0) {
            children.splice(j, 1)
            break
          }
        }
        children.splice(i, 1)
        i--
      }
    }
  })
}
