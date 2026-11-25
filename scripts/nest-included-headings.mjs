/**
 * One-time migration for P3-36: in the translations, give the headings of an
 * included section the level kotlinlang.org and ktor.io give them.
 *
 * The docs pipeline now puts an included section one level below the heading
 * of the including page it follows (tools/pipeline/utils/writerside-include.mjs),
 * but the translations made before have it at the level it is written at:
 * kotlin/whatsnew2320 includes "Name-based destructuring" (`###`) after its own
 * h3 "Changes to overload resolution for context parameters", an h4 on
 * kotlinlang.org and an h3 here.
 *
 * Each translated Kotlin, Ktor and KMP page is paired with its upstream page,
 * prepared as a sync does (includes expanded the new way). A translated heading
 * with an id takes the level of the upstream heading with that id. Headings
 * without an id are only listed when their level differs from the upstream
 * heading at the same position.
 *
 *   node --import tsx scripts/nest-included-headings.mjs [--prepare] [--write]
 *
 * Upstream clones are expected where the pipeline puts them; see
 * tools/pipeline/utils/upstream-pairs.mjs. --prepare first prepares them as a
 * sync does (on clones fresh from git only). Without --write it only lists
 * what it would change.
 */
import fs from "fs";
import { eachTranslatedDoc, prepareClones } from "../tools/pipeline/utils/upstream-pairs.mjs";

const DOC_TYPES = ["kotlin", "ktor", "kmp"];
const args = process.argv.slice(2);
const write = args.includes("--write");

if (args.includes("--prepare")) {
  for (const onlyDocType of DOC_TYPES) await prepareClones({ onlyDocType });
}

const FENCE_RE = /^[ \t]*(`{3,}|~{3,})/;
const HEADING_RE = /^(#{1,6})\s/;
const ID_RE = /\{[^}]*\bid=(?:"([^"]+)"|'([^']+)'|([^\s"'}]+))[^}]*\}\s*$/;

/** The Markdown headings of a page, outside code blocks: line, level and id. */
function headings(lines) {
  const out = [];
  let open = null;
  for (const [i, line] of lines.entries()) {
    const fence = FENCE_RE.exec(line);
    if (fence && (open === null || (fence[1][0] === open[0] && fence[1].length >= open.length))) {
      open = open === null ? fence[1] : null;
    } else if (open === null) {
      const heading = HEADING_RE.exec(line);
      if (!heading) continue;
      const id = ID_RE.exec(line);
      out.push({ line: i, level: heading[1].length, id: id ? (id[1] ?? id[2] ?? id[3]) : null });
    }
  }
  return out;
}

let files = 0;
let changed = 0;
const unmatched = [];

for (const onlyDocType of DOC_TYPES) {
  for await (const { targetPath, sourcePath } of eachTranslatedDoc({
    onlyDocType,
    onMissingClone: (type) => console.warn(`— ${type}: no upstream clone available, skipping`),
  })) {
    if (!sourcePath) continue;
    const source = headings(fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n").split("\n"));
    const levelOf = new Map();
    const seen = new Set();
    for (const { id, level } of source) {
      if (!id) continue;
      if (seen.has(id)) levelOf.delete(id); // an id used twice: not one to go by
      else levelOf.set(id, level);
      seen.add(id);
    }

    const text = fs.readFileSync(targetPath, "utf8");
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const lines = text.split(/\r?\n/);
    const translated = headings(lines);
    let fixes = 0;
    for (const heading of translated) {
      const level = heading.id && levelOf.get(heading.id);
      if (!level || level === heading.level) continue;
      console.log(`${targetPath}:${heading.line + 1}: h${heading.level} -> h${level} ${heading.id}`);
      lines[heading.line] = "#".repeat(level) + lines[heading.line].slice(heading.level);
      heading.level = level;
      fixes++;
    }
    if (translated.length === source.length) {
      translated.forEach((heading, i) => {
        if (heading.level !== source[i].level) unmatched.push(`${targetPath}:${heading.line + 1}: h${heading.level}, upstream h${source[i].level}`);
      });
    }

    if (fixes === 0) continue;
    files++;
    changed += fixes;
    if (write) fs.writeFileSync(targetPath, lines.join(eol));
  }
}

console.log(`${changed} heading(s) in ${files} file(s) ${write ? "changed" : "to change"}`);
if (unmatched.length) {
  console.log(`\nOther headings at a level the upstream heading at their position does not have (left as they are):`);
  for (const entry of unmatched) console.log(`  ${entry}`);
}
