import { coilRewriteHref } from "./link-rewrites/coil.link-rewrite";
import { koinRewriteHref } from "./link-rewrites/koin.link-rewrite";
import { kotlinRewriteHref } from "./link-rewrites/kotlin.link-rewrite";
import { koogRewriteHref } from "./link-rewrites/koog.link-rewrite";
import { ktorRewriteHref } from "./link-rewrites/ktor.link-rewrite";
import { kmpRewriteHref } from "./link-rewrites/kmp.link-rewrite";

export type DocsItemConfig = {
    type: "koin" | "kotlin" | "sqldelight" | "ktor" | "kmp" | "koog" |  "coil";
    title: string;
    path: string;
    framework: "Docusaurus" | "Writerside" | "MKDocs";
    /** Build-time LinkRewrite: map upstream/in-doc hrefs to local routes. */
    rewriteHref?: (env: any, href: string) => string;
}
export const DocsTypeConfig: { [key: string]: DocsItemConfig } = {
    koin: {
        type: "koin",
        title: "Koin",
        path: "/koin/",
        framework: "Docusaurus",
        rewriteHref: koinRewriteHref
    },
    kotlin: {
        type: "kotlin",
        title: "Kotlin",
        path: "/kotlin/",
        framework: "Writerside",
        rewriteHref: kotlinRewriteHref
    },
    ktor: {
        type: "ktor",
        title: "Ktor",
        path: "/ktor/",
        framework: "Writerside",
        rewriteHref: ktorRewriteHref
    },
    sqldelight: {
        type: "sqldelight",
        title: "SQLDelight",
        path: "/sqldelight/",
        framework: "MKDocs"
    },
    kmp: {
        type: "kmp",
        title: "KMP",
        path: "/kmp/",
        framework: "Writerside",
        rewriteHref: kmpRewriteHref
    },
    koog: {
        type: "koog",
        title: "Koog",
        path: "/koog/",
        framework: "MKDocs",
        rewriteHref: koogRewriteHref
    },
    coil: {
        type: "coil",
        title: "Coil",
        path: "/coil/",
        framework: "MKDocs",
        rewriteHref: coilRewriteHref
    }
}

export const DOCS_TYPES = Object.keys(DocsTypeConfig)
