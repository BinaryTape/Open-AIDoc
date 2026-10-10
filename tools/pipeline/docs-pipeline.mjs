import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import fs from "fs-extra";
import { glob } from "glob";
import { TARGET_LANGUAGES, translateFiles, translateLocaleFiles } from "./translate.mjs";
import { REPOS, validateRepos } from "./repos.config.mjs";
import { mergeWork, readPending, writePending } from "./utils/pending.mjs";
import { FatalApiError } from "./utils/llm-retry.mjs";
import { removeStalePages } from "./utils/stale-pages.mjs";
import { applyRepoArtifacts, exportRepoChanges, formatSyncReport, stageChanges, updatedRepoIds } from "./sync-artifacts.mjs";

const Logger = {
  info: (message) => console.log(`\n✅ ${message}`),
  step: (message) => console.log(`\n➡️ ${message}`),
  error: (message) => console.error(`\n❌ ${message}`),
  dim: (message) => console.log(`  ${message}`),
};

const git = {
  getCurrentSha: async (path) =>
    (await execa("git", ["rev-parse", "HEAD"], { cwd: path })).stdout.trim(),
  // The configured branch (origin/x), which is not always the default one
  clone: async (url, p, b) => execa("git", ["clone", "--branch", b.replace(/^origin\//, ""), url, p]),
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
      await git.clone(repoUrl, repoConfig.cloneDir, repoConfig.branch);
    } else {
      console.log(
        `Repository ${repoConfig.repo} already exists, fetching latest changes...`
      );
      await git.update(repoConfig.cloneDir, repoConfig.branch);
    }
    // Before postSync: a curated sidebar (Koin) then drops the removed pages too
    await removeStale(context, repoConfig);
    await repoConfig.syncStrategy.postSync(
      repoConfig.cloneDir,
      context,
      repoConfig
    );
  }
}

// Remove the pages a repository no longer produces (utils/stale-pages.mjs)
async function removeStale(context, repoConfig) {
  // The other repositories' inventories are in this repository, synced or not
  const repos = [...new Map([...REPOS, ...context.repos].map((r) => [r.id, r])).values()];
  const { removed, held, changed, deleted } = await removeStalePages(repoConfig, repoConfig.cloneDir, {
    repos,
    languages: TARGET_LANGUAGES,
  });
  changed.forEach((p) => context.gitAddPaths.add(p));
  deleted.forEach((p) => context.gitRemovePaths.add(p));
  for (const { page, movedTo } of removed) {
    Logger.dim(`Removed ${repoConfig.docType}/${page}${movedTo ? ` (moved to ${movedTo})` : ""}`);
    context.removedPages.push({ repo: repoConfig.id, page, movedTo });
  }
  if (held) {
    Logger.error(`${repoConfig.id}: stale pages kept, ${held}. Check the upstream repository.`);
    context.removalHeld.push({ repo: repoConfig.id, reason: held });
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
// STAGE 4: COMMIT - Commit (and push) all changes
// =================================================================
async function commit(context, { push = true } = {}) {
  Logger.step("STAGE 4: Finalizing and committing changes...");
  if (context.gitAddPaths.size === 0) {
    Logger.info("No file changes to commit.");
    return;
  }

  await stageChanges(context);
  Logger.dim("Staged the following paths:");
  [...context.gitAddPaths].forEach((p) => Logger.dim(`  - ${p}`));

  const { stdout: status } = await execa("git", ["status", "--porcelain"]);
  if (!status) {
    Logger.info("Working directory is clean after add. Nothing to commit.");
    return;
  }

  // finalize knows the updated repositories from the artifacts; a single run
  // works them out from what it staged
  const updatedRepos = (context.repos ? await updatedRepoIds(context) : context.tasks.map((t) => t.repoConfig.id)).join(", ");
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
  if (!push) return;

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
}

const githubUrl = (repoConfig) => `https://github.com/${repoConfig.repo}.git`;

/**
 * Sync, detect and translate, in the current working directory (the site
 * repository). Nothing is committed.
 * @param {object} [options]
 * @param {typeof REPOS} [options.repos] - Upstream repositories to sync
 * @param {(repoConfig: object) => string} [options.repoUrl] - Where to clone each one from
 * @returns {Promise<object>} The run context
 */
export async function translateRepos({
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
    removedPages: [],
    removalHeld: [],
  };

  await sync(context);
  await detect(context);
  await translate(context);
  return context;
}

/**
 * Translate the sidebar labels, then commit what the run changed.
 * @param {object} context - Context of translateRepos, or of applyRepoArtifacts
 * @param {{push?: boolean}} [options]
 */
export async function publishRun(context, { push = true } = {}) {
  await translateSidebar(context);
  await commit(context, { push });
  reportPending(context);
  Logger.info("Workflow completed successfully.");
}

/**
 * Run every stage in one process: all repositories, one commit, pushed.
 * @param {object} [options] - See translateRepos
 * @returns {Promise<object>} The run context, for inspection
 */
export async function runPipeline(options = {}) {
  const context = await translateRepos(options);
  await publishRun(context);
  return context;
}

/**
 * CI: apply the artifacts of the per-repository jobs, translate the sidebar
 * labels and commit, without pushing (the workflow pushes the sync branch).
 * @returns {Promise<string>} Markdown report of the run
 */
export async function finalizeRun({ artifactsDir, expected }) {
  const { context, results } = await applyRepoArtifacts(artifactsDir, expected);
  await publishRun(context, { push: false });
  return formatSyncReport(results, context);
}

function selectRepos(ids) {
  if (ids.length === 0) return REPOS;
  const unknown = ids.filter((id) => !REPOS.some((r) => r.id === id));
  if (unknown.length > 0) throw new Error(`Unknown repository id(s): ${unknown.join(", ")}`);
  return REPOS.filter((r) => ids.includes(r.id));
}

function parseArgs(argv) {
  const [command, rest] = !argv[0] || argv[0].startsWith("--") ? ["run", argv] : [argv[0], argv.slice(1)];
  const options = { repo: [] };
  for (let i = 0; i < rest.length; i++) {
    const name = rest[i].replace(/^--/, "");
    const value = rest[++i] ?? "";
    if (name === "repo") options.repo.push(...value.split(",").filter(Boolean));
    else options[name] = value;
  }
  return { command, options };
}

/**
 * Commands:
 *   (none) [--repo id]               sync, translate and push, all in one process
 *   list [--repo id]                 print `repos=[…]` for a GitHub Actions output
 *   translate --repo id --out dir    CI: translate one repository, export the changes
 *   finalize --artifacts dir --expect '["id",…]' [--report file]
 *                                    CI: apply every job's changes and commit (no push)
 */
async function main(argv) {
  const { command, options } = parseArgs(argv);
  try {
    if (command === "list") {
      console.log(`repos=${JSON.stringify(selectRepos(options.repo).map((r) => r.id))}`);
      return;
    }
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY environment variable is not set.");
    }

    if (command === "run") {
      await runPipeline({ repos: selectRepos(options.repo) });
    } else if (command === "translate") {
      if (!options.out || options.repo.length === 0) throw new Error("translate needs --repo and --out");
      const context = await translateRepos({ repos: selectRepos(options.repo) });
      reportPending(context);
      await exportRepoChanges(context, options.out);
    } else if (command === "finalize") {
      if (!options.artifacts || !options.expect) throw new Error("finalize needs --artifacts and --expect");
      const report = await finalizeRun({ artifactsDir: options.artifacts, expected: JSON.parse(options.expect) });
      if (options.report) await fs.outputFile(options.report, report);
      console.log(report);
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    Logger.error("Workflow failed with an error:");
    console.error(error);
    // 3: a credentials problem, which retrying the job cannot fix
    process.exit(error instanceof FatalApiError ? 3 : 1);
  }
}

// Run only when executed as a script, not when imported (e.g. by tests).
const isEntryPoint =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  process.env.GIT_AUTHOR_NAME =
    process.env.GIT_AUTHOR_NAME || "github-actions[bot]";
  process.env.GIT_AUTHOR_EMAIL =
    process.env.GIT_AUTHOR_EMAIL ||
    "github-actions[bot]@users.noreply.github.com";
  await main(process.argv.slice(2));
}
