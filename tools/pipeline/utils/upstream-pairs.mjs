/**
 * Pair every translated document under `docs/` with the upstream file it was
 * translated from, so one-off repairs can consult the original.
 *
 * Upstream clones are expected where the pipeline puts them (`cloneDir` in
 * repos.config.mjs); a docType with no clone available is reported and skipped.
 * A translation was made from the clone as the strategy prepared it, so
 * prepare fresh clones first (prepareClones): the Kotlin strategy replaces the
 * "moved to topics/x.md" stubs with the pages they point to, and Ktor's
 * `.topic` pages exist as Markdown only once converted.
 */
import fs from "fs";
import path from "path";
import { glob } from "glob";
import { REPOS } from "../repos.config.mjs";
import { CONTENT_LOCALES, DEFAULT_LOCALE, splitLocalePath } from "../../../shared/content-paths.ts";

/**
 * Prepare each available clone the way a sync does before translating
 * (the strategy's postDetect). Run it once, on clones fresh from git: the
 * preparation rewrites files in place.
 */
export async function prepareClones({ onlyDocType = null } = {}) {
  for (const repoConfig of REPOS) {
    if (onlyDocType && repoConfig.docType !== onlyDocType) continue;
    if (!fs.existsSync(repoConfig.cloneDir)) continue;
    await repoConfig.syncStrategy.postDetect(repoConfig, { repoConfig, files: [] });
  }
}

/**
 * Upstream candidates for one docType, indexed both by their path under the
 * source doc root and by bare file name. Several repos can feed one docType
 * (five of them feed `kotlin`), and the Kotlin strategy flattens
 * `docs/topics/**` into the doc root before translating, so the path index
 * alone does not resolve those files — hence the name index as a fallback.
 * A name claimed by more than one upstream file is dropped rather than guessed.
 */
async function indexUpstream(docType) {
  const byPath = new Map();
  const byName = new Map();
  const ambiguous = new Set();
  let repos = 0;

  for (const repoConfig of REPOS) {
    if (repoConfig.docType !== docType) continue;
    if (!fs.existsSync(repoConfig.cloneDir)) continue;
    repos++;

    const sourceRoot = path.resolve(repoConfig.cloneDir, repoConfig.sourceDocRoot);
    const patterns = repoConfig.syncStrategy.getDocPatterns();
    const found = (
      await Promise.all(patterns.map((p) => glob(p, { cwd: repoConfig.cloneDir, nodir: true })))
    ).flat();

    for (const file of new Set(found)) {
      // `.topic` files are Writerside XML; a prepared clone has the Markdown
      // the pipeline converted them to, which is what was translated.
      if (!file.endsWith(".md")) continue;
      const absolute = path.resolve(repoConfig.cloneDir, file);
      const relative = path.relative(sourceRoot, absolute).replaceAll("\\", "/");
      if (relative.startsWith("..")) continue;

      if (!byPath.has(relative)) byPath.set(relative, absolute);
      const name = path.basename(relative);
      if (byName.has(name) && byName.get(name) !== absolute) ambiguous.add(name);
      else byName.set(name, absolute);
    }
  }

  for (const name of ambiguous) byName.delete(name);
  return { byPath, byName, repos, ambiguous };
}

/**
 * Yields `{ docType, targetPath, sourcePath }` for every translated document,
 * and `{ docType, targetPath, sourcePath: null }` for one with no upstream
 * match. Doc types are yielded one at a time so a caller can report per set.
 */
export async function* eachTranslatedDoc({ onlyDocType = null, onMissingClone } = {}) {
  const docTypes = [...new Set(REPOS.map((r) => r.docType))].filter(
    (t) => !onlyDocType || t === onlyDocType
  );

  for (const docType of docTypes) {
    const upstream = await indexUpstream(docType);
    if (upstream.repos === 0) {
      onMissingClone?.(docType);
      continue;
    }

    const prefixes = ["", ...CONTENT_LOCALES.filter((l) => l !== DEFAULT_LOCALE).map((l) => `${l}/`)];
    const translated = (
      await Promise.all(prefixes.map((prefix) => glob(`docs/${prefix}${docType}/**/*.md`)))
    ).flat();

    for (const targetPath of translated) {
      const { contentPath } = splitLocalePath(
        path.relative("docs", targetPath).replaceAll("\\", "/")
      );
      const relative = contentPath.slice(docType.length + 1);
      const sourcePath =
        upstream.byPath.get(relative) ?? upstream.byName.get(path.basename(relative)) ?? null;
      yield { docType, targetPath, sourcePath, relative };
    }
  }
}
