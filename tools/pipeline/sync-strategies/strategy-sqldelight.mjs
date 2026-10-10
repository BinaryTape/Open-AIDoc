import fs from "fs-extra";
import path from "path";
import {defaultStrategy} from "./strategy.mjs";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";
import {movedPagesFromMkDocs} from "../utils/moved-pages.mjs";

const extraFilesMapping = new Map([
    ["CHANGELOG.md", "docs/changelog.md"],
    ["CONTRIBUTING.md", "docs/contributing.md"]
]);

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

    postSync: async (repoPath, context, repoConfig) => {
        await syncSidebar(path.join(repoPath, 'mkdocs.yml'), repoConfig.sidebarId, 'https://sqldelight.github.io/sqldelight/2.1.0/');
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
