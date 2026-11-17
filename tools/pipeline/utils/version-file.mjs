import path from "path";
import fs from "fs-extra";

export const VARIABLES_DIR = "docs/.vitepress/variables";

/**
 * Copy a repository's Writerside variables file (v.list) from its clone to
 * docs/.vitepress/variables/<target>, where the site reads the values of
 * %name% variables when it builds (markdown-it-ws-vars.ts). Strategies call
 * it from postSync, which runs on every sync, so a version bump alone is
 * picked up too.
 * @param {{gitAddPaths: Set<string>} | undefined} context - Pipeline context;
 *   without one (a sidebar-only run) nothing is copied
 * @param {{id: string, cloneDir: string}} repoConfig
 * @param {string[]} candidates - Paths of the file in the clone; the first that exists is copied
 * @param {string} target - File name in docs/.vitepress/variables/
 */
export async function copyVersionFile(context, repoConfig, candidates, target) {
    if (!context) return;
    const source = candidates
        .map((candidate) => path.join(repoConfig.cloneDir, candidate))
        .find((candidate) => fs.pathExistsSync(candidate));
    if (!source) {
        console.warn(`  Warning: ${repoConfig.id} version file not found in ${candidates.join(", ")}.`);
        return;
    }
    const file = `${VARIABLES_DIR}/${target}`;
    await fs.copy(source, file, {overwrite: true});
    context.gitAddPaths.add(file);
    console.log(`  Copied ${repoConfig.id} version file to ${file}`);
}
