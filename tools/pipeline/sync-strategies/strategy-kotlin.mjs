import {defaultStrategy} from "./strategy.mjs";
import {copyFlatten} from "../utils/fsUtils.mjs";
import path from "path";
import fs from "fs-extra";
import {processTopicFileAsync} from "../processors/TopicProcessor.mjs";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";
import {expandIncludesForTask} from "../utils/writerside-include.mjs";
import {movedPagesFromTree} from "../utils/moved-pages.mjs";

// Upstream pages the site leaves out
const REDUNDANT_FILES = ["kotlin-mascot.md", "debugging.md"];

const VARIABLES_DIR = "docs/.vitepress/variables";

/**
 * SyncStrategy of the Kotlin documentation family: Writerside docs whose
 * topics (<root>/topics/**) are flattened into <root>/, with one .tree
 * there; their pages all go to docs/kotlin/.
 * @param {string} root - Docs directory of the repository
 * @param {(repoConfig: object) => {candidates: string[], target: string} | null} [versionFile]
 *   The repository's Writerside variables (paths in the clone) to copy into
 *   docs/.vitepress/variables/<target>, read by the site for %name% variables
 */
export function kotlinFamilyStrategy(root, versionFile = () => null) {
    /** <root>/**\/x.md or .topic → <root>/x.md */
    const mapDocPath = (file) => {
        const name = path.posix.basename(file).replace(/\.topic$/, ".md");
        return REDUNDANT_FILES.includes(name) ? null : `${root}/${name}`;
    };

    const findTree = async (repoPath) => {
        const docsPath = path.join(repoPath, root);
        if (!(await fs.pathExists(docsPath))) return null;
        const tree = (await fs.readdir(docsPath)).find(doc => doc.endsWith(".tree"));
        return tree ? path.join(docsPath, tree) : null;
    };

    const copyVersionFile = async (context, repoConfig) => {
        const versions = context ? versionFile(repoConfig) : null;
        if (!versions) return;
        const source = versions.candidates
            .map((candidate) => path.join(repoConfig.cloneDir, candidate))
            .find((candidate) => fs.pathExistsSync(candidate));
        if (!source) {
            console.warn(`  Warning: ${repoConfig.id} version file not found in ${versions.candidates.join(", ")}.`);
            return;
        }
        const target = `${VARIABLES_DIR}/${versions.target}`;
        await fs.copy(source, target, {overwrite: true});
        context.gitAddPaths.add(target);
        console.log(`  Copied ${repoConfig.id} version file to ${target}`);
    };

    return {
        ...defaultStrategy,

        /**
         * @override
         */
        getDocPatterns: () => [`${root}/**/*.md`, `${root}/**/*.topic`],

        /**
         * @override
         */
        mapDocPath,

        /**
         * @override
         */
        getMovedPages: async (repoPath) => {
            const tree = await findTree(repoPath);
            return tree ? movedPagesFromTree(tree) : new Map();
        },

        postSync: async (repoPath, context, repoConfig) => {
            await copyVersionFile(context, repoConfig);

            // Each repository of the family has one tree in its docs directory (kr.tree, kc.tree, ...)
            const tree = await findTree(repoPath);
            if (tree) {
                await syncSidebar(tree, repoConfig.sidebarId);
            } else {
                console.warn(`  ⚠️  Warning: no .tree file found in ${path.join(repoPath, root)}`);
            }
        },

        /**
         * @override
         */
        postDetect: async (repoConfig, task) => {
            const repoPath = repoConfig.cloneDir;

            console.log(`  Running Kotlin postDetect: Flattening directory - ${repoPath}...`);
            const originDocsPath = path.join(repoPath, root, "topics");
            const docsPath = path.join(repoPath, root);
            if (await fs.pathExists(originDocsPath)) {
                await copyFlatten(originDocsPath, docsPath);
            }
            console.log(`  Flattening finished - ${repoPath}`);

            console.log(`  Running Kotlin postDetect: Remove redundant files - ${repoPath}...`);
            for (const file of REDUNDANT_FILES) {
                const filePath = path.join(docsPath, file);
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                }
            }
            console.log(`  Remove redundant files finished - ${repoPath}`);

            console.log(`  Running Kotlin postDetect: Expand includes - ${repoPath}`);
            expandIncludesForTask(task, docsPath, root);

            console.log(` Running Kotlin postDetect: Convert topic files - ${repoPath}`);
            const docs = await fs.readdir(docsPath);
            const topicFiles = docs.filter(doc => doc.endsWith(".topic"));
            for (const topic in topicFiles) {
                const topicPath = path.join(docsPath, topicFiles[topic]);
                await processTopicFileAsync(topicPath, docsPath)
                await fs.remove(topicPath);
            }
            console.log(`  Convert topic files finished - ${repoPath}`);

            console.log(` Running Kotlin postDetect: Change detected path - ${repoPath}`);
            // Map to flattened doc path, convert .topic -> .md
            task.files = task.files.map(mapDocPath).filter(Boolean);
            console.log(`  Mapped ${task.files.length} files: ${task.files.join("\n")}`);
            console.log(`  Change detected path finished - ${repoPath}`);
        },

        /**
         * @override
         */
        postTranslate: async (context, repoConfig) => {
            await copyVersionFile(context, repoConfig);

            console.log(`  Handling Kotlin assets: Copying images - ${repoConfig.cloneDir}... `);
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
}

/** kotlin-web-site, kotlinx.coroutines, dokka, lincheck, api-guidelines: docs in docs/ */
export const kotlinStrategy = kotlinFamilyStrategy("docs", (repoConfig) =>
    repoConfig?.id === "kotlin-web-site"
        ? {candidates: ["docs/v.list", "docs/variables/v.list"], target: "kotlin.v.list"}
        : null
);

/**
 * kotlinx.serialization: the docs kotlinlang.org publishes are in
 * docs-website/ (serialization.tree, included by kotlin-web-site's tree as
 * "serialization"), with their own variables.
 */
export const kotlinSerializationStrategy = kotlinFamilyStrategy("docs-website", () => ({
    candidates: ["docs-website/v.list"],
    target: "serialization.v.list",
}));
