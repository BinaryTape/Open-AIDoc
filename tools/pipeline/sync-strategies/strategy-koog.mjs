import {defaultStrategy} from "./strategy.mjs";
import path from "path";
import fs from "fs-extra";
import {syncSidebar} from "../processors/SidebarProcessor.mjs";
import {LINKS_FILE, syncKoogApiLinks} from "../utils/koog-api-links.mjs";
import {toContentRelPath} from "../../../shared/content-paths.ts";

const config = fs.readJsonSync(new URL("../translate-config.json", import.meta.url));

export const koogStrategy = {
    ...defaultStrategy,

    /**
     * @override
     */
    getDocPatterns: () => ["docs/docs/**/*.md"],

    postSync: async (repoPath, context, repoConfig) => {
        await syncSidebar(path.join(repoPath, 'docs/mkdocs.yml'), repoConfig.sidebarId);

        // The API links of the upstream docs and of every published translation
        const docDirs = [
            path.join(repoPath, repoConfig.sourceDocRoot),
            ...config.targetLanguages.map((lang) => path.join("docs", toContentRelPath(lang, repoConfig.docType, ""))),
        ];
        if (await syncKoogApiLinks(docDirs)) context?.gitAddPaths.add(LINKS_FILE);
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