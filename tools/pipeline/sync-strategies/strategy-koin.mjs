import fs from "fs-extra";
import { glob } from "glob";
import { defaultStrategy } from "./strategy.mjs";
import { writeSidebar } from "../processors/SidebarProcessor.mjs";
import {
  appendUnlistedDocs,
  docusaurusToSidebarNodes,
  fetchDocusaurusSidebars,
} from "../processors/DocusaurusSidebarProcessor.mjs";

const KOIN_SITE = "https://insert-koin.io";
const SIDEBAR_FILE = "docs/.vitepress/sidebar/koin.sidebar.json";

export const koinStrategy = {
  ...defaultStrategy,

  /**
   * @override
   * The Koin sidebar lives in the website repository, which is not public, so
   * the published one is mirrored instead. koin-annotations feeds the same
   * docs and sidebar; only the koin repository drives it.
   */
  postSync: async (repoPath, context, repoConfig) => {
    if (repoConfig?.id !== "koin") return;
    await syncKoinSidebar(repoPath);
  },
};

/**
 * Regenerate the Koin sidebar from insert-koin.io. When the site cannot be
 * read, keep the current sidebar and append the pages it does not list.
 * @param {string} repoPath - Path to the koin clone
 */
export async function syncKoinSidebar(repoPath) {
  const upstreamDocs = (await glob("docs/**/*.md", { cwd: repoPath, nodir: true }))
    .map((file) => file.replaceAll("\\", "/").replace(/^docs\//, "").replace(/\.md$/, ""));
  // A page is servable when upstream still has it (it is translated later in
  // this run) or when a translation already exists (pages kept in the
  // website repository, such as support/*).
  const hasDoc = (docId) => upstreamDocs.includes(docId) || fs.pathExistsSync(`docs/koin/${docId}.md`);

  console.log(`  Running Koin postSync: Mirroring sidebar from ${KOIN_SITE}...`);
  try {
    const sidebars = await fetchDocusaurusSidebars(KOIN_SITE);
    const { sidebarNodes, translateKeys, skipped } = docusaurusToSidebarNodes(sidebars, {
      docType: "koin",
      hasDoc,
    });
    if (sidebarNodes.length === 0) throw new Error("the published sidebar has no servable pages");
    if (skipped.length > 0) {
      console.warn(`  ⚠️  Pages on the published sidebar with no source here: ${skipped.join(", ")}`);
    }
    await writeSidebar("koin", sidebarNodes, translateKeys);
    console.log(`  Mirroring sidebar finished`);
  } catch (error) {
    console.warn(
      `  ⚠️  Could not read the published Koin sidebar (${error.message}); ` +
        `keeping ${SIDEBAR_FILE} and appending the pages it does not list.`
    );
    const current = await fs.readJson(SIDEBAR_FILE);
    const { sidebarNodes, translateKeys } = appendUnlistedDocs(current, upstreamDocs, "koin");
    await writeSidebar("koin", sidebarNodes, translateKeys);
  }
}
