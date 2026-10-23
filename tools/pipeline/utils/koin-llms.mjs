/**
 * Koin's documentation as insert-koin.io publishes it for tools: llms.txt (an
 * index of the pages, grouped as in the site's sidebar) and llms-full.txt
 * (every page in full). The docs/ folder of InsertKoinIO/koin is a stale copy
 * since June 2026 (InsertKoinIO/koin#2479), so these are the source.
 *
 * llms-full.txt is one page after another, separated by `---`:
 *
 *   # Definitions
 *
 *   Source: https://insert-koin.io/docs/reference/koin-core/definitions
 *
 *   A definition tells Koin how to create one type...
 */
import { slugify } from "@mdit-vue/shared";

export const KOIN_SITE = "https://insert-koin.io";
const DOCS_URL = `${KOIN_SITE}/docs/`;

// Fewer pages than this is a broken or reshaped export, not the documentation
// shrinking: the sync stops before anything is changed.
export const MIN_PAGES = 40;

const SOURCE_RE = /^Source: https:\/\/insert-koin\.io\/docs\/(\S*?)\/?$/;

/**
 * @param {string} text - llms-full.txt
 * @returns {{url: string, title: string, body: string}[]} `url`: path under /docs/, e.g. `intro` or `reference/koin-core/definitions`
 */
export function splitLlmsFull(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const starts = [];
  for (let i = 2; i < lines.length; i++) {
    const source = SOURCE_RE.exec(lines[i]);
    if (source && lines[i - 1] === "" && lines[i - 2].startsWith("# ")) {
      starts.push({ line: i - 2, url: source[1], title: lines[i - 2].slice(2).trim() });
    }
  }

  return starts.map((start, index) => {
    const end = index + 1 < starts.length ? starts[index + 1].line : lines.length;
    const body = lines.slice(start.line + 3, end);
    // The separator before the next page
    while (body.length > 0 && (body.at(-1).trim() === "" || body.at(-1) === "---")) body.pop();
    while (body.length > 0 && body[0].trim() === "") body.shift();
    return { url: start.url, title: start.title, body: body.join("\n") };
  });
}

/**
 * Where each page goes in the clone: a page with pages under it is the index
 * of its directory (`intro` → `docs/intro/index.md`), as on the site.
 * @param {string[]} urls
 * @returns {Map<string, string>}
 */
export function pageFiles(urls) {
  const isDirectory = (url) => urls.some((other) => other.startsWith(`${url}/`));
  return new Map(urls.map((url) => [url, `docs/${url}${isDirectory(url) ? "/index" : ""}.md`]));
}

const PLAIN_YAML = /^[^\s@`!&*|>%'"#[\]{},?:-][^#]*$/;

/** A page as the site's Koin pages are written: title front matter, then the H1. */
export function toMarkdown(title, body) {
  const yamlTitle = PLAIN_YAML.test(title) && !title.includes(": ") ? title : JSON.stringify(title);
  return `---\ntitle: ${yamlTitle}\n---\n\n# ${title}\n\n${body}\n`;
}

/**
 * The documentation index of llms.txt: `### Group` (`### Platforms > Android`
 * for a group in a group) followed by `- [Title](https://insert-koin.io/docs/...)`.
 * @param {string} text - llms.txt
 * @returns {{groups: string[], title: string, url: string}[][]} Entries, grouped in order
 */
export function parseLlmsIndex(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const start = lines.indexOf("## Documentation");
  if (start < 0) return [];
  const groups = [];
  let current = null;
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line) || line.startsWith("<!-- generated:docs-end")) break;
    const heading = /^### (.+)$/.exec(line);
    if (heading) {
      current = { path: heading[1].split(">").map((part) => part.trim()), items: [] };
      groups.push(current);
      continue;
    }
    const item = /^- \[([^\]]+)\]\(https:\/\/insert-koin\.io\/docs\/([^)]*?)\/?\)/.exec(line);
    if (item && current) current.items.push({ groups: current.path, title: item[1], url: item[2] });
  }
  return groups.map((group) => group.items).filter((items) => items.length > 0);
}

