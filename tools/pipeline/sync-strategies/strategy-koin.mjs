import path from "node:path";
import fs from "fs-extra";
import { glob } from "glob";
import { defaultStrategy } from "./strategy.mjs";
import { writeSidebar } from "../processors/SidebarProcessor.mjs";
import { fetchKoinSnapshot, koinSidebar, pageFiles, siteRedirects } from "../utils/koin-llms.mjs";
import { snapshotSource } from "../utils/snapshot-source.mjs";

/** Page file in the clone (docs/intro/index.md) → path under /docs/ on the site (intro). */
const urlOf = (file) => file.replace(/^docs\//, "").replace(/\.md$/, "").replace(/(^|\/)index$/, "");

async function clonePages(repoPath) {
  return (await glob("docs/**/*.md", { cwd: repoPath, nodir: true })).map((file) => file.replaceAll("\\", "/"));
}

export const koinStrategy = {
  ...defaultStrategy,

  /**
   * @override
   * insert-koin.io publishes its docs as llms-full.txt; the docs/ folder of
   * the Koin repository is no longer maintained (InsertKoinIO/koin#2479).
   */
  source: snapshotSource(() => fetchKoinSnapshot()),

  /**
   * @override
   * The site redirects the pages it dropped to the page that replaced them.
   * Asked for the pages the site still has a translation of (docs/koin/,
   * read in the site repository) that the snapshot no longer has.
   */
  getMovedPages: async (repoPath, { fetchImpl = globalThis.fetch, translated = "docs/koin" } = {}) => {
    const files = await clonePages(repoPath);
    const current = new Set(files.map((file) => path.posix.relative("docs", file)));
    const gone = (await glob("**/*.md", { cwd: translated, nodir: true }))
      .map((file) => file.replaceAll("\\", "/"))
      .filter((page) => !current.has(page));
    if (gone.length === 0) return new Map();

    const fileOf = pageFiles(files.map(urlOf));
    const redirects = await siteRedirects(gone.map((page) => urlOf(`docs/${page}`)), { fetchImpl });
    const moved = new Map();
    for (const page of gone) {
      const target = redirects.get(urlOf(`docs/${page}`));
      if (target && fileOf.has(target)) moved.set(page, path.posix.relative("docs", fileOf.get(target)));
    }
    return moved;
  },

  /**
   * @override
   * The sidebar follows the groups and order of llms.txt, the index of the
   * site's sidebar.
   */
  postSync: async (repoPath) => {
    await syncKoinSidebar(repoPath);
  },
};

/**
 * Write the Koin sidebar from llms.txt in the snapshot.
 * @param {string} repoPath - Clone directory holding the snapshot
 */
export async function syncKoinSidebar(repoPath) {
  const files = pageFiles((await clonePages(repoPath)).map(urlOf));
  const index = await fs.readFile(path.join(repoPath, "llms.txt"), "utf8");
  const { sidebarNodes, translateKeys, missing, unlisted } = koinSidebar(index, files);

  if (missing.length > 0) console.warn(`  ⚠️  Koin index lists pages llms-full.txt does not have: ${missing.join(", ")}`);
  if (unlisted.length > 0) console.warn(`  ⚠️  Koin pages not in the index (not in the sidebar): ${unlisted.join(", ")}`);
  await writeSidebar("koin", sidebarNodes, translateKeys);
}
