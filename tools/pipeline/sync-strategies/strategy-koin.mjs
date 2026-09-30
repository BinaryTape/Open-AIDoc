import fs from "fs-extra";
import { glob } from "glob";
import { defaultStrategy } from "./strategy.mjs";
import { writeSidebar } from "../processors/SidebarProcessor.mjs";
import { reconcileSidebar } from "../processors/SidebarReconciler.mjs";

const SIDEBAR_FILE = "docs/.vitepress/sidebar/koin.sidebar.json";

// Upstream pages the published Koin sidebar deliberately leaves out.
export const KOIN_HIDDEN_PAGES = ["reference/koin-android/r8-proguard"];

export const koinStrategy = {
  ...defaultStrategy,

  /**
   * @override
   * The Koin sidebar is kept in the website repository, which is not public,
   * so koin.sidebar.json is curated here and reconciled with the upstream docs
   * on every sync.
   */
  postSync: async (repoPath) => {
    await syncKoinSidebar(repoPath);
  },
};

/**
 * Reconcile the curated Koin sidebar with the upstream docs of the clone.
 * @param {string} repoPath - Path to the koin clone
 */
export async function syncKoinSidebar(repoPath) {
  const docIds = (await glob("docs/**/*.md", { cwd: repoPath, nodir: true }))
    .map((file) => file.replaceAll("\\", "/").replace(/^docs\//, "").replace(/\.md$/, ""));
  // Servable when upstream still has the page (it is translated later in this
  // run) or a translation already exists (pages kept in the website
  // repository, such as support/*).
  const isServable = (docId) => docIds.includes(docId) || fs.pathExistsSync(`docs/koin/${docId}.md`);

  const current = await fs.readJson(SIDEBAR_FILE);
  const { sidebarNodes, translateKeys, added, removed, autoGroups } = reconcileSidebar(current, {
    docType: "koin",
    docIds,
    hidden: KOIN_HIDDEN_PAGES,
    isServable,
  });

  console.log(`  Koin sidebar: ${added.length} page(s) added, ${removed.length} removed`);
  if (autoGroups.length > 0) {
    console.warn(
      `  ⚠️  New upstream directories with no listed sibling, filed in auto groups ` +
        `that need curating in ${SIDEBAR_FILE}: ${autoGroups.join(", ")}`
    );
  }
  await writeSidebar("koin", sidebarNodes, translateKeys);
}
