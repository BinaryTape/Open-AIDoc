/**
 * Writerside topics carry their title as a comment: `[//]: # (title: Strings)`.
 *
 * The title runs to the comment's last ")": titles can contain parentheses,
 * plain ("Enum classes (Enums)") or Markdown-escaped
 * ("Select expression \(experimental\)").
 */
export const TITLE_COMMENT_LINE = /^\[\/\/\]: # \(title:\s*(.*)\)\s*$/

/** The title as plain text, or null when the source has no title comment. */
export function parseTitleComment(source: string): string | null {
  for (const line of source.split(/\r?\n/)) {
    const title = line.match(TITLE_COMMENT_LINE)?.[1]
    if (title !== undefined) return title.trim().replace(/\\([\\()[\]])/g, '$1')
  }
  return null
}
