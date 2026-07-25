import {
    isExternalOrFragment,
    localDocExists,
    localizedDocRoute,
    resolveRelativeDocTarget,
    splitHref
} from './rewrite-utils'

export function coilRewriteHref(env: any, href: string): string {
    const readmeHref = rewriteReadme(href)
    if (readmeHref) return readmeHref

    const isOfficialCoilLink = href.startsWith('https://coil-kt.github.io/')
    if (isExternalOrFragment(href) && !isOfficialCoilLink) return href

    if (href.startsWith('https://coil-kt.github.io/coil/api')) {
        return href
    }
    if (href.startsWith('/coil/api')) {
        return `https://coil-kt.github.io${href}`
    }
    if (href.startsWith('/api/')) {
        return `https://coil-kt.github.io/coil${href}`
    }
    if (href.startsWith('api/')) {
        return `https://coil-kt.github.io/coil/${href}`
    }
    if (href === 'https://coil-kt.github.io/coil/sample/') {
        return 'https://github.com/coil-kt/coil/tree/3.x/samples/compose'
    }

    const legacyTarget = legacyCoilTarget(href)
    if (legacyTarget) {
        return localizedDocRoute(env, 'coil', legacyTarget, splitHref(href).suffix)
    }

    if (isOfficialCoilLink) {
        const officialUrl = new URL(href)
        const target = officialUrl.pathname.replace(/^\/coil\/?/, '')
        if (localDocExists(env, 'coil', target)) {
            return localizedDocRoute(env, 'coil', target, officialUrl.hash)
        }
        return href
    }

    const { pathname, suffix } = splitHref(href)
    if (pathname.startsWith('/coil/')) {
        const target = resolveRelativeDocTarget(env, 'coil', pathname)
        if (localDocExists(env, 'coil', target)) {
            return localizedDocRoute(env, 'coil', target, suffix)
        }
    }

    const assetHref = rewriteAsset(href)
    return assetHref || href
}

function rewriteAsset(href: string) {
    if (href.startsWith('/')) return href
    if (href.startsWith('../images/')) {
        return href.replace('../images/', '/coil/')
    }
    if (/\.(?:png|svg|jpe?g|gif)(?:[?#].*)?$/i.test(href)) {
        return `/coil/${href}`
    }
    return ''
}

function rewriteReadme(href: string) {
    if (!href.startsWith('README')) return ''
    return `https://coil-kt.github.io/coil/${href.replace(/\.md$/, '')}/`
}

function legacyCoilTarget(href: string) {
    if (href.startsWith('https://coil-kt.github.io/coil/upgrading/')) {
        return 'upgrading_to_coil2'
    }
    if (href.startsWith('https://coil-kt.github.io/coil/transitions/')) {
        return 'compose'
    }
    return ''
}
