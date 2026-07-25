import { execa } from "execa";
import fs from "fs-extra";
import { glob } from "glob";
import { translateFiles, translateLocaleFiles } from "./translate.mjs";
import { REPOS, validateRepos } from "./repos.config.mjs";

const Logger = {
  info: (message) => console.log(`\n✅ ${message}`),
  step: (message) => console.log(`\n➡️ ${message}`),
  error: (message) => console.error(`\n❌ ${message}`),
  dim: (message) => console.log(`  ${message}`),
};

const git = {
  getCurrentSha: async (path) =>
    (await execa("git", ["rev-parse", "HEAD"], { cwd: path })).stdout.trim(),
  clone: async (url, p) => execa("git", ["clone", url, p]),
  update: async (p, b) => {
    await execa("git", ["fetch", "--all"], { cwd: p });
    await execa("git", ["reset", "--hard", b], { cwd: p });
    await execa("git", ["clean", "-fd"], { cwd: p });
  },
  getChangedFiles: async (p, sha) =>
    (
      await execa("git", ["diff", "--name-only", sha, "HEAD"], { cwd: p })
    ).stdout
      .split("\n")
      .filter(Boolean),
};
const files = {
  getLastCommitSha: async (p) =>
    (await fs.pathExists(p)) ? (await fs.readFile(p, "utf-8")).trim() : null,
  find: async (p, ptns) =>
    [
      ...new Set(
        (
          await Promise.all(
            ptns.map((ptn) => glob(ptn, { cwd: p, nodir: true, dot: true }))
          )
        ).flat()
      ),
    ].map((fp) => fp.replace(/\\/g, "/")),
};

// =================================================================
// STAGE 1: SYNC - Clone repositories and prepare
// =================================================================
async function sync(context) {
  Logger.step("STAGE 1: Setting up repositories...");
  for (const repoConfig of context.repos) {
    console.log(`\n--- Processing repository: ${repoConfig.id} (${repoConfig.docType}) ---`);
    const repoExists = await fs.pathExists(repoConfig.cloneDir);
    const repoUrl = `https://github.com/${repoConfig.repo}.git`;

    if (!repoExists) {
      console.log(`Cloning full history of ${repoConfig.repo}...`);
      await git.clone(repoUrl, repoConfig.cloneDir);
    } else {
      console.log(
        `Repository ${repoConfig.repo} already exists, fetching latest changes...`
      );
      await git.update(repoConfig.cloneDir, repoConfig.branch);
    }
    await repoConfig.syncStrategy.postSync(
      repoConfig.cloneDir,
      context,
      repoConfig
    );
  }
}

// =================================================================
// STAGE 2: DETECT - Detect changes and generate tasks
// =================================================================
async function detect(context) {
  Logger.step("STAGE 2: Detecting changes...");
  for (const repoConfig of context.repos) {
    const lastSha = await files.getLastCommitSha(repoConfig.lastCheckFile);
    const currentSha = await git.getCurrentSha(repoConfig.cloneDir);

    Logger.info(`Checking: ${repoConfig.id}`);
    Logger.dim(`Current SHA: ${currentSha}`);
    Logger.dim(`Last checked SHA: ${lastSha || "N/A"}`);

    const isFirstRun = !lastSha;
    const hasChanged = lastSha !== currentSha;

    if (isFirstRun || hasChanged) {
      Logger.dim(
        isFirstRun
          ? "First run, processing all doc files."
          : "Repository has changed, finding changed doc files."
      );
      const docPatterns = repoConfig.syncStrategy.getDocPatterns();
      const allDocs = await files.find(repoConfig.cloneDir, docPatterns);
      const changedDocs = isFirstRun
        ? allDocs
        : (await git.getChangedFiles(repoConfig.cloneDir, lastSha)).filter(
            (f) => allDocs.includes(f)
          );

      if (changedDocs.length > 0) {
        Logger.dim(`Found ${changedDocs.length} changed document(s).`);
        Logger.dim(changedDocs.map((f) => `  - ${f}`).join("\n"));
        const task = {
          repoConfig,
          files: changedDocs,
          newSha: currentSha,
        };
        await repoConfig.syncStrategy.postDetect(repoConfig, task);
        context.tasks.push(task);
      } else {
        Logger.dim("No relevant documents changed, updating checkpoint.");
        await fs.outputFile(repoConfig.lastCheckFile, currentSha);
        context.gitAddPaths.add(repoConfig.lastCheckFile);
      }
    } else {
      Logger.dim("No new commits detected in the repository.");
    }
  }
}

