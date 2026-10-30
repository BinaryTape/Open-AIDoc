/**
 * Writerside projects define their labels in labels.list:
 *
 *   <primary-label id="alpha" name="Alpha" short-name="α" color="strawberry">…</primary-label>
 *   <secondary-label id="maven" name="Maven" color="red"></secondary-label>
 *
 * Pages refer to them by id (`<secondary-label ref="maven"/>`). Each sync
 * writes the labels of a repository to docs/.vitepress/labels/<docType>.json,
 * which the site reads to render them (markdown-it-ws-secondary-label.ts).
 */
import path from "node:path";
import fs from "fs-extra";

export const LABELS_DIR = "docs/.vitepress/labels";
export const labelsFileFor = (docType, dir = LABELS_DIR) => `${dir}/${docType}.json`;

// Where Writerside projects keep the file: next to writerside.cfg
const CANDIDATES = ["labels.list", "docs/labels.list", "topics/labels.list"];

const ELEMENT_RE = /<(primary|secondary)-label\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1-label>)/g;
const ATTRIBUTE_RE = /([\w-]+)="([^"]*)"/g;

const decode = (text) =>
  text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/**
 * @param {string} xml - labels.list
 * @returns {{primary: Record<string, Label>, secondary: Record<string, Label>}}
 * @typedef {{name: string, color?: string, description?: string}} Label
 */
export function parseLabels(xml) {
  const labels = { primary: {}, secondary: {} };
  for (const [, kind, attributeText, body = ""] of xml.matchAll(ELEMENT_RE)) {
    const attributes = Object.fromEntries([...attributeText.matchAll(ATTRIBUTE_RE)].map(([, name, value]) => [name, decode(value)]));
    if (!attributes.id) continue;
    const description = decode(body.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    labels[kind][attributes.id] = {
      name: attributes.name ?? attributes.id,
      ...(attributes.color ? { color: attributes.color } : {}),
      ...(description ? { description } : {}),
    };
  }
  return labels;
}

/**
 * Write the labels of the clone for its doc type, when it has a labels.list.
 * A repository without one (kotlinx.coroutines, which shares the kotlin doc
 * type with kotlin-web-site) leaves the file alone.
 * @param {string} [dir] - Where to write, LABELS_DIR in the site repository
 * @returns {Promise<string | null>} The file written, if any
 */
export async function syncLabels(repoPath, context, docType, dir = LABELS_DIR) {
  for (const candidate of CANDIDATES) {
    const source = path.join(repoPath, candidate);
    if (!(await fs.pathExists(source))) continue;

    const labels = parseLabels(await fs.readFile(source, "utf8"));
    const count = Object.keys(labels.primary).length + Object.keys(labels.secondary).length;
    if (count === 0) {
      console.warn(`  ⚠️  Warning: no labels in ${source}; keeping ${labelsFileFor(docType, dir)}`);
      return null;
    }
    const file = labelsFileFor(docType, dir);
    await fs.outputFile(file, JSON.stringify(labels, null, 2) + "\n");
    context?.gitAddPaths?.add(file);
    console.log(`  Labels: ${count} from ${candidate}`);
    return file;
  }
  return null;
}
