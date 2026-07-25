import {
  isExternalOrFragment,
  localDocExists,
  localizedDocRoute,
  resolveRelativeDocTarget,
  splitHref
} from './link-rewrite-utils'

const LEGACY_ROUTES: Record<string, string> = {
  'topics/coroutines-basics': 'coroutines-basics',
  'topics/coroutines-flow': 'coroutines-flow',
  'pull-request': 'contribute'
}

export function kotlinRewriteHref(env: any, href: string): string {
  if (isExternalOrFragment(href)) return href

  if (isImage(href)) {
    return `/kotlin/${href.split('/').pop()}`
  }

  const { pathname, suffix } = splitHref(href)
  const isDocLink = /\.(?:md|topic)$/.test(pathname)
  const isSitePath = pathname === '/kotlin' || pathname.startsWith('/kotlin/')
  if (!isDocLink && !isSitePath) return href

  let target = resolveRelativeDocTarget(env, 'kotlin', pathname)
  target = LEGACY_ROUTES[target] ?? target

  if (!localDocExists(env, 'kotlin', target)) {
    const flattenedTarget = target.split('/').pop() ?? target
    if (localDocExists(env, 'kotlin', flattenedTarget)) {
      target = flattenedTarget
    } else {
      return `https://kotlinlang.org/docs/${flattenedTarget}.html${suffix}`
    }
  }

  return localizedDocRoute(env, 'kotlin', target, suffix)
}

function isImage(href: string) {
  return /\.(?:png|svg|jpe?g|gif)(?:[?#].*)?$/i.test(href)
}
