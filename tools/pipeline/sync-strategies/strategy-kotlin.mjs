import {defaultStrategy} from "./strategy.mjs";
import {copyFlatten} from "../utils/fsUtils.mjs";
import path from "path";
import fs from "fs-extra";
import {processTopicFileAsync} from "../processors/TopicProcessor.mjs";
import {generateSidebar} from "../processors/SidebarProcessor.mjs";

export const kotlinStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["docs/**/*.md", "docs/**/*.topic"],

    postSync: async (repoPath, context, repoConfig) => {
        await copyKotlinVersionFile(context, repoConfig);
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
        const redundantFiles = ["kotlin-mascot.md", "debugging.md"];
        for (const file of redundantFiles) {
            const filePath = path.join(docsPath, file);
            if (await fs.pathExists(filePath)) {
                await fs.remove(filePath);
            }
        }
        console.log(`  Remove redundant files finished - ${repoPath}`);

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
        task.files = await Promise.all(
            task.files.map(async (file) => {
                const base = file.split('/');
                let target = path.join('docs', base[base.length - 1]);
                if (target.endsWith('.topic')) {
                    target = target.replace('.topic', '.md');
                }
                return target;})
        );
        console.log(`  Mapped ${task.files.length} files: ${task.files.join("\n")}`);
        console.log(`  Change detected path finished - ${repoPath}`);

        console.log(`  Running Kotlin postDetect: Generate sidebar - ${repoPath}...`);
        const sidebarFile = docs.filter(doc => doc.endsWith(".tree"));
        const sidebarPath = path.join(docsPath, sidebarFile[0]);
        const docType = repoConfig.sidebarId;
        if (await fs.pathExists(sidebarPath)) {
            await generateSidebar(sidebarPath, docType);
        }
        console.log(`  Generate sidebar finished - ${repoPath}`);

        if (repoConfig.id === "kotlin-web-site") {
            console.log(`  Running Kotlin postDetect: Resolve includes`);
            const includeMD = path.join(docsPath, "kotlin-language-features-and-proposals.md");
            let content = await fs.readFile(includeMD, "utf8");
            const includeFilterRe = /<include\s+element-id="([^"]+)"\s+use-filter="([^"]+)"\s+from="([^"]+)"\s*\/?>/g;

            content = content.replace(includeFilterRe, (match, elementId, filterMatch, from) => {
                const filter = filterMatch.split(',')[1]
                const trMatch = content.match(new RegExp(`<tr\\s+filter="${filter}">([\\s\\S]*?)<\\/tr>`, 'g'));
                if (!trMatch) return '';

                const tr = trMatch.join('\n\n');
                return `<table>\n${tr}\n</table>`
            })

            await fs.writeFile(includeMD, content, "utf8");
            console.log(`  Resolve includes finished - ${repoPath}`);
        }
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
