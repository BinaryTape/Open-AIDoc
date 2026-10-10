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

/** docs/**\/x.md or .topic → docs/x.md: the family's pages are flattened into docs/. */
function mapKotlinDocPath(file) {
    const name = path.posix.basename(file).replace(/\.topic$/, ".md");
    return REDUNDANT_FILES.includes(name) ? null : `docs/${name}`;
}

async function findTree(repoPath) {
    const docsPath = path.join(repoPath, "docs");
    const tree = (await fs.readdir(docsPath)).find(doc => doc.endsWith(".tree"));
    return tree ? path.join(docsPath, tree) : null;
}

export const kotlinStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["docs/**/*.md", "docs/**/*.topic"],

    /**
     * @override
     */
    mapDocPath: mapKotlinDocPath,

    /**
     * @override
     */
    getMovedPages: async (repoPath) => {
        const tree = await findTree(repoPath);
        return tree ? movedPagesFromTree(tree) : new Map();
    },

    postSync: async (repoPath, context, repoConfig) => {
        await copyKotlinVersionFile(context, repoConfig);

        // Each repository of the family has one tree in docs/ (kr.tree, kc.tree, ...)
        const tree = await findTree(repoPath);
        if (tree) {
            await syncSidebar(tree, repoConfig.sidebarId);
        } else {
            console.warn(`  ⚠️  Warning: no .tree file found in ${path.join(repoPath, "docs")}`);
        }
    },

    /**
     * @override
     */
    postDetect: async (repoConfig, task) => {
        const repoPath = repoConfig.cloneDir;

        console.log(`  Running Kotlin postDetect: Flattening directory - ${repoPath}...`);
        const originDocsPath = path.join(repoPath, "docs/topics");
        const docsPath = path.join(repoPath, "docs");
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
        expandIncludesForTask(task, docsPath, "docs");

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
        task.files = task.files.map(mapKotlinDocPath).filter(Boolean);
        console.log(`  Mapped ${task.files.length} files: ${task.files.join("\n")}`);
        console.log(`  Change detected path finished - ${repoPath}`);
    },

    /**
     * @override
     */
    postTranslate: async (context, repoConfig) => {
        await copyKotlinVersionFile(context, repoConfig);

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

async function copyKotlinVersionFile(context, repoConfig) {
    if (!context || repoConfig?.id !== "kotlin-web-site") return;

    console.log(`  Copying Kotlin version file...`);
    const versionFileCandidates = [
        `${repoConfig.cloneDir}/docs/v.list`,
        `${repoConfig.cloneDir}/docs/variables/v.list`,
    ];
    const versionFile = versionFileCandidates.find((candidate) => fs.pathExistsSync(candidate));
    if (!versionFile) {
        console.warn(`  Warning: Kotlin version file not found in known locations.`);
        return;
    }

    await fs.copy(versionFile, "docs/.vitepress/variables/kotlin.v.list", {overwrite: true});
    context.gitAddPaths.add("docs/.vitepress/variables/kotlin.v.list");
    console.log(`  Copying Kotlin version file finished - ${repoConfig.cloneDir}`);
}
