/**
 * Trims the info string of fenced code blocks: "``` kotlin" (a space before
 * the language, as some MkDocs sources write it) keeps the space in
 * `token.info`, and VitePress reads the language with an anchored pattern
 * that then finds none, so the block had no language and no highlighting.
 * markdown-it's own renderer trims it the same way.
 */
export default function markdownItFenceInfoTrim(md: any) {
  md.core.ruler.after('block', 'fence_info_trim', (state: any) => {
    for (const token of state.tokens) {
      if (token.type === 'fence') token.info = token.info.trim()
    }
  })
}
