import {defaultStrategy} from "./strategy.mjs";
import path from "path";
import fs from "fs-extra";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";

export const koogStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["docs/docs/**/*.md"],

    postSync: async (repoPath, context, repoConfig) => {
        await syncSidebar(path.join(repoPath, 'docs/mkdocs.yml'), repoConfig.sidebarId);
    },

    /**
     * @override
     */
    postTranslate: async (context, repoConfig) => {
        console.log(`  Handling Koog assets: Copying images - ${repoConfig.cloneDir}... `);
        const {src, dest} = repoConfig.assets;
        const srcPath = path.join(repoConfig.cloneDir, src);
        if (await fs.pathExists(srcPath)) {
            await fs.ensureDir(dest);
            await fs.copy(srcPath, dest, { overwrite: true });
            context.gitAddPaths.add(dest); // 将目标目录加入待提交列表
        } else {
            console.warn(
                `  ⚠️  Warning: Asset source directory not found: ${srcPath}`
            );
        }
    },
};