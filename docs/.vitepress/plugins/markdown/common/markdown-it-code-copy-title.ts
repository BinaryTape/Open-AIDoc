import { pageMessage } from '../../../utils/page-messages'

// The button VitePress puts in every code block (its title is one site-wide
// option, `markdown.codeCopyButtonTitle`). The code itself is escaped, so this
// cannot match the code's text.
const COPY_BUTTON = /<button title="[^"]*" class="copy">/g

/**
 * The copy button of a code block, titled in the page's language ("复制代码"
 * on a zh-Hans page, "コードをコピー" on a Japanese one) instead of "Copy Code"
 * on every page (P2-13). Registered after every other fence renderer, so that
 * it sees the code blocks they wrap too.
 */
export default function markdownItCodeCopyTitle(md) {
  const renderFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const html = renderFence(tokens, idx, options, env, self)
    const title = pageMessage(env?.relativePath, 'code.copy')
    return title ? html.replace(COPY_BUTTON, `<button title="${md.utils.escapeHtml(title)}" class="copy">`) : html
  }
}
