/**
 * A source for upstreams that publish their docs without a git history (Koin
 * publishes llms-full.txt): each sync writes the current snapshot into the
 * clone directory, and the pages that changed are those whose content hash
 * differs from the snapshot of the last checkpoint.
 *
 *   .github/last_check_koin.txt           ← version of the snapshot last synced
 *   .github/last_check_koin.sources.json  ← { version, files: { "docs/x.md": sha256 } }
 *
 * The clone directory then looks like a clone to the rest of the pipeline
 * (strategies, stale pages, translation), which only reads files from it.
 */
import { createHash } from "node:crypto";
import path from "node:path";
import fs from "fs-extra";

const MANIFEST = ".snapshot.json";

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

export const sourcesFileFor = (repoConfig) => repoConfig.lastCheckFile.replace(/\.txt$/, "") + ".sources.json";

/**
 * Hashes of the files of a snapshot, and a version identifying all of them.
 * @param {Record<string, string>} files - Path in the clone → content
 * @returns {{version: string, files: Record<string, string>}}
 */
export function manifestOf(files) {
  const hashes = Object.fromEntries(Object.keys(files).sort().map((file) => [file, sha256(files[file])]));
  return { version: sha256(JSON.stringify(hashes)).slice(0, 40), files: hashes };
}

/**
 * Files whose hash differs between two manifests, or that only the current one has.
 * @returns {string[]}
 */
export function changedBetween(previous, current) {
  return Object.keys(current.files).filter((file) => previous.files[file] !== current.files[file]);
}

async function readManifest(file) {
  return (await fs.pathExists(file)) ? fs.readJson(file) : null;
}

/**
 * @param {(repoConfig: object) => Promise<Record<string, string>>} fetchSnapshot -
 *   The upstream's current files, path in the clone → content. Throws when the
 *   upstream cannot be read or does not look right: nothing is changed then.
 */
export function snapshotSource(fetchSnapshot) {
  const manifestFile = (repoConfig) => path.join(repoConfig.cloneDir, MANIFEST);

  return {
    /** Replace the clone directory with the upstream's current snapshot. */
    update: async (repoConfig) => {
      const files = await fetchSnapshot(repoConfig);
      await fs.emptyDir(repoConfig.cloneDir);
      for (const [file, content] of Object.entries(files)) {
        await fs.outputFile(path.join(repoConfig.cloneDir, file), content);
      }
      await fs.writeJson(manifestFile(repoConfig), manifestOf(files), { spaces: 2 });
    },

    version: async (repoConfig) => (await fs.readJson(manifestFile(repoConfig))).version,

    /**
     * Files changed since the snapshot of the last checkpoint, or null when
     * there is none to compare with (every file is then new).
     * @returns {Promise<string[] | null>}
     */
    changedFiles: async (repoConfig) => {
      const previous = await readManifest(sourcesFileFor(repoConfig));
      if (!previous) return null;
      return changedBetween(previous, await fs.readJson(manifestFile(repoConfig)));
    },

    /**
     * Record the snapshot next to the checkpoint, for the next sync to compare with.
     * @returns {Promise<string[]>} Files written
     */
    checkpoint: async (repoConfig) => {
      const file = sourcesFileFor(repoConfig);
      await fs.outputFile(file, JSON.stringify(await fs.readJson(manifestFile(repoConfig)), null, 2) + "\n");
      return [file];
    },
  };
}
