import path from "node:path";
import {slugify} from "@mdit-vue/shared";

/**
 * Mirror the sidebar of a published Docusaurus site into the local sidebar
 * JSON format.
 *
 * Docusaurus keeps sidebars in the site repository, which is not always public
 * (Koin's is not), and the built site does not publish them as data. They do
 * ship inside the docs plugin's version-metadata chunk, as a
 * `JSON.parse('…')` literal, so that chunk is located and its literal decoded
 * — no downloaded code is ever executed:
 *
 *   entry page → main bundle    (route data → chunk id)
 *              → runtime bundle (chunk id → file name)
 *              → metadata chunk → `version.docsSidebars`
 */

// Route data entry for the current docs version, e.g.
// "0058b4c6":[()=>n.e(849).then(…),"@generated/docusaurus-plugin-content-docs/default/p/docs-175.json",6164]
// Older versions are published as `p/docs-4-0-23f.json` and do not match.
const CURRENT_METADATA_RE =
    /\(\)=>\w+\.e\((\d+)\)[^\]]*?"@generated\/docusaurus-plugin-content-docs\/default\/p\/docs-[0-9a-f]+\.json"/;

/**
 * Locate the metadata chunk of the current docs version.
 * @param {string} mainJs - Main bundle source
 * @param {string} runtimeJs - Runtime bundle source
 * @returns {string} Chunk file name, e.g. `0058b4c6.ef87ef2c.js`
 */
export function findMetadataChunkFile(mainJs, runtimeJs) {
    const route = mainJs.match(CURRENT_METADATA_RE);
    if (!route) throw new Error("docs version metadata not found in the main bundle");
    const chunkId = route[1];

    // The runtime maps a chunk id to its file name with two object literals:
    // an optional name map, then a content-hash map. An unnamed chunk only
    // appears in the hash map and is served as `<id>.<hash>.js`.
    const entries = [...runtimeJs.matchAll(new RegExp(`[{,]${chunkId}:"([0-9a-f]+)"`, "g"))].map((m) => m[1]);
    if (entries.length === 2) return `${entries[0]}.${entries[1]}.js`;
    if (entries.length === 1) return `${chunkId}.${entries[0]}.js`;
    throw new Error(`chunk ${chunkId} not found in the runtime bundle`);
}

/**
 * Decode the sidebars from a version-metadata chunk.
 * @param {string} chunkJs - Metadata chunk source
 * @returns {Record<string, object[]>} Sidebars by id
 */
export function parseMetadataChunk(chunkJs) {
    const literal = chunkJs.match(/JSON\.parse\('((?:[^'\\]|\\.)*)'\)/);
    if (!literal) throw new Error("no JSON literal in the metadata chunk");
    // webpack writes the JSON text into a single-quoted string, escaping only
    // backslashes and single quotes.
    const json = literal[1].replace(/\\([\\'])/g, "$1");
    const sidebars = JSON.parse(json)?.version?.docsSidebars;
    if (!sidebars || Object.keys(sidebars).length === 0) {
        throw new Error("the metadata chunk has no docsSidebars");
    }
    return sidebars;
}

/**
 * Fetch the sidebars of a published Docusaurus site.
 * @param {string} siteUrl - Site origin, e.g. `https://insert-koin.io`
 * @param {string} entryPath - Any page of the site; all pages load the same bundles
 * @returns {Promise<Record<string, object[]>>}
 */
export async function fetchDocusaurusSidebars(siteUrl, entryPath = "/") {
    const get = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
        return res.text();
    };

    const html = await get(new URL(entryPath, siteUrl).href);
    const mainSrc = html.match(/src="([^"]*\/main\.[0-9a-f]+\.js)"/)?.[1];
    const runtimeSrc = html.match(/src="([^"]*\/runtime~main\.[0-9a-f]+\.js)"/)?.[1];
    if (!mainSrc || !runtimeSrc) throw new Error("main/runtime bundles not referenced by the entry page");

    const [mainJs, runtimeJs] = await Promise.all([
        get(new URL(mainSrc, siteUrl).href),
        get(new URL(runtimeSrc, siteUrl).href),
    ]);
    const chunkFile = findMetadataChunkFile(mainJs, runtimeJs);
    const chunkUrl = new URL(path.posix.join(path.posix.dirname(mainSrc), chunkFile), siteUrl).href;
    return parseMetadataChunk(await get(chunkUrl));
}

const docLeaf = (docType, docId) => ({text: `${docType}.${docId.replaceAll("/", ".")}`, link: docId});

const docIdsOf = (item) =>
    item.type === "category" ? item.items.flatMap(docIdsOf) : item.docId ? [item.docId] : [];

