import {
  isExternalOrFragment,
  localDocExists,
  localizedDocRoute,
  resolveRelativeDocTarget,
  splitHref
} from './rewrite-utils'

const LEGACY_ROUTES: Record<string, string> = {
  'tutorials/your-first-app': 'quickstart/kotlin',
  'migration/from-hilt': 'intro/koin-vs-hilt',
  'reference/dsl-reference': 'reference/koin-core/dsl',
  'reference/annotations-reference': 'reference/koin-annotations/annotations-inventory',
  'reference/troubleshooting': 'reference/koin-core/troubleshooting',
  'integrations/android': 'reference/koin-android/start',
  'integrations/compose': 'reference/koin-compose/compose',
  'integrations/android/android-scopes': 'reference/koin-android/scope',
  'integrations/compose/compose-modules': 'reference/koin-compose/compose-modules',
  'best-practices/custom-scopes': 'reference/koin-core/scopes'
}

export function koinRewriteHref(env: any, href: string): string {
  if (isExternalOrFragment(href)) return href

  const { pathname, suffix } = splitHref(href)
  const isUpstreamDocsPath = pathname.startsWith('/docs')
  const isSitePath = pathname === '/koin' || pathname.startsWith('/koin/')

  let target = isUpstreamDocsPath
    ? pathname.replace(/^\/docs\/?/, '')
    : resolveRelativeDocTarget(env, 'koin', pathname)

  target = target
    .replace(/\.(?:md|mdx)$/, '')
    .replace(/\/index$/, '')
  target = LEGACY_ROUTES[target] ?? target

  if (localDocExists(env, 'koin', target)) {
    return localizedDocRoute(env, 'koin', target, suffix)
  }

  if (isUpstreamDocsPath || isSitePath) {
    return `https://insert-koin.io/docs/${target}${suffix}`
  }

  return href
}
