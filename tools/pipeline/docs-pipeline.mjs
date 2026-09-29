import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import fs from "fs-extra";
import { glob } from "glob";
import { TARGET_LANGUAGES, translateFiles, translateLocaleFiles } from "./translate.mjs";
import { REPOS, validateRepos } from "./repos.config.mjs";
import { mergeWork, readPending, writePending } from "./utils/pending.mjs";

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
    const repoUrl = context.repoUrl(repoConfig);

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
    const pending = await readPending(repoConfig);
    const pendingCount = Object.keys(pending).length;

    Logger.info(`Checking: ${repoConfig.id}`);
    Logger.dim(`Current SHA: ${currentSha}`);
    Logger.dim(`Last checked SHA: ${lastSha || "N/A"}`);
    if (pendingCount > 0) {
      Logger.dim(`Pending from earlier runs: ${pendingCount} document(s).`);
    }

    const isFirstRun = !lastSha;
    const hasChanged = lastSha !== currentSha;

    let changedDocs = [];
    if (isFirstRun || hasChanged) {
      Logger.dim(
        isFirstRun
          ? "First run, processing all doc files."
          : "Repository has changed, finding changed doc files."
      );
      const docPatterns = repoConfig.syncStrategy.getDocPatterns();
      const allDocs = await files.find(repoConfig.cloneDir, docPatterns);
      changedDocs = isFirstRun
        ? allDocs
        : (await git.getChangedFiles(repoConfig.cloneDir, lastSha)).filter(
            (f) => allDocs.includes(f)
          );
    } else {
      Logger.dim("No new commits detected in the repository.");
    }

    if (changedDocs.length === 0 && pendingCount === 0) {
      if (isFirstRun || hasChanged) {
        Logger.dim("No relevant documents changed, updating checkpoint.");
        await fs.outputFile(repoConfig.lastCheckFile, currentSha);
        context.gitAddPaths.add(repoConfig.lastCheckFile);
      }
      continue;
    }

    if (changedDocs.length > 0) {
      Logger.dim(`Found ${changedDocs.length} changed document(s).`);
      Logger.dim(changedDocs.map((f) => `  - ${f}`).join("\n"));
    }
    const task = {
      repoConfig,
      files: changedDocs,
      newSha: currentSha,
    };
    // Also run for pending-only tasks: strategies prepare the clone here
    // (flattening, topic conversion) and pending paths refer to that layout.
    await repoConfig.syncStrategy.postDetect(repoConfig, task);
    // Changed documents need every language; pending ones only those missing.
    task.work = mergeWork(task.files, pending, TARGET_LANGUAGES);
    context.tasks.push(task);
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
    const { repoConfig, work } = task;
    Logger.info(`Processing task for: ${repoConfig.id}`);

    console.log("\n--- Starting translation process ---");
    const { translatedPaths, pending } = await translateFiles(repoConfig, work);
    translatedPaths.forEach((p) => context.gitAddPaths.add(p));

    await repoConfig.syncStrategy.postTranslate(context, repoConfig);

    // What could not be translated is carried over in the pending file, so the
    // checkpoint can move on without losing it.
    const pendingChange = await writePending(repoConfig, pending);
    if (pendingChange?.removed) context.gitRemovePaths.add(pendingChange.path);
    else if (pendingChange) context.gitAddPaths.add(pendingChange.path);
    for (const [file, { langs, reason }] of Object.entries(pending)) {
      context.pendingReport.push({ repo: repoConfig.id, file, langs, reason });
    }

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
  if (context.gitRemovePaths.size > 0) {
    // Pending files emptied in this run; untracked ones are simply gone.
    await execa("git", ["rm", "--cached", "--ignore-unmatch", "--quiet", "--", ...context.gitRemovePaths]);
  }

  const { stdout: status } = await execa("git", ["status", "--porcelain"]);
  if (!status) {
    Logger.info("Working directory is clean after add. Nothing to commit.");
    return;
  }

  const updatedRepos = context.tasks.map((t) => t.repoConfig.id).join(", ");
  const commitMessage = `docs: [${updatedRepos}] Sync and translate upstream documentation`;

  const authorName = process.env.GIT_AUTHOR_NAME;
  const authorEmail = process.env.GIT_AUTHOR_EMAIL;
  if (!authorName || !authorEmail) {
    throw new Error(
      "GIT_AUTHOR_NAME and GIT_AUTHOR_EMAIL must be set for sync commits"
    );
  }
  const committerName = process.env.GIT_COMMITTER_NAME || authorName;
  const committerEmail = process.env.GIT_COMMITTER_EMAIL || authorEmail;

  await execa(
    "git",
    ["-c", `user.name=${committerName}`, "-c", `user.email=${committerEmail}`, "commit", "-m", commitMessage],
    {
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: authorName,
        GIT_AUTHOR_EMAIL: authorEmail,
        GIT_COMMITTER_NAME: committerName,
        GIT_COMMITTER_EMAIL: committerEmail,
      },
    }
  );

  const branchName = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
  if (!branchName) throw new Error("Could not determine branch to push to.");

  Logger.info(`Pushing changes to branch: ${branchName}`);
  await execa("git", ["push", "origin", `HEAD:${branchName}`]);
}

// =================================================================
// REPORT - List what is carried over to the next run
// =================================================================
function reportPending(context) {
  const rows = context.pendingReport;
  if (rows.length === 0) {
    Logger.info("Every queued translation completed.");
    return;
  }

  Logger.error(`${rows.length} document(s) left pending for the next run:`);
  rows.forEach(({ repo, file, langs, reason }) =>
    Logger.dim(`[${repo}] ${file} (${langs.join(", ")}): ${reason}`)
  );

  if (process.env.GITHUB_STEP_SUMMARY) {
    const escape = (text) => String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
    const lines = [
      "## Translations pending for the next run",
      "",
      "| Repository | Document | Languages | Reason |",
      "| --- | --- | --- | --- |",
      ...rows.map(({ repo, file, langs, reason }) =>
        `| ${repo} | \`${escape(file)}\` | ${langs.join(", ")} | ${escape(reason)} |`
      ),
      "",
    ];
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  }
}

const githubUrl = (repoConfig) => `https://github.com/${repoConfig.repo}.git`;

/**
 * Run every stage in the current working directory (the site repository).
 * @param {object} [options]
 * @param {typeof REPOS} [options.repos] - Upstream repositories to sync
 * @param {(repoConfig: object) => string} [options.repoUrl] - Where to clone each one from
 * @returns {Promise<object>} The run context, for inspection
 */
export async function runPipeline({
  repos = REPOS,
  repoUrl = githubUrl,
} = {}) {
  Logger.info("Starting Documentation Synchronization Workflow...");
  validateRepos(repos);

  const context = {
    repos,
    repoUrl,
    tasks: [],
    gitAddPaths: new Set(),
    gitRemovePaths: new Set(),
    pendingReport: [],
  };

  await sync(context);
  await detect(context);
  await translate(context);
  await translateSidebar(context);
  await commit(context);
  reportPending(context);

  Logger.info("Workflow completed successfully.");
  return context;
}

async function main() {
  try {
    await runPipeline();
  } catch (error) {
    Logger.error("Workflow failed with an error:");
    console.error(error);
    process.exit(1);
  }
}

// Run only when executed as a script, not when imported (e.g. by tests).
const isEntryPoint =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) (async () => {
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
