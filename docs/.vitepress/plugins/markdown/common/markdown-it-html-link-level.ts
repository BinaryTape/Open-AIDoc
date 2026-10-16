/**
 * Keeps linkify out of HTML links: `<a href="URL">URL</a>`.
 *
 * markdown-it's `html_inline` rule counts open `<a>` tags in
 * `state.linkLevel`, and its linkify rule skips text while that is above 0.
 * VitePress replaces `html_inline` with @mdit-vue/plugin-component's rule (to
 * allow Vue components), which does not count, so the URL text is linkified
 * into a second `<a>` inside the first. Browsers do not allow that and split
 * the link, which breaks hydration.
 *
 * Wraps the rule in place and counts as markdown-it does.
 */
const LINK_OPEN = /^<a[>\s]/i
const LINK_CLOSE = /^<\/a\s*>/i

export default function markdownItHtmlLinkLevel(md: any) {
  // The ruler has no getter: read the current rule (VitePress's) to wrap it.
  const rule = md.inline.ruler.__rules__.find((r: any) => r.name === 'html_inline')
  if (!rule) return
  const htmlInline = rule.fn

  md.inline.ruler.at('html_inline', (state: any, silent: boolean) => {
    const tokenCount = state.tokens.length
    if (!htmlInline(state, silent)) return false
    if (!silent && state.tokens.length > tokenCount) {
      const { content } = state.tokens[state.tokens.length - 1]
      if (LINK_OPEN.test(content)) state.linkLevel++
      if (LINK_CLOSE.test(content)) state.linkLevel--
    }
    return true
  })
}
