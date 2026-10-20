/**
 * Writerside code block attributes, written on the line after the closing
 * fence:
 *
 *   ```kotlin
 *   fun main() {}
 *   ```
 *   {collapsible="true" collapsed-title="Example solution" kotlin-runnable="true"}
 *
 * markdown-it-ws-remove-code-attr keeps them on the fence token
 * (`token.meta.wsAttrs`) for the plugins that act on them: collapsible code
 * blocks, and later runnable ones (kotlin-runnable).
 */
export type CodeBlockAttrs = Record<string, string>

// Values in double or single quotes: collapsed-title='version.set("7.8.0")'.
const ATTR_LINE = /^\{\s*((?:[\w-]+\s*=\s*(?:"[^"]*"|'[^']*')\s*)+)\}$/
const ATTR = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

/** The attributes of a `{name="value" …}` line, or null when it is not one. */
export function parseCodeBlockAttrs(line: string): CodeBlockAttrs | null {
  const match = ATTR_LINE.exec(line.trim())
  if (!match) return null
  return Object.fromEntries([...match[1].matchAll(ATTR)].map(([, name, double, single]) => [name, double ?? single]))
}

/** The attributes markdown-it-ws-remove-code-attr kept on a fence token. */
export function codeBlockAttrs(token: { meta?: { wsAttrs?: CodeBlockAttrs } | null }): CodeBlockAttrs {
  return token.meta?.wsAttrs ?? {}
}