/**
 * The Koin sidebar, in the groups and order of llms.txt. Group labels are
 * translation keys (`koin.platforms-android`); pages keep the title of their
 * translation, as before.
 * @param {string} indexText - llms.txt
 * @param {Map<string, string>} files - From pageFiles, the pages that exist
 * @returns {{sidebarNodes: object[], translateKeys: Map<string, string>, missing: string[], unlisted: string[]}}
 *   `missing`: index entries without a page; `unlisted`: pages without an entry
 */
export function koinSidebar(indexText, files) {
  const sidebarNodes = [];
  const translateKeys = new Map();
  const missing = [];
  const listed = new Set();
  const link = (url) => files.get(url).replace(/^docs\//, "").replace(/\.md$/, "");

  const groupNode = (path) => {
    let level = sidebarNodes;
    let node = null;
    path.forEach((name, depth) => {
      const key = `koin.${slugify(path.slice(0, depth + 1).join(" "))}`;
      node = level.find((n) => n.text === key);
      if (!node) {
        node = { text: key, collapsed: true, items: [] };
        translateKeys.set(key, name);
        level.push(node);
      }
      level = node.items;
    });
    return node;
  };

  for (const items of parseLlmsIndex(indexText)) {
    for (const item of items) {
      if (!files.has(item.url)) {
        missing.push(item.url);
        continue;
      }
      if (listed.has(item.url)) continue;
      listed.add(item.url);
      const target = link(item.url);
      groupNode(item.groups).items.push({ text: `koin.${target.replaceAll("/", ".")}`, link: target });
    }
  }

  const unlisted = [...files.keys()].filter((url) => !listed.has(url));
  return { sidebarNodes, translateKeys, missing, unlisted };
}

/**
 * The page a Docusaurus client redirect page sends to
 * (`<meta http-equiv="refresh" content="0; url=/docs/...">`), or null.
 * @returns {string | null} Path under /docs/
 */
export function redirectTarget(html) {
  const meta = /<meta[^>]+http-equiv=["']?refresh["']?[^>]*>/i.exec(html)?.[0];
  const url = meta && /url=([^"'>\s]+)/i.exec(meta)?.[1];
  const target = url && /^(?:https:\/\/insert-koin\.io)?\/docs\/([^?#]*?)\/?(?:[?#].*)?$/.exec(url);
  return target ? target[1] : null;
}

async function fetchText(fetchImpl, url) {
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

/**
 * The Koin docs, as files of the clone: every page under docs/, and llms.txt
 * (the sidebar). Throws when the export cannot be read or has too few pages.
 * @param {{fetchImpl?: typeof fetch}} [options]
 * @returns {Promise<Record<string, string>>}
 */
export async function fetchKoinSnapshot({ fetchImpl = globalThis.fetch } = {}) {
  const [full, index] = await Promise.all([
    fetchText(fetchImpl, `${KOIN_SITE}/llms-full.txt`),
    fetchText(fetchImpl, `${KOIN_SITE}/llms.txt`),
  ]);
  const pages = splitLlmsFull(full);
  if (pages.length < MIN_PAGES) {
    throw new Error(`${KOIN_SITE}/llms-full.txt has ${pages.length} pages (expected at least ${MIN_PAGES}); its format may have changed`);
  }
  const duplicates = pages.map((p) => p.url).filter((url, i, urls) => urls.indexOf(url) !== i);
  if (duplicates.length > 0) throw new Error(`${KOIN_SITE}/llms-full.txt lists pages twice: ${duplicates.join(", ")}`);

  const files = pageFiles(pages.map((page) => page.url));
  const snapshot = { "llms.txt": index };
  for (const page of pages) snapshot[files.get(page.url)] = toMarkdown(page.title, page.body);
  return snapshot;
}

/**
 * Where the site sends each of these pages, read from its redirect pages.
 * A page that does not redirect (gone, or still a page) is left out.
 * @param {string[]} urls - Paths under /docs/
 * @returns {Promise<Map<string, string>>} url → target url
 */
export async function siteRedirects(urls, { fetchImpl = globalThis.fetch } = {}) {
  const moved = new Map();
  await Promise.all(urls.map(async (url) => {
    try {
      const response = await fetchImpl(`${DOCS_URL}${url}`, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) return;
      const target = redirectTarget(await response.text());
      if (target && target !== url) moved.set(url, target);
    } catch {
      // Unreachable: no redirect, the page is only removed
    }
  }));
  return moved;
}
