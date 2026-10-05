import fs from "fs-extra";
import path from "path";
import {defaultStrategy} from "./strategy.mjs";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";

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

    postSync: async (repoPath, context, repoConfig) => {
        await syncSidebar(path.join(repoPath, 'mkdocs.yml'), repoConfig.sidebarId, 'https://sqldelight.github.io/sqldelight/2.1.0/');
    },

    /**
     * @override
     */
    postDetect: async (repoConfig, task) => {
        const repoPath = repoConfig.cloneDir;

        console.log("  Running SQLDelight postSync: Copying root markdown files...");
        task.files = await Promise.all(
            task.files.map(async (file) => {
                if (extraFilesMapping.has(file)) {
                    const src = path.join(repoPath, file);
                    const dest = path.join(repoPath, extraFilesMapping.get(file));
                    await fs.copy(src, dest);
                    return extraFilesMapping.get(file);
                }
                return file;
            })
        );
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
