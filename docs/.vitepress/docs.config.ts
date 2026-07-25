import { coilRewriteHref } from "./rewrite/coil-rewrite-strategy";
import {koinRewriteHref} from "./rewrite/koin-rewrite-strategy";
import {kotlinRewriteHref} from "./rewrite/kotlin-rewrite-strategy";
import {koogRewriteHref} from "./rewrite/koog-rewrite-strategy";
import {ktorRewriteHref} from "./rewrite/ktor-rewrite-strategy";
import {kmpRewriteHref} from "./rewrite/kmp-rewrite-strategy";

export type DocsItemConfig = {
    type: "koin" | "kotlin" | "sqldelight" | "ktor" | "kmp" | "koog" |  "coil";
    title: string;
    path: string;
    framework: "Docusaurus" | "Writerside" | "MKDocs";
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
