import type MarkdownIt from 'markdown-it'
import { SITE_LOCALES } from '../../../locales.config'
import { DOCS_TYPES, DocsTypeConfig } from '../../../docs.config'
import path from 'path'

export interface RewriteLinkOptions {
  rewriteHref: (env, href: string) => string
}

// Options for rewriting links in markdown
// rewriteHref: Function to transform href URLs by adding locale and doc type paths
const rewiteOptions: RewriteLinkOptions = {
  rewriteHref: (env, href) => {
    const parts = env.relativePath.split('/')
    const docType = parts.find(p => DOCS_TYPES.includes(p))
    if (!docType) return href

    const rewriteForDocType = DocsTypeConfig[docType].rewriteHref
    if (rewriteForDocType) {
      return rewriteForDocType(env, href)
    }

    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(href) ||
      href.startsWith('/') ||
      href.startsWith('#')) {
      return href
    }

    if (docType === 'sqldelight' && (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.gif'))) {
      const fileName = path.basename(href)
      return `/sqldelight/${fileName}`
    }

    if (docType === 'sqldelight') {

      if (!href.includes('/') && !href.startsWith('#') && !href.includes('.')) {
        // 这里假设这些引用是指向同目录下的md文件
        const currentDir = env.relativePath.split('/');
        currentDir.pop(); // 移除文件名

        // 构建相对于当前文件的路径
        return `/${currentDir.join('/')}/${href}.md`;
      }

      if (href.startsWith('../../')) {
        return 'https://sqldelight.github.io/sqldelight/latest/' + href.substring(6)
      } else if (href.startsWith('../2.x/')) {
        return 'https://sqldelight.github.io/sqldelight/latest/' + href.substring(3)
      } else if (href.startsWith('../')) {
        href = `${href.substring(2)}.md`
      } else {
        const currentDir = env.relativePath.split('/');
        currentDir.pop(); // 移除文件名

        // 构建相对于当前文件的路径
        return `/${currentDir.join('/')}/${href}.md`;
      }
    }
    const locale = parts.find(p => SITE_LOCALES.includes(p))
    const config = { locale, docType }
    const localePath = locale === undefined ? '' : `/${config.locale}`
    const docsPath = `/${config.docType}`
    return `${localePath}${docsPath}${href}`
  },
}

export function markdownItRewriteLinks(md: MarkdownIt) {

  md.core.ruler.before('inline', 'rewrite-inline-links', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      // 查找HTML标签开始
      if (token.type === 'html_block') {
        token.content = rewriteHtmlAttributes(
          token.content,
          ["src", "href"],
          (val) => rewiteOptions.rewriteHref(state.env, val)
        )
      }

      // 处理行内HTML标签
      if (token.type === 'inline' && token.content) {
        token.content = token.content.replace(
          /<img\s+([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
          (match, beforeSrc, srcValue, afterSrc) => {
            // 不处理已经以/或http开头的路径
            if (srcValue.startsWith('/') || srcValue.startsWith('http')) {
              return match
            }

            // 使用与其他链接相同的逻辑处理src路径
            const newSrc = rewiteOptions.rewriteHref(state.env, srcValue)
            return `<img ${beforeSrc}src="${newSrc}"${afterSrc}>`
          }
        )

        // 处理a标签
        token.content = token.content.replace(
          /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
          (match, beforeHref, hrefValue, afterHref) => {
            // External URLs do not need site-local rewriting.
            if (hrefValue.startsWith('http')) {
              return match
            }

            // 使用与其他链接相同的逻辑处理href路径
            const newHref = rewiteOptions.rewriteHref(state.env, hrefValue)
            return `<a ${beforeHref}href="${newHref}"${afterHref}>`
          }
        )
      }
    }
  })

  // 处理行内链接和图片标签
  md.core.ruler.after('inline', 'rewrite-inline-links', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'inline' && token.children) {
        for (let j = 0; j < token.children.length; j++) {
          const child = token.children[j]

          if (child.type === 'link_open' && child.attrs) {
            for (const attr of child.attrs) {
              if (attr[0] === 'href') {
                // 处理所有非 https:// 开头的链接
                attr[1] = rewiteOptions.rewriteHref(state.env, attr[1])
              }
            }
          }

          // 同样处理图片标签
          if (child.type === 'image' && child.attrs) {
            for (const attr of child.attrs) {
              if (attr[0] === 'src') {
                attr[1] = rewiteOptions.rewriteHref(state.env, attr[1])
              }
            }
          }
        }
      }
    }
  });
}

function rewriteHtmlAttributes(content, attrNames, rewriteFn) {
  return content.replace(
    // 匹配任意标签中的指定属性
    new RegExp(
      `(<[^>]*?\\s)(?:${attrNames.join("|")})\\s*=\\s*["']([^"']+)["']`,
      "gi"
    ),
    (match, before, value) => {
      // External URLs do not need site-local rewriting.
      if (/^https?:/i.test(value)) {
        return match
      }
      const newValue = rewriteFn(value)
      // 保留原属性名
      return match.replace(value, newValue)
    }
  )
}
