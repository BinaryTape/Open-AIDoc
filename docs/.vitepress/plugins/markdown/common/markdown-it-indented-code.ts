/**
 * Parses a code block written by indenting it four spaces as a fenced code
 * block with no language. markdown-it renders it as a bare <pre><code>, which
 * VitePress's code block styles do not cover: no background, 16px text, and
 * no scrolling of its own, so a long line made a phone's page wider than its
 * screen (the example output on Koog pages, the licence on coil/overview).
 * kotlinlang.org shows such a block as a code block with no language, and so
 * do the MkDocs sites (P2-56).
 *
 * The token changes as the block rule makes it, so that every later rule and
 * renderer that handles fences handles it too.
 */
export default function markdownItIndentedCode(md: any) {
  const rule = md.block.ruler.__rules__.find((r: any) => r.name === 'code')
  if (!rule) throw new Error('markdown-it has no "code" block rule')
  const parse = rule.fn
  md.block.ruler.at('code', (state: any, startLine: number, endLine: number, silent: boolean) => {
    const length = state.tokens.length
    if (!parse(state, startLine, endLine, silent)) return false
    const token = state.tokens[length]
    if (!silent && token?.type === 'code_block') {
      token.type = 'fence'
      token.tag = 'code'
      token.info = ''
      token.markup = '```'
    }
    return true
  })
}
