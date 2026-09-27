/**
 * Translations that could not be done in a run — failed after retries, or
 * not started before the time budget ran out — are carried over to the next
 * run in a pending file next to the repository's checkpoint:
 *
 *   .github/last_check_koin.txt            ← upstream commit last synced
 *   .github/last_check_koin.pending.json   ← { "docs/x.md": { langs, reason } }
 *
 * The checkpoint can then move on after every run without losing anything,
 * and a run that retries only needs the missing languages, not whole files.
 */
import fs from "fs-extra";

/**
 * @typedef {Record<string, {langs: string[], reason: string}>} Pending
 */

export function pendingFileFor(repoConfig) {
  return repoConfig.lastCheckFile.replace(/\.txt$/, "") + ".pending.json";
}

/** @returns {Promise<Pending>} */
export async function readPending(repoConfig) {
  const file = pendingFileFor(repoConfig);
  return (await fs.pathExists(file)) ? fs.readJson(file) : {};
}

/**
 * Write the pending file, or remove it when nothing is pending.
 * @param {Pending} pending
 * @returns {Promise<{path: string, removed: boolean} | null>} What changed on disk
 */
export async function writePending(repoConfig, pending) {
  const file = pendingFileFor(repoConfig);
  if (Object.keys(pending).length === 0) {
    if (!(await fs.pathExists(file))) return null;
    await fs.remove(file);
    return { path: file, removed: true };
  }

  const sorted = Object.fromEntries(
    Object.keys(pending)
      .sort()
      .map((key) => [key, { ...pending[key], langs: [...pending[key].langs].sort() }])
  );
  await fs.outputFile(file, JSON.stringify(sorted, null, 2) + "\n");
  return { path: file, removed: false };
}

/**
 * Combine files changed upstream (all languages) with pending ones (only the
 * languages still missing).
 * @param {string[]} changedFiles
 * @param {Pending} pending
 * @param {string[]} languages - Configured target languages, in order
 * @returns {{file: string, langs: string[]}[]}
 */
export function mergeWork(changedFiles, pending, languages) {
  const needed = new Map(
    Object.entries(pending).map(([file, entry]) => [file, new Set(entry.langs)])
  );
  for (const file of changedFiles) needed.set(file, new Set(languages));

  return [...needed]
    .map(([file, langs]) => ({ file, langs: languages.filter((lang) => langs.has(lang)) }))
    .filter((unit) => unit.langs.length > 0);
}