// =================================================================
// STAGE 3: TRANSLATE - Execute translation tasks
// =================================================================
async function translate(context) {
  Logger.step("STAGE 3: Executing tasks...");
  if (context.tasks.length === 0) {
    Logger.info("No tasks to execute.");
    return;
  }

  for (const task of context.tasks) {
    const { repoConfig, files: filesToTranslate } = task;
    Logger.info(`Processing task for: ${repoConfig.id}`);

    console.log("\n--- Starting translation process ---");
    console.log(
      `Translating ${filesToTranslate.length} files for ${repoConfig.id} (${repoConfig.docType})...`
    );

    const translatedPaths = await translateFiles(repoConfig, filesToTranslate);
    translatedPaths.forEach((p) => context.gitAddPaths.add(p));

    await repoConfig.syncStrategy.postTranslate(context, repoConfig);

    await fs.outputFile(repoConfig.lastCheckFile, task.newSha);
    context.gitAddPaths.add(repoConfig.lastCheckFile);
  }
}

// =================================================================
// STAGE 3.1: TRANSLATE - Translate sidebar
// =================================================================
async function translateSidebar(context) {
  Logger.step("STAGE 3.1: Translating sidebar...");
  let localeFiles = await files.find("docs/.vitepress/locales", ["*.json"]);
  localeFiles = localeFiles.filter((f) => !f.endsWith("en.json"));
  context.gitAddPaths.add("docs/.vitepress/locales/en.json");

  const translatedPaths = await translateLocaleFiles(localeFiles);
  translatedPaths.forEach((p) => context.gitAddPaths.add(p));
}

// =================================================================
// STAGE 4: COMMIT - Push all changes to the repository
// =================================================================
async function commit(context) {
  Logger.step("STAGE 4: Finalizing and committing changes...");
  if (context.gitAddPaths.size === 0) {
    Logger.info("No file changes to commit.");
    return;
  }

  const sidebarFiles = await files.find("docs/.vitepress/sidebar", ["*.json"]);
  sidebarFiles.forEach((f) =>
    context.gitAddPaths.add(`docs/.vitepress/sidebar/${f}`)
  );

  const pathsToAdd = [...context.gitAddPaths];
  Logger.dim("Adding the following paths to git:");
  pathsToAdd.forEach((p) => Logger.dim(`  - ${p}`));
  await execa("git", ["add", ...pathsToAdd]);

  const { stdout: status } = await execa("git", ["status", "--porcelain"]);
  if (!status) {
    Logger.info("Working directory is clean after add. Nothing to commit.");
    return;
  }

  const updatedRepos = context.tasks.map((t) => t.repoConfig.id).join(", ");
  const commitMessage = `docs: [${updatedRepos}] Sync and translate upstream documentation`;

  await execa("git", [
    "-c",
    `user.name=${process.env.GIT_AUTHOR_NAME}`,
    "-c",
    `user.email=${process.env.GIT_AUTHOR_EMAIL}`,
    "commit",
    "-m",
    commitMessage,
  ]);

  const branchName = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (!branchName) throw new Error("Could not determine branch to push to.");

  Logger.info(`Pushing changes to branch: ${branchName}`);
  await execa("git", ["push", "origin", `HEAD:${branchName}`]);
}

async function main() {
  Logger.info("Starting Documentation Synchronization Workflow...");
  validateRepos(REPOS);

  const context = {
    repos: REPOS,
    tasks: [],
    gitAddPaths: new Set(),
  };

  try {
    await sync(context);
    await detect(context);
    await translate(context);
    await translateSidebar(context);
    await commit(context);

    Logger.info("Workflow completed successfully.");
  } catch (error) {
    Logger.error("Workflow failed with an error:");
    console.error(error);
    process.exit(1);
  }
}

(async () => {
  process.env.GIT_AUTHOR_NAME =
    process.env.GIT_AUTHOR_NAME || "github-actions[bot]";
  process.env.GIT_AUTHOR_EMAIL =
    process.env.GIT_AUTHOR_EMAIL ||
    "github-actions[bot]@users.noreply.github.com";
  // Uncomment the next line to simulate a specific branch name for testing
  // process.env.GITHUB_REF_NAME = "docs-update-branch";
  console.log("Starting documentation pipeline script...");
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY environment variable is not set.");
    process.exit(1);
  }
  await main();
})();
