import {
    isExternalOrFragment,
    localDocExists,
    localizedDocRoute,
    resolveRelativeDocTarget,
    splitHref
} from './link-rewrite-utils'

export function ktorRewriteHref(env: any, href: string): string {
    if (isExternalOrFragment(href)) {
        return href;
    }

    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }

    const { pathname, suffix } = splitHref(href)
    const isDocLink = /\.(?:md|topic)$/.test(pathname)
    const isSitePath = pathname === '/ktor' || pathname.startsWith('/ktor/')
    if (!isDocLink && !isSitePath) return href

    const target = resolveRelativeDocTarget(env, 'ktor', pathname)
    if (localDocExists(env, 'ktor', target)) {
        return localizedDocRoute(env, 'ktor', target, suffix)
    }

    const upstreamSlug = target.split('/').pop() || target
    return `https://ktor.io/docs/${upstreamSlug}.html${suffix}`
}

function rewriteAssets(href: string): string {
    if (href.startsWith('/')) {
        return href
    }
    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif')) {
        return `/ktor/${href.replace("../images/", "")}`
    }
}
