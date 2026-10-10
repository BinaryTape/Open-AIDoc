/**
 * Pages upstream declares as moved, so a page removed by a sync can be
 * redirected to its new page.
 *
 * - Writerside trees: `<toc-element topic="new.md" accepts-web-file-names="old.html, older.html"/>`
 *   (kotlinlang.org serves old.html as a redirect to new.html).
 * - MkDocs: the redirects plugin's `redirect_maps` (`old.md: new.md`).
 *
 * Both give old page → new page, relative to the doc root.
 */
import fs from "fs-extra";
import yaml from "js-yaml";

const ATTR_RE = /([\w-]+)\s*=\s*"([^"]*)"/g;
const asPage = (name) => name.trim().replace(/\.(html|topic)$/, ".md");

/**
 * @param {string} treeFile - A Writerside .tree file
 * @returns {Promise<Map<string, string>>}
 */
export async function movedPagesFromTree(treeFile) {
  const moved = new Map();
  if (!(await fs.pathExists(treeFile))) return moved;
  const xml = await fs.readFile(treeFile, "utf8");
  for (const [tag] of xml.matchAll(/<toc-element\b[^>]*>/g)) {
    const attrs = Object.fromEntries([...tag.matchAll(ATTR_RE)].map(([, name, value]) => [name, value]));
    if (!attrs.topic || !attrs["accepts-web-file-names"]) continue;
    const page = asPage(attrs.topic);
    for (const old of attrs["accepts-web-file-names"].split(",").map(asPage)) {
      if (old && old !== page) moved.set(old, page);
    }
  }
  return moved;
}

/**
 * @param {string} mkdocsFile - mkdocs.yml
 * @returns {Promise<Map<string, string>>}
 */
export async function movedPagesFromMkDocs(mkdocsFile) {
  const moved = new Map();
  if (!(await fs.pathExists(mkdocsFile))) return moved;
  const text = (await fs.readFile(mkdocsFile, "utf8"))
    // Python tags MkDocs configs use, which js-yaml does not know
    .replace(/!!python\/object\/apply:[\w.]+/g, "")
    .replace(/!!python\/name:\S+/g, "null")
    .replace(/!ENV\s*\[([^\]]+)\]/g, "null");
  const config = yaml.load(text) ?? {};
  for (const plugin of config.plugins ?? []) {
    const maps = plugin?.redirects?.redirect_maps;
    if (!maps) continue;
    for (const [old, page] of Object.entries(maps)) {
      if (typeof page === "string" && !/^https?:/.test(page) && old !== page) moved.set(old, page);
    }
  }
  return moved;
}
