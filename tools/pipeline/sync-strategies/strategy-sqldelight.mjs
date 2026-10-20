import fs from "fs-extra";
import path from "path";
import {defaultStrategy} from "./strategy.mjs";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";
import {movedPagesFromMkDocs} from "../utils/moved-pages.mjs";

const extraFilesMapping = new Map([
    ["CHANGELOG.md", "docs/changelog.md"],
    ["CONTRIBUTING.md", "docs/contributing.md"]
]);

const DOCS_SITE = "https://sqldelight.github.io/sqldelight/";
// `{{ versions.sqldelight }}` in the pages (markdown-it-mk-vars.ts).
export const VERSION_FILE = "docs/.vitepress/variables/sqldelightVer.json";

/**
 * The SQLDelight version the official docs show: the one mike's `latest`
 * alias points at in the site's versions.json. Upstream's mkdocs.yml has no
 * version (`!ENV [SQLDELIGHT_VERSION, …]`, set when the docs are published),
 * and gradle.properties holds the next snapshot.
 * @returns {Promise<string | null>} null when it cannot be read
 */
export async function latestDocsVersion(fetchFn = globalThis.fetch) {
    try {
        const response = await fetchFn(`${DOCS_SITE}versions.json`);
        if (!response.ok) return null;
        const versions = await response.json();
        const latest = Array.isArray(versions) && versions.find((v) => v?.aliases?.includes("latest"));
        return typeof latest?.version === "string" && /^\d+\.\d+\.\d+$/.test(latest.version) ? latest.version : null;
    } catch {
        return null;
    }
}

/**
 * Write the version for the pages and return it; keep the file when the
 * official site cannot be read.
 * @returns {Promise<string | null>} The version now in the file, if any
 */
export async function syncDocsVersion(context, fetchFn = globalThis.fetch) {
    const version = await latestDocsVersion(fetchFn);
    if (version) {
        await fs.outputFile(VERSION_FILE, JSON.stringify({ versions: { sqldelight: version } }, null, 2) + "\n");
        context.gitAddPaths?.add(VERSION_FILE);
        console.log(`  SQLDelight docs version: ${version}`);
        return version;
    }
    console.warn(`  ⚠️  Warning: could not read the SQLDelight docs version from ${DOCS_SITE}versions.json; keeping ${VERSION_FILE}`);
    const kept = await fs.readJson(VERSION_FILE).catch(() => null);
    return kept?.versions?.sqldelight ?? null;
}

export const sqlDelightStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["docs/**/*.md", ...extraFilesMapping.keys()],

    /**
     * @override
     */
    mapDocPath: (file) => extraFilesMapping.get(file) ?? file,

    /**
     * @override
     */
    getMovedPages: async (repoPath) => movedPagesFromMkDocs(path.join(repoPath, "mkdocs.yml")),

    postSync: async (repoPath, context, repoConfig, fetchFn = globalThis.fetch) => {
        // API reference links (the .html entries of the nav) go to the same
        // version as the pages; `latest/` when no version is known.
        const version = await syncDocsVersion(context, fetchFn);
        await syncSidebar(path.join(repoPath, 'mkdocs.yml'), repoConfig.sidebarId, `${DOCS_SITE}${version ?? "latest"}/`);
    },

    /**
     * @override
     */
    postDetect: async (repoConfig, task) => {
        const repoPath = repoConfig.cloneDir;

        console.log("  Running SQLDelight postSync: Copying root markdown files...");
        // Every mapped page is copied, not only the changed ones: pages carried
        // over in the pending file are read from their docs/ path too.
        for (const [file, docPath] of extraFilesMapping) {
            if (await fs.pathExists(path.join(repoPath, file))) {
                await fs.copy(path.join(repoPath, file), path.join(repoPath, docPath));
            }
        }
        task.files = task.files.map(sqlDelightStrategy.mapDocPath);
        console.log("  Copying root markdown files finished");
    },

    /**
     * @override
     */
    postTranslate: async (context, repoConfig) => {
        console.log("  Handling SQLDelight assets: Copying images...");
        const {src, dest} = repoConfig.assets;
        const srcPath = path.join(repoConfig.cloneDir, src);
        if (await fs.pathExists(srcPath)) {
            await fs.ensureDir(dest);
            await fs.copy(srcPath, dest, {overwrite: true});
            context.gitAddPaths.add(dest); // 将目标目录加入待提交列表
        } else {
            console.warn(
                `  ⚠️  Warning: Asset source directory not found: ${srcPath}`
            );
        }
    },
};
