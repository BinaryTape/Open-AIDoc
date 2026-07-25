import {
    isExternalOrFragment,
    localDocExists,
    localizedDocRoute,
    resolveRelativeDocTarget,
    splitHref
} from './rewrite-utils'

export function koogRewriteHref(env: any, href: string): string {
    if (isExternalOrFragment(href)) {
        return href;
    }

    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }

    const { pathname, suffix } = splitHref(href)
    if (pathname === '/koog' || pathname === '/koog/') {
        return localizedDocRoute(env, 'koog', '', suffix)
    }

    if (pathname === '/module-versioning') {
        return localizedDocRoute(env, 'koog', 'module-versioning', suffix)
    }

    if (/\.md$/.test(pathname) || pathname.startsWith('/koog/')) {
        const target = resolveRelativeDocTarget(env, 'koog', pathname)
        if (localDocExists(env, 'koog', target)) {
            return localizedDocRoute(env, 'koog', target, suffix)
        }
    }

    return href;
}

function rewriteAssets(href: string): string {
    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif') || href.startsWith("img/")) {
        return href.replace("img/", "/koog/").replace("#only-light", "").replace("#only-dark", "");
    }
}
