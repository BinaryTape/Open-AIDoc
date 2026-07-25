import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type MarkdownIt from 'markdown-it'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function installKotlinCnLinkRewrite(md: MarkdownIt) {
  // Run after the shared Open AIDoc link rules. Those rules understand the
  // upstream document formats; this final pass maps their public routes into
  // the kotlin-cn satellite's directory layout.
  md.core.ruler.push('kotlin-cn-link-rewrite', (state) => {
    for (const token of state.tokens) {
      if (token.type === 'html_block') {
        token.content = rewriteHtmlHrefs(token.content)
      }

      if (!token.children) continue
      for (const child of token.children) {
        if (child.type === 'link_open' && child.attrs) {
          for (const attribute of child.attrs) {
            if (attribute[0] === 'href') {
              attribute[1] = rewriteKotlinCnHref(attribute[1])
            }
          }
        }

        if (child.type === 'html_inline') {
          child.content = rewriteHtmlHrefs(child.content)
        }
      }
    }
  })
}

export function rewriteKotlinCnHref(href: string) {
  if (
    !href ||
    href.startsWith('#') ||
    /^(?:mailto:|tel:|data:|javascript:|\/\/)/i.test(href)
  ) {
    return href
  }

  if (/^https?:/i.test(href)) {
    const url = new URL(href)
    if (url.hostname !== 'kotlinlang.org') return href

    const mappedPath = mapKotlinLangPath(url.pathname)
    const localRoute = mappedPath
      ? resolveExistingLocalRoute(mappedPath)
      : null
    return localRoute
      ? `${localRoute}${url.search}${url.hash}`
      : href
  }

  if (!href.startsWith('/')) return href

  const { pathname, suffix } = splitHref(href)
  const mappedPath = mapOpenAidocPath(pathname)
  if (!mappedPath) return href

  const localRoute = resolveExistingLocalRoute(mappedPath)
  return localRoute ? `${localRoute}${suffix}` : href
}

function mapKotlinLangPath(pathname: string) {
  const cleanPath = pathname.replace(/\.html$/, '')
  if (cleanPath === '/docs/multiplatform') {
    return '/docs/multiplatform/get-started'
  }
  if (cleanPath.startsWith('/docs/multiplatform/')) {
    return cleanPath
  }
  if (cleanPath === '/docs') {
    return '/docs/language/home'
  }
  if (cleanPath.startsWith('/docs/')) {
    return cleanPath.replace(/^\/docs\//, '/docs/language/')
  }
  return ''
}

function mapOpenAidocPath(pathname: string) {
  const cleanPath = pathname.replace(/\.html$/, '')
  if (cleanPath === '/kotlin' || cleanPath === '/docs/kotlin') {
    return '/docs/language/home'
  }
  if (cleanPath === '/kmp' || cleanPath === '/docs/kmp') {
    return '/docs/multiplatform/get-started'
  }
  if (cleanPath === '/koog') {
    return '/docs/koog/'
  }

  if (cleanPath.startsWith('/kotlin/')) {
    return cleanPath.replace(/^\/kotlin\//, '/docs/language/')
  }
  if (cleanPath.startsWith('/docs/kotlin/')) {
    return cleanPath.replace(/^\/docs\/kotlin\//, '/docs/language/')
  }
  if (cleanPath.startsWith('/kmp/')) {
    return cleanPath.replace(/^\/kmp\//, '/docs/multiplatform/')
  }
  if (cleanPath.startsWith('/docs/kmp/')) {
    return cleanPath.replace(/^\/docs\/kmp\//, '/docs/multiplatform/')
  }
  if (cleanPath.startsWith('/koog/')) {
    return cleanPath.replace(/^\/koog\//, '/docs/koog/')
  }

  if (
    cleanPath.startsWith('/docs/language/') ||
    cleanPath.startsWith('/docs/multiplatform/') ||
    cleanPath.startsWith('/docs/koog/')
  ) {
    return cleanPath
  }

  return ''
}

function resolveExistingLocalRoute(route: string) {
  const normalizedRoute = route.replace(/\/index$/, '/')
  const relativeRoute = normalizedRoute.replace(/^\/+/, '').replace(/\/$/, '')
  const directPage = resolve(siteRoot, `${relativeRoute}.md`)
  if (existsSync(directPage)) return `/${relativeRoute}`

  const indexPage = resolve(siteRoot, relativeRoute, 'index.md')
  if (existsSync(indexPage)) return `/${relativeRoute}/`

  return null
}

function splitHref(href: string) {
  const suffixIndex = href.search(/[?#]/)
  return suffixIndex === -1
    ? { pathname: href, suffix: '' }
    : {
        pathname: href.slice(0, suffixIndex),
        suffix: href.slice(suffixIndex)
      }
}

function rewriteHtmlHrefs(content: string) {
  return content.replace(
    /(\bhref\s*=\s*["'])([^"']+)(["'])/gi,
    (_, prefix, href, suffix) => `${prefix}${rewriteKotlinCnHref(href)}${suffix}`
  )
}
