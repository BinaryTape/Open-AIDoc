import path from "node:path";
import {slugify} from "@mdit-vue/shared";

/**
 * Keep a hand-curated sidebar in step with the upstream docs.
 *
 * Some upstreams (Koin) keep their sidebar in a repository we cannot read, so
 * the local sidebar JSON is the source of truth and is curated in this
 * repository. On every sync it is reconciled with the upstream docs tree:
 *
 *  - entries whose page can no longer be served are dropped;
 *  - a new page is filed with its siblings: in the category that already
 *    lists the most pages from the same directory;
 *  - a new page with no listed sibling (a new upstream directory) goes into an
 *    auto-created group flagged `autoGroup`, so the page is reachable at once
 *    and a test fails until someone files it properly.
 *
 * Nothing is fetched: the result depends only on the sidebar and the upstream
 * commit being synced.
 */

const leafFor = (docType, docId) => ({text: `${docType}.${docId.replaceAll("/", ".")}`, link: docId});

function humanize(dir) {
    return path.posix.basename(dir)
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * @param {object[]} sidebarNodes - Current sidebar
 * @param {object} options
 * @param {string} options.docType - Doc type, used as the translation key prefix
 * @param {string[]} options.docIds - Pages in the upstream docs, e.g. `reference/koin-core/dsl`
 * @param {string[]} [options.hidden] - Upstream pages deliberately left out of the sidebar
 * @param {(docId: string) => boolean} options.isServable - Whether a page can be served locally
 * @returns {{sidebarNodes: object[], translateKeys: Map<string, string>, added: string[], removed: string[], autoGroups: string[]}}
 */
export function reconcileSidebar(sidebarNodes, {docType, docIds, hidden = [], isServable}) {
    const removed = [];
    const prune = (nodes) => nodes
        .map((node) => {
            const out = {...node};
            if (out.link && !isServable(out.link)) {
                removed.push(out.link);
                delete out.link;
            }
            if (out.items) out.items = prune(out.items);
            return out;
        })
        .filter((node) => node.link || node.href || node.items?.length);
    const nodes = prune(structuredClone(sidebarNodes));

    const listed = new Set();
    const categories = [];
    const walk = (list) => list.forEach((node) => {
        if (node.link) listed.add(node.link);
        if (node.items) {
            categories.push(node);
            walk(node.items);
        }
    });
    walk(nodes);

    const translateKeys = new Map();
    const added = [];
    const autoGroups = new Set();
    const skip = new Set(hidden);

    for (const docId of [...docIds].sort()) {
        if (listed.has(docId) || skip.has(docId)) continue;
        const dir = path.posix.dirname(docId);

        // The category holding the most pages from the same directory; the
        // first one in sidebar order on a tie.
        let target = null;
        let best = 0;
        for (const category of categories) {
            const siblings = category.items.filter((item) => item.link && path.posix.dirname(item.link) === dir).length;
            if (siblings > best) {
                best = siblings;
                target = category;
            }
        }

        if (!target) {
            target = nodes.find((node) => node.autoGroup === dir);
            if (!target) {
                const key = `${docType}.${slugify(dir === "." ? "other" : dir)}`;
                translateKeys.set(key, dir === "." ? docType : humanize(dir));
                target = {text: key, collapsed: true, autoGroup: dir, items: []};
                nodes.push(target);
                categories.push(target);
            }
            autoGroups.add(dir);
        }

        target.items.push(leafFor(docType, docId));
        listed.add(docId);
        added.push(docId);
    }

    return {sidebarNodes: nodes, translateKeys, added, removed, autoGroups: [...autoGroups]};
}
