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
    const repoPath = repoConfig.path;
    const mappedFiles = await Promise.all(
      task.files.map(async (file) => {
        if (extraFilesMapping.has(file)) {
          //'coil-repo\\coil-video\\README.md'
          const src = path.join(repoPath, file);
          //'coil-repo\\docs\\videos.md'
          const dest = path.join(repoPath, extraFilesMapping.get(file));
          await fs.copy(src, dest);

          let content = await fs.readFile(dest, "utf8");
          if (file === "README.md") {
            content = content.replace(
                /(!\[[^\]]*]\()logo\.svg(\))/,
                "$1/coil/coil_full_colored.svg$2"
              );
          }
          content = content.replaceAll("/coil/recipes/#", "/coil/recipes#");
          await fs.writeFile(dest, content, "utf8");

          return extraFilesMapping.get(file);
        }
        return file;
      })
    );
    task.files = mappedFiles;
  },

  /**
   * @override
   */
  postTranslate: async (context, repoConfig) => {
    console.log("  Handling Coil assets: Copying images...");
    const { src, dest } = repoConfig.assets;
    const srcPath = path.join(repoConfig.path, src);
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
