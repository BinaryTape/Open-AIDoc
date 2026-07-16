export function koogRewriteHref(env: any, href: string): string {
    let rewriteHref = href;

    if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
    }

    if (href.includes('.md')) {
        href = href.replace('.md', '')
        rewriteHref = `./${href}`
    }

    const rewriteAssetsHref = rewriteAssets(href);
    if (rewriteAssetsHref) {
        return rewriteAssetsHref;
    }
    return rewriteHref;
}

function rewriteAssets(href: string): string {
    if (href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.gif') || href.startsWith("img/")) {
        return href.replace("img/", "/koog/").replace("#only-light", "").replace("#only-dark", "");
    }
}