/**
 * Convert Docusaurus sidebars to local sidebar nodes.
 *
 * The `primary` sidebar is taken as is. Pages that only other sidebars list
 * (Koin's "start" sidebar, say) are appended to the primary category with the
 * same label, else to the one holding most of their siblings, else to a new
 * category, so every published page stays reachable from the one local sidebar.
 *
 * @param {Record<string, object[]>} sidebars - Sidebars by id
 * @param {object} options
 * @param {string} options.docType - Doc type, used as the translation key prefix
 * @param {string} [options.primary] - Id of the main sidebar
 * @param {(docId: string) => boolean} [options.hasDoc] - Whether a page can be served locally
 * @returns {{sidebarNodes: object[], translateKeys: Map<string, string>, skipped: string[]}}
 */
export function docusaurusToSidebarNodes(sidebars, {docType, primary = "docs", hasDoc = () => true}) {
    if (!sidebars[primary]) throw new Error(`sidebar "${primary}" not found`);

    const translateKeys = new Map();
    const skipped = new Set();

    const categoryKey = (label) => {
        const key = `${docType}.${slugify(label)}`;
        translateKeys.set(key, label);
        return key;
    };

    const convert = (item) => {
        if (item.type === "category") {
            const items = item.items.map(convert).filter(Boolean);
            return items.length > 0 ? {text: categoryKey(item.label), collapsed: true, items} : null;
        }
        if (item.type !== "link") return null;
        if (item.docId) {
            if (!hasDoc(item.docId)) {
                skipped.add(item.docId);
                return null;
            }
            return docLeaf(docType, item.docId);
        }
        return /^https?:\/\//i.test(item.href ?? "") ? {text: categoryKey(item.label), href: item.href} : null;
    };

    const sidebarNodes = sidebars[primary].map(convert).filter(Boolean);
    const listed = new Set(sidebars[primary].flatMap(docIdsOf));

    for (const [id, sidebar] of Object.entries(sidebars)) {
        if (id === primary) continue;
        for (const category of sidebar.filter((item) => item.type === "category")) {
            const docIds = docIdsOf(category);
            const unlisted = docIds.filter((docId) => !listed.has(docId) && hasDoc(docId));
            if (unlisted.length === 0) continue;

            const siblingCount = (index) =>
                docIds.filter((docId) => sidebars[primary][index].type === "category"
                    && docIdsOf(sidebars[primary][index]).includes(docId)).length;
            let target = sidebars[primary].findIndex((item) => item.type === "category" && item.label === category.label);
            if (target === -1) {
                const counts = sidebars[primary].map((_, index) => siblingCount(index));
                const best = Math.max(0, ...counts);
                target = best > 0 ? counts.indexOf(best) : -1;
            }

            const leaves = unlisted.map((docId) => docLeaf(docType, docId));
            const node = target === -1 ? null : sidebarNodes.find((n) => n.text === `${docType}.${slugify(sidebars[primary][target].label)}`);
            if (node) node.items.push(...leaves);
            else sidebarNodes.push({text: categoryKey(category.label), collapsed: true, items: leaves});
            unlisted.forEach((docId) => listed.add(docId));
        }
    }

    return {sidebarNodes, translateKeys, skipped: [...skipped]};
}

/**
 * Append pages missing from an existing sidebar, one category per directory.
 * Fallback for when the published sidebar cannot be read.
 * @param {object[]} sidebarNodes - Current local sidebar
 * @param {string[]} docIds - Every page that should be reachable
 * @param {string} docType - Doc type, used as the translation key prefix
 * @returns {{sidebarNodes: object[], translateKeys: Map<string, string>}}
 */
export function appendUnlistedDocs(sidebarNodes, docIds, docType) {
    const listed = new Set();
    const collect = (node) => {
        if (node.link) listed.add(node.link);
        (node.items ?? []).forEach(collect);
    };
    sidebarNodes.forEach(collect);

    const groups = new Map();
    for (const docId of [...docIds].sort()) {
        if (listed.has(docId)) continue;
        const dir = path.posix.dirname(docId);
        if (!groups.has(dir)) groups.set(dir, []);
        groups.get(dir).push(docId);
    }

    const translateKeys = new Map();
    const appended = [...groups].map(([dir, ids]) => {
        const label = dir === "." ? docType : path.posix.basename(dir)
            .split(/[-_]/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        const key = `${docType}.${slugify(dir === "." ? "other" : dir)}`;
        translateKeys.set(key, label);
        return {text: key, collapsed: true, items: ids.map((docId) => docLeaf(docType, docId))};
    });

    return {sidebarNodes: [...sidebarNodes, ...appended], translateKeys};
}
