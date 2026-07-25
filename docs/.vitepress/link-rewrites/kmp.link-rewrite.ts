import {
    isExternalOrFragment,
    localizedDocRoute,
    resolveRelativeDocTarget,
    splitHref
} from './link-rewrite-utils'

export function kmpRewriteHref(env: any, href: string): string {
    if (isExternalOrFragment(href)) {
        return href;
    }

    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }

    const { pathname, suffix } = splitHref(href)
    if (pathname === '/kmp' || pathname === '/kmp/') {
        return localizedDocRoute(env, 'kmp', 'get-started', suffix)
    }

    if (
        /\.(?:md|topic)$/.test(pathname) ||
        pathname.startsWith('/kmp/')
    ) {
        const target = resolveRelativeDocTarget(env, 'kmp', pathname)
        return localizedDocRoute(env, 'kmp', target, suffix)
    }

    return href;
}

function rewriteAssets(href: string): string {
    if (href.startsWith('/')) {
        return href
    }
    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif')) {
        return `/kmp/${href}`
    }
}
