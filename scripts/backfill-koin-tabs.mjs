/**
 * One-off repair for the Koin pages translated while the sync flattened
 * their code tabs into bold labels (P2-15): puts the tabs back in every
 * translation, as the sync now does in the upstream pages (koin-tabs.mjs).
 *
 *   node --import tsx scripts/backfill-koin-tabs.mjs [--dry-run]
 *
 * Reads llms-full.txt and the pages of insert-koin.io, then:
 * - in docs/koin, docs/ja/koin, docs/ko/koin and docs/zh-Hant/koin, puts the
 *   tabs back where the translation's labels and blocks match the site's tabs
 *   (a page that does not match is left as it is, and listed);
 * - in .github/last_check_koin.sources.json, records the pages with tabs for
 *   the pages whose upstream has not changed since the last sync, so the next
 *   sync does not translate them all again. Pages that did change keep their
 *   old hash and are translated again, with their tabs.
 */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fetchKoinSnapshot, KOIN_SITE, pageFiles, splitLlmsFull, toMarkdown } from "../tools/pipeline/utils/koin-llms.mjs";
import { applyKoinTabs, hasTabLabels, officialTabSets, tabOfLabel } from "../tools/pipeline/utils/koin-tabs.mjs";
import { CONTENT_LOCALES, isDefaultLocale } from "../shared/locales.ts";

const dryRun = process.argv.includes("--dry-run");
const SOURCES = ".github/last_check_koin.sources.json";
const LAST_CHECK = ".github/last_check_koin.txt";
const sha256 = (text) => createHash("sha256").update(text).digest("hex");

// Every response read once: the snapshot and this script see the same site
const responses = new Map();
const fetchOnce = async (url, init) => {
  if (!responses.has(url)) {
    const response = await fetch(url, init);
    responses.set(url, { ok: response.ok, status: response.status, body: await response.text() });
  }
  const { ok, status, body } = responses.get(url);
  return { ok, status, text: async () => body };
};

const snapshot = await fetchKoinSnapshot({ fetchImpl: fetchOnce });
const pages = splitLlmsFull(await (await fetchOnce(`${KOIN_SITE}/llms-full.txt`)).text());
const files = pageFiles(pages.map((page) => page.url));

// --- Translations ---------------------------------------------------------
const totals = { pages: 0, files: 0, sets: 0 };
const skipped = [];
for (const page of pages) {
  if (!hasTabLabels(page.body)) continue;
  totals.pages++;
  const sets = officialTabSets(await (await fetchOnce(`${KOIN_SITE}/docs/${page.url}`)).text());
  const relative = files.get(page.url).replace(/^docs\//, "");
  for (const locale of CONTENT_LOCALES) {
    const file = path.join("docs", isDefaultLocale(locale) ? "" : locale, "koin", relative);
    if (!fs.existsSync(file)) continue;
    const result = applyKoinTabs(fs.readFileSync(file, "utf8"), sets, { labelOf: tabOfLabel });
    if (result.problem) {
      skipped.push(`${file}: ${result.problem}`);
      continue;
    }
    totals.files++;
    totals.sets += result.sets;
    if (!dryRun) fs.writeFileSync(file, result.markdown);
  }
}

// --- Checkpoint -----------------------------------------------------------
const previous = JSON.parse(fs.readFileSync(SOURCES, "utf8"));
const flattened = Object.fromEntries(pages.map((page) => [files.get(page.url), toMarkdown(page.title, page.body)]));
const recorded = [];
const changedUpstream = [];
const hashes = { ...previous.files };
for (const [file, content] of Object.entries(snapshot)) {
  if (!(file in flattened) || content === flattened[file]) continue;
  if (previous.files[file] === sha256(flattened[file])) {
    hashes[file] = sha256(content);
    recorded.push(file);
  } else {
    changedUpstream.push(file);
  }
}
// As manifestOf (snapshot-source.mjs) computes it, from the hashes
const sorted = Object.fromEntries(Object.keys(hashes).sort().map((file) => [file, hashes[file]]));
const sources = { version: sha256(JSON.stringify(sorted)).slice(0, 40), files: sorted };
if (!dryRun && recorded.length > 0) {
  fs.writeFileSync(SOURCES, JSON.stringify(sources, null, 2) + "\n");
  fs.writeFileSync(LAST_CHECK, sources.version);
}

console.log(`${dryRun ? "[dry run] " : ""}${totals.pages} pages with tabs; ${totals.files} translated files, ${totals.sets} tab sets put back`);
console.log(`Checkpoint: ${recorded.length} pages recorded with their tabs; ${changedUpstream.length} changed upstream since the last sync (translated again by the next sync)`);
for (const file of changedUpstream) console.log(`  changed upstream: ${file}`);
if (skipped.length > 0) {
  console.log(`${skipped.length} translated files left as they are:`);
  for (const line of skipped) console.log(`  ${line}`);
}
