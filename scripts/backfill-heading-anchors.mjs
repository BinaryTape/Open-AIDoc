/**
 * One-off repair for documents translated before the pipeline started
 * preserving upstream anchors.
 *
 * Walks every translated document, finds the upstream English file it came
 * from, stamps the upstream anchor onto each translated heading, and puts the
 * upstream anchor back into each link whose anchor was translated.
 *
 *   node --import tsx scripts/backfill-heading-anchors.mjs [--prepare] [--dry-run] [--doc-type kotlin]
 *
 * Upstream clones are expected where the pipeline puts them; see
 * tools/pipeline/utils/upstream-pairs.mjs. --prepare first prepares them as a
 * sync does (on clones fresh from git only).
 */
import fs from "fs";
import { eachTranslatedDoc, prepareClones } from "../tools/pipeline/utils/upstream-pairs.mjs";
import { applySourceAnchors } from "../tools/pipeline/utils/heading-anchors.mjs";
import { applySourceLinkAnchors } from "../tools/pipeline/utils/link-anchors.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const docTypeFlag = args.indexOf("--doc-type");
const onlyDocType = docTypeFlag === -1 ? null : args[docTypeFlag + 1];

if (args.includes("--prepare")) await prepareClones({ onlyDocType });

const totals = { written: 0, anchors: 0, links: 0, unpaired: 0, unmatched: 0 };
const driftReports = [];
const unmatched = new Set();
const perDocType = new Map();

for await (const { docType, targetPath, sourcePath, relative } of eachTranslatedDoc({
  onlyDocType,
  onMissingClone: (type) => console.warn(`— ${type}: no upstream clone available, skipping`),
})) {
  if (!perDocType.has(docType)) perDocType.set(docType, { files: 0, anchors: 0, links: 0 });
  const tally = perDocType.get(docType);

  if (!sourcePath) {
    totals.unmatched++;
    unmatched.add(relative);
    continue;
  }

  const translated = fs.readFileSync(targetPath, "utf8");
  const source = fs.readFileSync(sourcePath, "utf8");
  const headings = applySourceAnchors(translated, source);
  if (headings.unpaired > 0) {
    totals.unpaired += headings.unpaired;
    driftReports.push(`${targetPath}: ${headings.unpaired} unpaired, ${headings.drift}`);
  }
  const links = applySourceLinkAnchors(headings.content, source);
  if (links.content === translated) continue;

  if (!dryRun) fs.writeFileSync(targetPath, links.content);
  tally.files++;
  tally.anchors += headings.added;
  tally.links += links.restored;
  totals.written++;
  totals.anchors += headings.added;
  totals.links += links.restored;
}

for (const [docType, { files, anchors, links }] of perDocType) {
  console.log(
    `${docType.padEnd(14)} ${String(files).padStart(5)} files, ${String(anchors).padStart(6)} anchors, ` +
      `${String(links).padStart(5)} links`
  );
}
console.log(
  `\n${dryRun ? "[dry run] " : ""}${totals.written} files: ${totals.anchors} anchors stamped, ` +
    `${totals.links} link anchors restored; ${totals.unpaired} headings unpaired (structure drift), ` +
    `${totals.unmatched} files without an upstream match`
);
report("Structure drift", driftReports);
report("No upstream match", [...unmatched]);

function report(label, entries) {
  if (!entries.length) return;
  console.log(`\n${label}:`);
  entries.slice(0, 25).forEach((e) => console.log(`  ${e}`));
  if (entries.length > 25) console.log(`  … and ${entries.length - 25} more`);
}
