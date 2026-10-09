/**
 * Koog API links.
 *
 * The Koog docs link to their API reference as `[AIAgent](api:agents-core::ai.koog.agents.core.agent.AIAgent)`.
 * Koog's MkDocs build resolves these through the navigation index of the API
 * docs (docs/hooks/process_api_links.py upstream); the site cannot, so on every
 * Koog sync the keys the docs use are resolved the same way and written to
 * docs/.vitepress/variables/koog-api-links.json, which the site build reads
 * (plugins/markdown/mkdocs/markdown-it-mk-api-links.ts).
 */
import fs from "fs-extra";
import path from "node:path";
import { glob } from "glob";

export const NAVIGATION_URL = "https://api.koog.ai/navigation.html";
export const LINKS_FILE = "docs/.vitepress/variables/koog-api-links.json";

const API_LINK_RE = /\]\(api:([^)\s]+)\)/g;

/**
 * Map the navigation index of the API docs: declaration key → page URL, under
 * the same keys as the upstream hook (`module::package/Class`, its dotted
 * form `module::package.Class`, and the shortened module/package keys).
 * @param {string} html - navigation.html
 * @param {string} [baseUrl] - URL the hrefs are relative to
 * @returns {Map<string, string>}
 */
export function parseNavigation(html, baseUrl = NAVIGATION_URL) {
  const map = new Map();
  const add = (key, url) => {
    if (key && !map.has(key)) map.set(key, url);
  };
  const entryRe = /<div\b[^>]*\bpageid="([^"]+)"[^>]*>\s*<div\b[^>]*class="[^"]*\btoc--row\b[^"]*"[^>]*>[\s\S]*?<a\b[^>]*\bhref="([^"]+)"/g;
  for (const [, pageid, href] of html.matchAll(entryRe)) {
    const url = new URL(href, baseUrl).href;
    const key = pageid.split("///")[0];
    add(key, url);
    if (pageid.includes("///")) add(key.replaceAll("/", "."), url);
    const sep = key.indexOf("//");
    if (sep !== -1) {
      const before = key.slice(0, sep);
      const token = key.slice(sep + 2).split("/")[0];
      const trimmed = token ? `${before}//${token}` : before.replace(/\/+$/, "");
      add(trimmed, url);
      add(trimmed.replaceAll("//", ".").replaceAll("/", "."), url);
    }
  }
  return map;
}

// Dokka's file name for a declaration: each capital becomes "-" + lowercase
const dokkaName = (name) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * URL of an API key, or null. A key the index does not list is resolved as a
 * member of its parent (walking up as far as needed, so nested classes of a
 * member resolve too), with the suffixes Dokka uses.
 * @param {Map<string, string>} map - From parseNavigation
 * @param {string} key - What follows `api:`
 */
export function resolveApiKey(map, key) {
  if (map.has(key)) return map.get(key);
  const dot = key.lastIndexOf(".");
  if (dot === -1 || key.lastIndexOf("::") > dot) return null;

  const parent = resolveApiKey(map, key.slice(0, dot));
  if (!parent) return null;
  const member = key.slice(dot + 1);
  const suffix = member.includes("_") && member === member.toUpperCase()
    ? ".html"
    : /^[A-Z]/.test(member) ? "/index.html" : ".html";
  const base = parent.endsWith("/index.html")
    ? parent.slice(0, -"index.html".length)
    : parent.endsWith("/") ? parent : parent.slice(0, parent.lastIndexOf("/") + 1);
  return `${base}${dokkaName(member)}${suffix}`;
}

/**
 * The URLs that answer 404 (or 410). One that cannot be checked (network
 * error, timeout) is given the benefit of the doubt.
 * @returns {Promise<Set<string>>}
 */
async function missingPages(urls, fetchImpl, concurrency = 8) {
  const missing = new Set();
  const queue = [...new Set(urls)];
  const worker = async () => {
    for (let url; (url = queue.shift()); ) {
      try {
        const response = await fetchImpl(url, { method: "HEAD", signal: AbortSignal.timeout(15000) });
        if (response.status === 404 || response.status === 410) missing.add(url);
      } catch {
        // unknown: keep the link
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return missing;
}

/** The API keys linked from Markdown text. */
export function apiKeysIn(text) {
  return [...text.matchAll(API_LINK_RE)].map(([, key]) => key);
}

/**
 * Resolve the API keys used by the upstream docs and the published
 * translations, and write the links file. Keeps the current file when the
 * navigation index cannot be fetched.
 * @param {string[]} docDirs - Directories of Markdown to collect keys from
 * @param {{fetchImpl?: typeof fetch, outFile?: string}} [options]
 * @returns {Promise<{resolved: number, unresolved: string[]} | null>} null when nothing was written
 */
export async function syncKoogApiLinks(docDirs, { fetchImpl = fetch, outFile = LINKS_FILE } = {}) {
  const keys = new Set();
  for (const dir of docDirs) {
    for (const file of await glob("**/*.md", { cwd: dir, nodir: true })) {
      apiKeysIn(await fs.readFile(path.join(dir, file), "utf8")).forEach((key) => keys.add(key));
    }
  }
  if (keys.size === 0) return null;

  let html;
  try {
    const response = await fetchImpl(NAVIGATION_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    console.warn(`  ⚠️  Koog API links not updated, ${NAVIGATION_URL} unavailable: ${error.message}`);
    return null;
  }

  const map = parseNavigation(html);
  const links = {};
  const unresolved = [];
  const candidates = [...keys].sort().map((key) => [key, resolveApiKey(map, key)]);
  // Member pages are guessed from their parent and the docs may name APIs not
  // published yet: keep only the pages that exist.
  const missing = await missingPages(candidates.map(([, url]) => url).filter(Boolean), fetchImpl);
  for (const [key, url] of candidates) {
    if (url && !missing.has(url)) links[key] = url;
    else unresolved.push(key);
  }
  await fs.outputFile(outFile, JSON.stringify(links, null, 2) + "\n");

  console.log(`  Koog API links: ${Object.keys(links).length} resolved, ${unresolved.length} shown as plain text`);
  unresolved.forEach((key) => console.log(`    - api:${key}`));
  return { resolved: Object.keys(links).length, unresolved };
}
