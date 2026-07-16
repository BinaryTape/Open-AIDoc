import {DOCS_TYPES} from "../docs.config";
import {SITE_LOCALES} from "../locales.config";

export function coilRewriteHref(env: any, href: string): string {
    const parts = env.relativePath.split('/')
    const docType = parts.find(p => DOCS_TYPES.includes(p))
    const locale = parts.find(p => SITE_LOCALES.includes(p))

    const readmeHref = rewriteReadme(href);
    if (readmeHref) {
        return readmeHref;
    }
    const localePath = locale === undefined ? '' : `/${locale}`
    let rewriteHref = href;
    if (href.startsWith('https://coil-kt.github.io/coil/api')) {
        return href
    }
    if (href.startsWith("/coil/api")) {
        return "https://coil-kt.github.io" + href
    }
    const isCoilMDFile = href.startsWith('https://coil-kt.github.io/')
    if (isCoilMDFile) {
        const coilMDUrl = new URL(href);
        let coilMDPath = coilMDUrl.pathname;
        if (coilMDPath.endsWith('/')) {
            coilMDPath = coilMDPath.slice(0, -1);
        }
        rewriteHref = `${localePath}${coilMDPath}`
    }
    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }
    return rewriteHref;
}

function rewriteAssets(href: string): string {
    if(href.startsWith("../images/")) {
        return href.replace("../images/", "/coil/");
    }

    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif')) {
        return `/coil/${href}`
    }
}

function rewriteReadme(href: string) {
    const originalMdHref = href.replace(/\.md$/, '');  // 去掉.md结尾
    if (href.startsWith('README')) {
        return `https://coil-kt.github.io/coil/${originalMdHref}/`
    }
}