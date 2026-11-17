import {defaultStrategy} from "./strategy.mjs";
import {copyFlatten} from "../utils/fsUtils.mjs";
import path from "path";
import fs from "fs-extra";
import {processTopicFileAsync} from "../processors/TopicProcessor.mjs";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";
import {processMarkdownFile} from "../processors/MarkdownProcessor.mjs";
import {expandIncludesForTask} from "../utils/writerside-include.mjs";
import {movedPagesFromTree, pagesOfTree} from "../utils/moved-pages.mjs";
import {syncLabels} from "../utils/writerside-labels.mjs";
import {copyVersionFile} from "../utils/version-file.mjs";

/** topics/**\/x.md or .topic → topics/x.md: the pages are flattened into topics/. */
function mapKmpDocPath(file) {
    return `topics/${path.posix.basename(file).replace(/\.topic$/, ".md")}`;
}

/**
 * The KMP docs are published under kotlinlang.org/docs/multiplatform/, so the
 * tree links Kotlin pages by their kotlinlang.org path (/docs/x.html). Point
 * them at this site's Kotlin docs, or kotlinlang.org for a page it lacks.
 * @param {string} href
 */
export function kotlinlangHref(href) {
    const match = /^\/docs\/([^#?]+)\.html([#?].*)?$/.exec(href);
    if (!match) return href;
    const [, page, suffix = ""] = match;
    return fs.pathExistsSync(`docs/kotlin/${page}.md`)
        ? `/kotlin/${page}${suffix}`
        : `https://kotlinlang.org${href}`;
}

export const kmpStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["topics/**/*.md", "topics/**/*.topic"],

    /**
     * @override
     */
    mapDocPath: mapKmpDocPath,

    /**
     * @override
     */
    getMovedPages: async (repoPath) => movedPagesFromTree(path.join(repoPath, "mpd.tree")),

    /**
     * @override
     * kotlinlang.org/docs/multiplatform/ publishes the topics of mpd.tree;
     * topics/ also keeps pages it no longer publishes (multiplatform-setup.md,
     * now a redirect to quickstart). A tree without topics filters nothing.
     */
    getPublishedPages: async (repoPath) => {
        const pages = await pagesOfTree(path.join(repoPath, "mpd.tree"));
        if (!pages || pages.size === 0) return null;
        return new Set([...pages].map((page) => `topics/${page}`));
    },

    postSync: async (repoPath, context, repoConfig) => {
        await syncSidebar(path.join(repoPath, "mpd.tree"), repoConfig.sidebarId, "", kotlinlangHref);
        // The versions its pages show (%kotlinVersion% …), in v.list at the root of the clone
        await copyVersionFile(context, repoConfig, ["v.list"], "kmp.v.list");
        await syncLabels(repoPath, context, repoConfig.docType);
    },

    /**
     * @override
     */
    postDetect: async (repoConfig, task) => {
        const repoPath = repoConfig.cloneDir

        console.log(`  Running KMP postDetect: Flattening directory - ${repoPath}...`);
        const docsPath = path.join(repoPath, "topics");
        if (await fs.pathExists(docsPath)) {
            await copyFlatten(docsPath, docsPath);
        }
        console.log(`  Flattening finished - ${docsPath}`);

        console.log(`  Running KMP postDetect: Expand includes - ${repoPath}`);
        expandIncludesForTask(task, docsPath, "topics");

        console.log(` Running KMP postDetect: Process markdown files - ${repoPath}`);
        const docs = await fs.readdir(docsPath);
        const mdFiles = docs.filter(doc => doc.endsWith(".md"));
        for (const md in mdFiles) {
            const mdPath = path.join(docsPath, mdFiles[md]);
            await processMarkdownFile(mdPath);
        }
        console.log(`  Process markdown files finished - ${repoPath}`);

        console.log(` Running KMP postDetect: Convert topic files - ${repoPath}`);
        const topicFiles = docs.filter(doc => doc.endsWith(".topic"));
        for (const topic in topicFiles) {
            const topicPath = path.join(docsPath, topicFiles[topic]);
            await processTopicFileAsync(topicPath, docsPath)
            await fs.remove(topicPath);
        }

        // Empty Markdown destinations become a misleading self-link (`./index`)
        // in VitePress. Retain placeholder labels as text until upstream
        // supplies a real destination.
        const processedDocs = await fs.readdir(docsPath);
        for (const doc of processedDocs.filter(file => file.endsWith(".md"))) {
            const docPath = path.join(docsPath, doc);
            const content = await fs.readFile(docPath, "utf8");
            const withoutEmptyLinks = content.replace(/\[([^\]]+)]\(\)/g, "$1");
            if (withoutEmptyLinks !== content) {
                await fs.writeFile(docPath, withoutEmptyLinks, "utf8");
            }
        }
        console.log(`  Convert topic files finished - ${repoPath}`);

        console.log(` Running KMP postDetect: Change detected path - ${repoPath}`);
        // Map to flattened doc path, convert .topic -> .md
        const published = await kmpStrategy.getPublishedPages(repoPath);
        task.files = task.files.map(mapKmpDocPath).filter((file) => !published || published.has(file));
        console.log(`  Mapped files: ${task.files.join("\n")}`);
        console.log(`  Change detected path finished - ${repoPath}`);
    },

    /**
     * @override
     */
    postTranslate: async (context, repoConfig) => {
        console.log(`  Handling KMP assets: Copying images - ${repoConfig.cloneDir}... `);
        const {src, dest} = repoConfig.assets;
        const srcPath = path.join(repoConfig.cloneDir, src);
        if (await fs.pathExists(srcPath)) {
            await fs.ensureDir(dest);
            await copyFlatten(srcPath, dest);
            context.gitAddPaths.add(dest); // 将目标目录加入待提交列表
        } else {
            console.warn(
                `  ⚠️  Warning: Asset source directory not found: ${srcPath}`
            );
        }
    },
};
