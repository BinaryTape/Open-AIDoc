// Process Material MKDocs custom link, and its icon shortcodes:
// :material-rocket-launch:{ .lg .middle } (see utils/mkdocs-icons.ts).
import { isMkDocsDoc } from '../../../utils/doctype-utils'
import { mkdocsIconClasses, mkdocsIconSvg } from '../../../utils/mkdocs-icons'

// A shortcode, then optional Material attribute classes: `{ .lg .middle }`.
const ICON = /:((?:material|octicons|fontawesome|simple)-[a-z0-9-]+):(?:\{([^}\n]*)\})?/g

/** The HTML of an icon, or null when the icon set does not have it. */
function iconHtml(name: string, attrs?: string): string | null {
  const svg = mkdocsIconSvg(name)
  if (!svg) return null
  const classes = mkdocsIconClasses(attrs)
  return `<span class="emoji${classes ? ' ' + classes : ''}">${svg}</span>`
}

export default function markdownItMkLinks(md) {

  const originalHtmlBlockRule = md.renderer.rules.html_block;

  // 使用 inline 级别的规则来处理任意行内的 emoji（包含链接文本、段落、标题等）
  md.core.ruler.after('inline', 'process_inline_emoji', function(state) {
    if (!isMkDocsDoc(state.env)) return;
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];

      // 处理所有 inline token 的 children（避免局限于标题）
      if (token.type === 'inline' && token.children) {
        for (let j = 0; j < token.children.length; j++) {
          const child = token.children[j];
          if (child.type === 'text' && child.content && child.content.includes(':')) {
            let match;
            let lastIndex = 0;
            const newTokens = [];
            ICON.lastIndex = 0;

            while ((match = ICON.exec(child.content)) !== null) {
              const html = iconHtml(match[1], match[2]);
              // 如果没有找到对应的图标，保持原样
              if (!html) continue;

              // 添加 emoji 前的文本
              if (match.index > lastIndex) {
                const textToken = new state.Token('text', '', 0);
                textToken.content = child.content.substring(lastIndex, match.index);
                newTokens.push(textToken);
              }

              const htmlToken = new state.Token('html_inline', '', 0);
              htmlToken.content = html;
              newTokens.push(htmlToken);

              lastIndex = ICON.lastIndex;
            }

            // 如果有新的标记，替换原来的标记
            if (newTokens.length > 0) {
              // 添加剩余的文本
              if (lastIndex < child.content.length) {
                const textToken = new state.Token('text', '', 0);
                textToken.content = child.content.substring(lastIndex);
                newTokens.push(textToken);
              }
              token.children.splice(j, 1, ...newTokens);
              j += newTokens.length - 1; // 调整索引
            }
          }
        }
      }
    }
  });

  md.renderer.rules.html_block = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const content = token.content;

    if (content.includes('markdown="1"')) {
      const pTagWithMarkdownRegex = /(<p[^>]*markdown="1"[^>]*>)([\s\S]*?)(<\/p>)/g;

      token.content = content.replace(pTagWithMarkdownRegex, function (match, openTag, innerContent, closeTag) {
        let processedContent = innerContent;

        processedContent = processedContent.replace(ICON, function (match, name, attrs) {
          return iconHtml(name, attrs) ?? match;
        });

        const doubleUnderscoreRegex = /__([^_]+?)__/g;
        processedContent = processedContent.replace(doubleUnderscoreRegex, '<strong>$1</strong>');

        return openTag + processedContent + closeTag;
      });

      // Warp in <p>
      token.content = token.content.replace(/(<hr\s*\/>)([\s\S]*?)(<\/div>)/g, function (match, hrTag, content, divCloseTag) {

        let processedContent = content;

        processedContent = processedContent.replace(/^\[:(.*?):(\s*)(.+?)]\(([^)]*)\)/gm, function (match, emojiName, space, classesText, url) {
          return `<a href="${url}">${iconHtml(emojiName) ?? `:${emojiName}:`} ${classesText}</a><br>`;
        });

        processedContent = processedContent.replace(/:([a-zA-Z0-9-]+):(\s*)(.+)/g, function (match, emojiName, space, classesText) {
          return `${iconHtml(emojiName) ?? `:${emojiName}:`} ${classesText}<br>`;
        });

        processedContent = processedContent.replace(/__([^_]+?)__/g, '<strong>$1</strong>');

        return hrTag + '<p>' + processedContent + '</p>' + divCloseTag;
      });
    }

    return originalHtmlBlockRule ? originalHtmlBlockRule(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };
}
