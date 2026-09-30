import fs from "fs-extra";
import path from "path";
import { defaultStrategy } from "./strategy.mjs";

const extraFilesMapping = new Map([
  ["CHANGELOG.md", "docs/changelog.md"],
  ["README.md", "docs/overview.md"],
  ["coil-test/README.md", "docs/testing.md"],
  ["coil-video/README.md", "docs/videos.md"],
  ["coil-svg/README.md", "docs/svgs.md"],
  ["coil-gif/README.md", "docs/gifs.md"],
  ["coil-network-core/README.md", "docs/network.md"],
  ["coil-compose/README.md", "docs/compose.md"],
  // Copied into docs/ by the upstream docs build (mkdocs.yml nav: Contributing)
  [".github/ISSUE_TEMPLATE/CONTRIBUTING.md", "docs/contributing.md"],
]);

export const coilStrategy = {
  ...defaultStrategy,

  getDocPatterns: () => ["docs/**/*.md", ...extraFilesMapping.keys()],

  /**
   * @override
   */
  postSync: async (repoPath) => {},

  /**
   * @override
   */
  postDetect: async (repoConfig, task) => {
    console.log("  Running Coil postDetect: Copying root markdown files...");
    // Every mapped page is copied, not only the changed ones: pages carried
    // over in the pending file are read from their docs/ path too.
    await copyExtraFiles(repoConfig.cloneDir);
    task.files = task.files.map((file) => extraFilesMapping.get(file) ?? file);
  },

  /**
   * @override
   */
  postTranslate: async (context, repoConfig) => {
    console.log("  Handling Coil assets: Copying images...");
    const { src, dest } = repoConfig.assets;
    const srcPath = path.join(repoConfig.cloneDir, src);
    if (await fs.pathExists(srcPath)) {
      await fs.ensureDir(dest);
      await fs.copy(srcPath, dest, { overwrite: true });
      context.gitAddPaths.add(dest);
    } else {
      console.warn(
        `  ⚠️  Warning: Asset source directory not found: ${srcPath}`
      );
    }
  },
};

/**
 * Copy the markdown files kept outside docs/ upstream to their docs/ path in
 * the clone, the way the upstream docs build does.
 * @param {string} repoPath - Path to the coil clone
 */
export async function copyExtraFiles(repoPath) {
  for (const [file, docPath] of extraFilesMapping) {
    const src = path.join(repoPath, file);
    if (!(await fs.pathExists(src))) {
      console.warn(`  ⚠️  Warning: ${file} not found in ${repoPath}`);
      continue;
    }

    let content = await fs.readFile(src, "utf8");
    if (file === "README.md") {
      content = content.replace(
        /(!\[[^\]]*]\()logo\.svg(\))/,
        "$1/coil/coil_full_colored.svg$2"
      );
    }
    content = content.replaceAll("/coil/recipes/#", "/coil/recipes#");
    await fs.outputFile(path.join(repoPath, docPath), content, "utf8");
  }
}
