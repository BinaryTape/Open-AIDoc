/**
 * Keeps one of an attribute written twice on an element: Writerside sources
 * sometimes do (`{ width="450" width="706" }` on an image in ktor's
 * client-create-multiplatform-application), the attrs plugin adds both, and
 * Vue does not compile an element with a duplicate attribute. The last one
 * wins, as on ktor.io.
 */
export default function markdownItDedupeAttrs(md: any) {
  const dedupe = (tokens: any[]) => {
    for (const token of tokens) {
      if (token.attrs?.length > 1) {
        const last = new Map(token.attrs.map(([name]: [string], i: number) => [name, i]))
        token.attrs = token.attrs.filter(([name]: [string], i: number) => last.get(name) === i)
      }
      if (token.children) dedupe(token.children)
    }
  }
  md.core.ruler.push('dedupe_attrs', (state: any) => dedupe(state.tokens))
}
