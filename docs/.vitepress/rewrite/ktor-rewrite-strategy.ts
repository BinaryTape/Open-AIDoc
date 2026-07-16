export function ktorRewriteHref(env: any, href: string): string {
    let rewriteHref = href;

    if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
    }

    if (href.includes('.md')) {
        href = href.replace('.md', '')
        rewriteHref = `./${href}`
    }

    if (href.includes('.topic')) {
        href = href.replace('.topic', '')
        rewriteHref = `./${href}`
    }

    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }
    return rewriteHref;
}

function rewriteAssets(href: string): string {
    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif')) {
        return `/ktor/${href.replace("../images/", "")}`
    }
}