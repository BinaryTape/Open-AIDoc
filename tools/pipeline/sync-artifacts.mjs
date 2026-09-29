/**
 * Hand-off between the per-repository sync jobs and the job that commits.
 *
 * Every upstream repository is translated in its own CI job, all starting
 * from the same commit of this repository. A job does not commit: it exports
 * what its run changed as an artifact, and one final job applies them all and
 * makes a single commit, so the jobs never race each other to push.
 *
 *   sync-<id>/
 *     summary.json   ← repo, changed and deleted paths, locale delta, pending
 *     files/…        ← the changed files, at their paths in this repository
 *
 * The locale files are the only files several repositories write to (each
 * adds its own `<docType>.*` sidebar labels), so they travel as a key delta
 * and are merged, not copied. Artifacts are applied in REPOS order, which is
 * the order a single run writes in; overlapping files (shared image folders)
 * end up exactly as a single run would leave them.
 */
import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import { glob } from "glob";

const LOCALE_DIR = "docs/.vitepress/locales";
const SIDEBAR_DIR = "docs/.vitepress/sidebar";

/**
 * Stage what a run changed: the paths it recorded, every sidebar file (a
 * strategy may regenerate any of them) and pending files it removed.
 */
export async function stageChanges(context) {
  const sidebarFiles = await glob("*.json", { cwd: SIDEBAR_DIR });
  sidebarFiles.forEach((f) => context.gitAddPaths.add(`${SIDEBAR_DIR}/${f}`));

  if (context.gitAddPaths.size > 0) {
    await execa("git", ["add", "-A", "--", ...context.gitAddPaths]);
  }
  if (context.gitRemovePaths.size > 0) {
    // Pending files emptied in this run; untracked ones are simply gone.
    await execa("git", ["rm", "--cached", "--ignore-unmatch", "--quiet", "--", ...context.gitRemovePaths]);
  }
}

async function readJson(file) {
  return (await fs.pathExists(file)) ? fs.readJson(file) : {};
}

async function headJson(file) {
  try {
    return JSON.parse((await execa("git", ["show", `HEAD:${file}`])).stdout);
  } catch {
    return {};
  }
}

/**
 * Export the changes of a translate-only run.
 * @param {object} context - Context returned by translateRepos
 * @param {string} outDir - Artifact directory, emptied first
 * @returns {Promise<object>} The summary written to summary.json
 */
export async function exportRepoChanges(context, outDir) {
  await fs.emptyDir(outDir);
  await stageChanges(context);

  const { stdout } = await execa("git", ["diff", "--cached", "--name-status", "--no-renames", "-z"]);
  const fields = stdout.split("\0").filter(Boolean);
  const files = [];
  const deleted = [];
  for (let i = 0; i < fields.length; i += 2) {
    const [status, file] = [fields[i], fields[i + 1]];
    if (file.startsWith(`${LOCALE_DIR}/`)) continue;
    if (status === "D") {
      deleted.push(file);
    } else {
      files.push(file);
      await fs.copy(file, path.join(outDir, "files", file));
    }
  }

  // Sidebar labels a strategy registered in the locale files
  const locales = {};
  for (const name of await glob("*.json", { cwd: LOCALE_DIR })) {
    const file = `${LOCALE_DIR}/${name}`;
    const [before, after] = [await headJson(file), await readJson(file)];
    const delta = Object.fromEntries(Object.entries(after).filter(([key, value]) => before[key] !== value));
    if (Object.keys(delta).length > 0) locales[name] = delta;
  }

  const summary = {
    repos: context.repos.map((r) => r.id),
    updated: context.tasks.map((t) => t.repoConfig.id),
    files,
    deleted,
    locales,
    pending: context.pendingReport,
  };
  await fs.outputJson(path.join(outDir, "summary.json"), summary, { spaces: 2 });
  return summary;
}

/**
 * Apply the artifacts of every expected repository to the working tree.
 * @param {string} artifactsDir - Directory holding one `sync-<id>/` per job
 * @param {string[]} expected - Repository ids the run was meant to sync, in REPOS order
 * @returns {Promise<{context: object, results: {id: string, status: "updated" | "unchanged" | "failed", files: number}[]}>}
 *   `context` is ready for the commit stage.
 */
export async function applyRepoArtifacts(artifactsDir, expected) {
  const context = {
    tasks: [],
    gitAddPaths: new Set(),
    gitRemovePaths: new Set(),
    pendingReport: [],
  };
  const results = [];
  const localeUpdates = {};

  for (const id of expected) {
    const dir = path.join(artifactsDir, `sync-${id}`);
    const summaryFile = path.join(dir, "summary.json");
    if (!(await fs.pathExists(summaryFile))) {
      // The job failed or was cancelled: nothing of this repository is
      // committed and its checkpoint stays, so the next run redoes it.
      results.push({ id, status: "failed", files: 0 });
      continue;
    }

    const summary = await fs.readJson(summaryFile);
    for (const file of summary.files) {
      await fs.copy(path.join(dir, "files", file), file, { overwrite: true });
      context.gitAddPaths.add(file);
    }
    for (const file of summary.deleted) {
      await fs.remove(file);
      context.gitRemovePaths.add(file);
    }
    for (const [name, delta] of Object.entries(summary.locales)) {
      Object.assign((localeUpdates[name] ??= {}), delta);
    }
    context.pendingReport.push(...summary.pending);
    summary.updated.forEach((updatedId) => context.tasks.push({ repoConfig: { id: updatedId } }));

    const changed = summary.files.length + summary.deleted.length + Object.keys(summary.locales).length;
    results.push({ id, status: changed > 0 ? "updated" : "unchanged", files: summary.files.length + summary.deleted.length });
  }

  for (const [name, delta] of Object.entries(localeUpdates)) {
    const file = `${LOCALE_DIR}/${name}`;
    await fs.outputFile(file, JSON.stringify({ ...(await readJson(file)), ...delta }, null, 2) + "\n");
    context.gitAddPaths.add(file);
  }

  return { context, results };
}

/**
 * Markdown report of a sync run, for the sync pull request and the job summary.
 */
export function formatSyncReport(results, pendingRows) {
  const escape = (text) => String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
  const label = { updated: "✅ updated", unchanged: "— no changes", failed: "❌ failed, retried next run" };
  const lines = [
    "## Upstream documentation sync",
    "",
    "| Repository | Result | Files |",
    "| --- | --- | --- |",
    ...results.map(({ id, status, files }) => `| ${id} | ${label[status]} | ${status === "failed" ? "" : files} |`),
    "",
  ];

  const failed = results.filter((r) => r.status === "failed").map((r) => r.id);
  if (failed.length > 0) {
    lines.push(
      `Failed repositories keep their checkpoint and are synced again by the next run. ` +
        `To retry now, use **Re-run failed jobs** on the workflow run, or run the workflow with ` +
        `\`repo\` set to one of: ${failed.map((id) => `\`${id}\``).join(", ")}.`,
      ""
    );
  }

  if (pendingRows.length > 0) {
    lines.push(
      "### Translations pending for the next run",
      "",
      "| Repository | Document | Languages | Reason |",
      "| --- | --- | --- | --- |",
      ...pendingRows.map(({ repo, file, langs, reason }) =>
        `| ${repo} | \`${escape(file)}\` | ${langs.join(", ")} | ${escape(reason)} |`
      ),
      ""
    );
  }
  return lines.join("\n");
}
