/**
 * Pages removed or moved upstream are removed from the site.
 *
 * Every sync records which pages a repository's docs produce, next to its
 * checkpoint:
 *
 *   .github/last_check_koog.txt         ← upstream commit last synced
 *   .github/last_check_koog.pages.json  ← ["agents/basic-agents.md", ...]
 *
 * A page in the previous inventory that the repository no longer produces,
 * and no other repository of the same doc type does (the Kotlin family
 * shares docs/kotlin/), was deleted or moved upstream: its translations are
 * removed. Pages the site keeps itself (Koin's support/) are in no inventory
 * and never touched. When upstream declares where a page moved
 * (SyncStrategy.getMovedPages), a redirect is recorded in
 * docs/.vitepress/redirects/<repo>.json; the site build turns those into
 * Cloudflare Pages' _redirects.
 */
import fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";
import { toContentRelPath } from "../../../shared/content-paths.ts";
import { readPending, writePending } from "./pending.mjs";

export const REDIRECTS_DIR = "docs/.vitepress/redirects";

// A sync removing more than this share of a repository's pages is more likely
// a broken clone or an upstream restructuring than deletions: nothing is
// removed and the report asks for a look.
const MAX_REMOVED_SHARE = 0.5;
const MIN_REMOVED_LIMIT = 5;

export const inventoryFileFor = (repoConfig) => repoConfig.lastCheckFile.replace(/\.txt$/, "") + ".pages.json";
export const redirectsFileFor = (repoConfig) => `${REDIRECTS_DIR}/${repoConfig.id}.json`;

const docRoot = (repoConfig) => path.posix.normalize(repoConfig.sourceDocRoot.replaceAll("\\", "/"));

/**
 * The pages a clone's docs produce, relative to the doc root: what the
 * pipeline translates them to (SyncStrategy.mapDocPath).
 * @returns {Promise<string[]>}
 */
export async function pagesOf(repoConfig, cloneDir) {
  const strategy = repoConfig.syncStrategy;
  const found = await Promise.all(strategy.getDocPatterns().map((pattern) => glob(pattern, { cwd: cloneDir, nodir: true, dot: true })));
  const root = docRoot(repoConfig);
  const pages = new Set();
  for (const file of found.flat().map((f) => f.replaceAll("\\", "/"))) {
    const mapped = strategy.mapDocPath(file);
    if (!mapped) continue;
    const page = path.posix.relative(root, mapped);
    if (!page.startsWith("..")) pages.add(page);
  }
  return [...pages].sort();
}

/** @returns {Promise<string[] | null>} null before the first inventory */
export async function readInventory(repoConfig) {
  const file = inventoryFileFor(repoConfig);
  return (await fs.pathExists(file)) ? fs.readJson(file) : null;
}

async function readRedirects(repoConfig) {
  const file = redirectsFileFor(repoConfig);
  return (await fs.pathExists(file)) ? fs.readJson(file) : [];
}

/** Write a JSON file when its content changes; returns whether it did. */
async function writeJsonIfChanged(file, data) {
  const text = JSON.stringify(data, null, 2) + "\n";
  if ((await fs.pathExists(file)) && (await fs.readFile(file, "utf8")) === text) return false;
  await fs.outputFile(file, text);
  return true;
}

/**
 * Compare a repository's pages with its previous inventory and remove the
 * pages it no longer produces. Run in the site repository, with the clone
 * updated.
 * @param {object} repoConfig
 * @param {string} cloneDir
 * @param {{repos: object[], languages: string[]}} options - Every configured
 *   repository (for the pages of the others), and the target languages
 * @returns {Promise<{
 *   removed: {page: string, movedTo: string | null}[],
 *   held: string | null,
 *   changed: string[],
 *   deleted: string[],
 * }>} `held`: why stale pages were not removed; `changed`: files written;
 *   `deleted`: files removed
 */
export async function removeStalePages(repoConfig, cloneDir, { repos, languages }) {
  const result = { removed: [], held: null, changed: [], deleted: [] };
  const current = await pagesOf(repoConfig, cloneDir);
  const previous = await readInventory(repoConfig);
  const currentSet = new Set(current);

  let stale = [];
  if (previous) {
    const claimed = new Set(current);
    for (const other of repos) {
      if (other.id === repoConfig.id || other.docType !== repoConfig.docType) continue;
      (await readInventory(other))?.forEach((page) => claimed.add(page));
    }
    stale = previous.filter((page) => !claimed.has(page));
  }

  const limit = Math.max(MIN_REMOVED_LIMIT, (previous?.length ?? 0) * MAX_REMOVED_SHARE);
  if (current.length === 0 || stale.length > limit) {
    // Keep the previous inventory, so the next sync weighs the same pages again.
    result.held = current.length === 0
      ? "upstream produced no pages"
      : `${stale.length} of ${previous.length} pages would be removed`;
    return result;
  }

  // Remove the translations of every stale page
  for (const page of stale) {
    for (const lang of languages) {
      const target = path.posix.join("docs", toContentRelPath(lang, repoConfig.docType, page));
      if (await fs.pathExists(target)) {
        await fs.remove(target);
        result.deleted.push(target);
      }
    }
  }

  // ...and what was queued for them
  const pending = await readPending(repoConfig);
  const root = docRoot(repoConfig);
  let pendingChanged = false;
  for (const page of stale) {
    const key = path.posix.join(root, page);
    if (pending[key]) {
      delete pending[key];
      pendingChanged = true;
    }
  }
  if (pendingChanged) {
    const change = await writePending(repoConfig, pending);
    if (change?.removed) result.deleted.push(change.path);
    else if (change) result.changed.push(change.path);
  }

  // Redirect each stale page upstream moved to a page it still produces
  const moved = await repoConfig.syncStrategy.getMovedPages(cloneDir);
  const finalTarget = (page) => {
    const seen = new Set([page]);
    let target = moved.get(page);
    while (target && moved.has(target) && !seen.has(target)) {
      seen.add(target);
      target = moved.get(target);
    }
    return target && currentSet.has(target) ? target : null;
  };
  const full = (page) => `${repoConfig.docType}/${page}`;
  const staleSet = new Set(stale.map(full));
  const redirects = new Map((await readRedirects(repoConfig)).map((r) => [r.from, r.to]));
  for (const page of stale) {
    const target = finalTarget(page);
    result.removed.push({ page, movedTo: target });
    if (target) redirects.set(full(page), full(target));
  }
  for (const [from, to] of redirects) {
    // A page that is back is no longer redirected; a redirect to a page
    // removed now follows it, or goes.
    if (currentSet.has(from.slice(repoConfig.docType.length + 1))) redirects.delete(from);
    else if (staleSet.has(to)) {
      const target = finalTarget(to.slice(repoConfig.docType.length + 1));
      if (target) redirects.set(from, full(target));
      else redirects.delete(from);
    }
  }
  const redirectList = [...redirects].sort(([a], [b]) => a.localeCompare(b)).map(([from, to]) => ({ from, to }));
  if (redirectList.length > 0 || (await fs.pathExists(redirectsFileFor(repoConfig)))) {
    if (await writeJsonIfChanged(redirectsFileFor(repoConfig), redirectList)) result.changed.push(redirectsFileFor(repoConfig));
  }

  if (await writeJsonIfChanged(inventoryFileFor(repoConfig), current)) result.changed.push(inventoryFileFor(repoConfig));
  return result;
}
