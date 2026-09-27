/**
 * One-off repair for damage the translation step used to leave behind, on
 * documents translated before the pipeline stopped doing it:
 *
 *  - `\n` rewritten as a real line break, which split string literals across
 *    two lines and broke escape-sequence table rows in half.
 *  - a Writerside title comment rewritten as YAML frontmatter, which leaves the
 *    page with no H1 at all.
 *  - a ```xml / ```html fence wrapping the whole document with its closing
 *    fence stripped, which renders the page as one unclosed code block.
 *
 *   node --import tsx scripts/repair-translated-markdown.mjs [--dry-run] [--doc-type kotlin]
 *
 * Upstream clones are expected where the pipeline puts them; see
 * tools/pipeline/utils/upstream-pairs.mjs.
 */
import fs from "fs";
import { eachTranslatedDoc } from "../tools/pipeline/utils/upstream-pairs.mjs";
import { restoreEscapedNewlines } from "../tools/pipeline/utils/escaped-newlines.mjs";
import { restoreTitleComment } from "../tools/pipeline/utils/title-comment.mjs";
import { repairUnclosedWrapper } from "../tools/pipeline/utils/wrapper-fence.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const docTypeFlag = args.indexOf("--doc-type");
const onlyDocType = docTypeFlag === -1 ? null : args[docTypeFlag + 1];

const totals = { files: 0, newlines: 0, titles: 0, wrappers: 0, overshot: 0 };
const overshot = [];

for await (const { targetPath, sourcePath } of eachTranslatedDoc({
  onlyDocType,
  onMissingClone: (docType) => console.warn(`— ${docType}: no upstream clone available, skipping`),
})) {
  // `.topic` pages have no Markdown source; only the wrapper repair, which
  // can decide without one, applies to them.
  const source = sourcePath ? fs.readFileSync(sourcePath, "utf8") : null;
  const before = fs.readFileSync(targetPath, "utf8");
  let content = before;
  let newlines = 0;

  const unwrapped = repairUnclosedWrapper(content, source);
  content = unwrapped.content;
  if (unwrapped.changed) totals.wrappers++;

  if (source === null) {
    if (content !== before) {
      if (!dryRun) fs.writeFileSync(targetPath, content);
      totals.files++;
    }
    continue;
  }

  // Only a document whose upstream carries `\n` can have lost one, and the
  // upstream count caps how many the repair may put back.
  const budget = count(source, "\\n");
  if (budget > 0) {
    const restored = restoreEscapedNewlines(content);
    if (restored.repaired > 0) {
      const wouldHave = count(restored.content, "\\n");
      if (wouldHave > budget) {
        totals.overshot++;
        overshot.push(`${targetPath}: would add ${wouldHave}, upstream has ${budget}`);
      } else {
        content = restored.content;
        newlines = restored.repaired;
      }
    }
  }

  const titled = restoreTitleComment(content, source);
  content = titled.content;

  if (content === before) continue;
  if (!dryRun) fs.writeFileSync(targetPath, content);
  totals.files++;
  totals.newlines += newlines;
  if (titled.changed) totals.titles++;
}

console.log(
  `\n${dryRun ? "[dry run] " : ""}${totals.files} files: ` +
    `${totals.newlines} escaped newlines restored, ${totals.titles} title headers restored, ` +
    `${totals.wrappers} document-wrapping fences removed` +
    (totals.overshot ? `; ${totals.overshot} files left alone (repair exceeded the upstream count)` : "")
);
if (overshot.length) {
  console.log("\nLeft alone:");
  overshot.slice(0, 25).forEach((o) => console.log(`  ${o}`));
  if (overshot.length > 25) console.log(`  … and ${overshot.length - 25} more`);
}

function count(text, needle) {
  return text.split(needle).length - 1;
}
