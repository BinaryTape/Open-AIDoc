// One-time migration for P3-34: fill in, in the translations, the variables
// an included fragment takes from the page it comes from.
//
// The docs pipeline now gives an included fragment the variables of its
// source page that the including page does not define
// (tools/pipeline/utils/writerside-include.mjs, as Writerside does), but the
// translations made before kept the placeholder: ktor/client-opentelemetry
// shows "%artifact_name%" where ktor.io shows "opentelemetry-ktor-3.0".
//
//   node scripts/fill-include-variables.mjs <pages-dir> <docType> [--write]
//
// <pages-dir> holds the upstream pages at the commit of the last sync
// (.github/last_check_<id>.txt), in any layout: they are read flat by file
// name, as the sync strategies flatten them. Without --write it only lists
// what it would change.
import fs from "node:fs";
import path from "node:path";
import { expandIncludes } from "../tools/pipeline/utils/writerside-include.mjs";

const [dir, docType, ...flags] = process.argv.slice(2);
if (!dir || !docType) {
  console.error("Usage: node scripts/fill-include-variables.mjs <pages-dir> <docType> [--write]");
  process.exit(1);
}
const write = flags.includes("--write");

function readFlat(root) {
  const pages = new Map();
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const file = path.join(d, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(md|topic)$/.test(entry.name) && !pages.has(entry.name)) {
        pages.set(entry.name, fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n"));
      }
    }
  };
  walk(root);
  return pages;
}

const pages = readFlat(dir);
const readPage = (name) => pages.get(name) ?? null;
const defines = (content, name) => new RegExp(`<var\\s+name="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(content);
let changed = 0;

for (const [name, content] of pages) {
  const filled = [];
  expandIncludes(content, name, readPage, [], [], undefined, filled);
  if (filled.length === 0) continue;
  const values = Object.fromEntries(filled.map(({ name: variable, value }) => [variable, value]));
  const page = name.replace(/\.topic$/, ".md");
  for (const lang of ["", "zh-Hant/", "ja/", "ko/"]) {
    const file = `docs/${lang}${docType}/${page}`;
    if (!fs.existsSync(file)) continue;
    let text = fs.readFileSync(file, "utf8");
    const before = text;
    for (const [variable, value] of Object.entries(values)) {
      if (!defines(text, variable)) text = text.replaceAll(`%${variable}%`, value);
    }
    if (text === before) continue;
    changed++;
    console.log(`${write ? "Filled in" : "Would fill in"} ${file}: ${Object.entries(values).map(([v, x]) => `%${v}% → ${x}`).join(", ")}`);
    if (write) fs.writeFileSync(file, text);
  }
}
console.log(`${changed} file(s) ${write ? "changed" : "to change"}`);
