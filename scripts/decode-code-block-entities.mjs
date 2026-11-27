/**
 * One-time migration for P3-39: in the translations, take out the escape the
 * docs pipeline added to the XML entities of a Writerside <code-block> body.
 *
 * The pipeline now reads a body outside CDATA as XML text, as Writerside does
 * (shared/writerside-code-block.ts), but the translations made before have its
 * `&` escaped once more: ktor/server-jwt's Maven sample shows
 * `&lt;dependency&gt;` where ktor.io shows `<dependency>`.
 *
 * Each translated Kotlin, Ktor and KMP page is paired with its upstream page,
 * prepared as a sync does. A `code` attribute of the translation is replaced
 * only when the upstream page does not have it but has it with that escape
 * taken out. A CDATA body, which Writerside shows as written, keeps its
 * entities: ktor.io shows server-configuration-code's `-&gt;` as `-&gt;`.
 *
 *   node --import tsx scripts/decode-code-block-entities.mjs [--prepare] [--write]
 *
 * Upstream clones are expected where the pipeline puts them, at the commits
 * of the last sync; see tools/pipeline/utils/upstream-pairs.mjs. --prepare
 * first prepares them as a sync does (on clones fresh from git only). Without
 * --write it only lists what it would change.
 */
import fs from "fs";
import { eachTranslatedDoc, prepareClones } from "../tools/pipeline/utils/upstream-pairs.mjs";

const DOC_TYPES = ["kotlin", "ktor", "kmp"];
const args = process.argv.slice(2);
const write = args.includes("--write");

if (args.includes("--prepare")) {
  for (const onlyDocType of DOC_TYPES) await prepareClones({ onlyDocType });
}

const CODE_ATTR = /(<code-block\b[^>]*?\scode=")([^"]*)(")/g;
// An entity escaped once more: `&amp;lt;` for `&lt;`
const ESCAPED_ENTITY = /&amp;(lt|gt|amp|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);/g;

// Compared without carriage returns: a clone checked out with CRLF line ends
// keeps them in the code of a CDATA body, the translations (made on Linux) do not
const withoutCR = (code) => code.replaceAll("\r", "");
const codeAttributes = (text) => new Set([...text.matchAll(CODE_ATTR)].map((m) => withoutCR(m[2])));

let files = 0;
let blocks = 0;
for (const onlyDocType of DOC_TYPES) {
  const docs = eachTranslatedDoc({
    onlyDocType,
    onMissingClone: (docType) => console.log(`${docType}: no upstream clone, skipped`),
  });
  for await (const { targetPath, sourcePath } of docs) {
    const text = fs.readFileSync(targetPath, "utf8");
    if (!sourcePath || !text.includes("&amp;")) continue;
    const upstream = codeAttributes(fs.readFileSync(sourcePath, "utf8"));

    let changed = 0;
    const out = text.replace(CODE_ATTR, (match, open, code, close) => {
      const decoded = code.replace(ESCAPED_ENTITY, "&$1;");
      if (decoded === code || upstream.has(withoutCR(code))) return match;
      if (!upstream.has(withoutCR(decoded))) {
        console.log(`${targetPath}: a code block upstream does not have, left as is: ${code.slice(0, 60)}`);
        return match;
      }
      changed++;
      return open + decoded + close;
    });
    if (!changed) continue;

    console.log(`${targetPath}: ${changed} code block(s)`);
    files++;
    blocks += changed;
    if (write) fs.writeFileSync(targetPath, out);
  }
}
console.log(`${blocks} code block(s) in ${files} file(s) ${write ? "changed" : "to change"}`);
