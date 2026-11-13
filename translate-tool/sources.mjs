/**
 * Where the translate tool reads its source pages, and where it saves their
 * translations: the upstreams of the docs pipeline (tools/pipeline/repos.config.mjs),
 * read as the pipeline reads them.
 *
 * - repository, branch, document patterns and doc root are the pipeline's;
 * - a page is saved where the pipeline writes its translation (the strategy's
 *   mapDocPath: Writerside topics are flattened, .topic becomes .md, ...);
 * - an upstream without a git source (Koin publishes llms-full.txt) is read
 *   from the same snapshot the pipeline syncs.
 */
import path from 'node:path';
import { REPOS } from '../tools/pipeline/repos.config.mjs';
import { fetchKoinSnapshot } from '../tools/pipeline/utils/koin-llms.mjs';
import { toContentRelPath } from '../shared/content-paths.ts';

const DISPLAY_NAMES = {
  kotlin: 'Kotlin',
  kmp: 'Kotlin Multiplatform',
  ktor: 'Ktor',
  koin: 'Koin',
  sqldelight: 'SQLDelight',
  koog: 'Koog',
  coil: 'Coil',
};

// Upstreams the pipeline reads as a snapshot (their strategy has a `source`),
// not from git: id → the snapshot, path in the clone → content.
const SNAPSHOTS = {
  koin: { label: 'insert-koin.io/llms-full.txt', fetch: (options) => fetchKoinSnapshot(options) },
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

export function clearSourceCache() {
  cache.clear();
}

async function cached(key, load) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
  const data = await load();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

const docRootOf = (repoConfig) => path.posix.normalize(repoConfig.sourceDocRoot.replaceAll('\\', '/'));

/**
 * The page a source file is translated to, relative to the doc root (as
 * docs/<docType>/ holds it), or null when the pipeline does not publish it.
 * @example pageOf(kotlin-web-site, 'docs/topics/jvm/jvm-get-started.md') → 'jvm-get-started.md'
 * @example pageOf(koin, 'docs/reference/koin-core/definitions.md') → 'reference/koin-core/definitions.md'
 */
export function pageOf(repoConfig, file) {
  const mapped = repoConfig.syncStrategy.mapDocPath(file);
  if (!mapped) return null;
  const page = path.posix.relative(docRootOf(repoConfig), mapped);
  return page.startsWith('..') || path.posix.isAbsolute(page) ? null : page;
}

/** Whether the pipeline reads this file: it matches one of the strategy's patterns. */
export function isDocFile(repoConfig, file) {
  return repoConfig.syncStrategy.getDocPatterns().some((pattern) => path.posix.matchesGlob(file, pattern));
}

/** The projects of the tool: one per docType, with the upstreams that fill it. */
export function buildProjects(repos = REPOS) {
  const projects = [];
  for (const repoConfig of repos) {
    let project = projects.find((p) => p.name === repoConfig.docType);
    if (!project) {
      project = { name: repoConfig.docType, displayName: DISPLAY_NAMES[repoConfig.docType] ?? repoConfig.docType, repos: [] };
      projects.push(project);
    }
    const snapshot = SNAPSHOTS[repoConfig.id];
    const branch = repoConfig.branch.replace(/^origin\//, '');
    project.repos.push({
      id: repoConfig.id,
      repo: repoConfig.repo,
      branch,
      source: snapshot ? snapshot.label : `${repoConfig.repo}@${branch}`,
    });
  }
  const order = Object.keys(DISPLAY_NAMES);
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  return projects.sort((a, b) => rank(a.name) - rank(b.name));
}

export const PROJECTS = buildProjects();

export function repoConfigOf(id, repos = REPOS) {
  const repoConfig = repos.find((r) => r.id === id);
  if (!repoConfig) throw new Error(`未知的上游: ${id}`);
  return repoConfig;
}

// ─── GitHub ─────────────────────────────────────────────────────────────────

function githubHeaders() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `token ${token}`;
  return h;
}

/** Every file of the branch: Trees API, one request (null when it fails or is truncated). */
async function githubTree(repo, branch, fetchImpl) {
  try {
    const res = await fetchImpl(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, { headers: githubHeaders() });
    if (!res.ok) {
      console.warn(`    Trees API ${res.status} for ${repo}@${branch}`);
      return null;
    }
    const data = await res.json();
    if (data.truncated) return null;
    return (data.tree || []).filter((item) => item.type === 'blob').map((item) => item.path);
  } catch (e) {
    console.warn(`    Trees API error for ${repo}: ${e.message}`);
    return null;
  }
}

/** Fallback: Contents API, directory by directory. */
async function githubDir(repo, branch, dir, fetchImpl) {
  let res;
  try { res = await fetchImpl(`https://api.github.com/repos/${repo}/contents/${dir}?ref=${branch}`, { headers: githubHeaders() }); }
  catch { return []; }
  if (!res.ok) return [];
  const items = await res.json();
  if (!Array.isArray(items)) return [];
  const files = [];
  for (const item of items) {
    if (item.type === 'file') files.push(item.path);
    else if (item.type === 'dir') files.push(...await githubDir(repo, branch, item.path, fetchImpl));
  }
  return files;
}

/** The fixed directory a pattern starts with: 'docs/**\/*.md' → 'docs', 'README.md' → ''. */
const patternBase = (pattern) => pattern.split('/').filter((_, i, parts) => !/[*?[{]/.test(parts.slice(0, i + 1).join('/'))).slice(0, -1).join('/');

async function githubFiles(repoConfig, branch, fetchImpl) {
  const tree = await githubTree(repoConfig.repo, branch, fetchImpl);
  if (tree) return tree;
  console.log(`    Falling back to Contents API for ${repoConfig.repo}`);
  const dirs = [...new Set(repoConfig.syncStrategy.getDocPatterns().map(patternBase))];
  const files = [];
  for (const dir of dirs) files.push(...await githubDir(repoConfig.repo, branch, dir, fetchImpl));
  return files;
}

// ─── Source pages ───────────────────────────────────────────────────────────

/**
 * The pages of an upstream: each source file the pipeline translates, with
 * the page it becomes.
 * @returns {Promise<{path: string, page: string}[]>} path: in the upstream; page: under docs/<docType>/
 */
export async function listSourcePages(id, { repos = REPOS, fetchImpl = globalThis.fetch } = {}) {
  const repoConfig = repoConfigOf(id, repos);
  const branch = repoConfig.branch.replace(/^origin\//, '');
  const files = await cached(`files:${id}`, async () => {
    console.log(`  Fetching docs: ${id}`);
    return SNAPSHOTS[id]
      ? Object.keys(await snapshotOf(id, fetchImpl))
      : githubFiles(repoConfig, branch, fetchImpl);
  });
  const byPage = new Map();
  for (const file of files.filter((f) => isDocFile(repoConfig, f))) {
    const page = pageOf(repoConfig, file);
    if (!page) continue;
    // Two files for one page (kotlinx.coroutines: docs/channels.md and
    // docs/topics/channels.md): the pipeline copies the moved one over the
    // one already in place (copyFlatten, copyExtraFiles), so it is the page.
    const moved = repoConfig.syncStrategy.mapDocPath(file) !== file;
    if (!byPage.has(page) || moved) byPage.set(page, file);
  }
  return [...byPage].map(([page, file]) => ({ path: file, page }));
}

const snapshotOf = (id, fetchImpl) => cached(`snapshot:${id}`, () => SNAPSHOTS[id].fetch({ fetchImpl }));

/** The content of a source file of an upstream. */
export async function readSourceFile(id, file, { repos = REPOS, fetchImpl = globalThis.fetch } = {}) {
  const repoConfig = repoConfigOf(id, repos);
  if (!isDocFile(repoConfig, file)) throw new Error(`不是 ${id} 的文档文件: ${file}`);
  if (SNAPSHOTS[id]) {
    const content = (await snapshotOf(id, fetchImpl))[file];
    if (content === undefined) throw new Error(`快照里没有 ${file}`);
    return content;
  }
  const branch = repoConfig.branch.replace(/^origin\//, '');
  return cached(`file:${id}:${file}`, async () => {
    const res = await fetchImpl(`https://raw.githubusercontent.com/${repoConfig.repo}/${branch}/${file}`);
    if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
    return res.text();
  });
}

/**
 * Where the translation of a source file goes, under docs/: where the
 * pipeline writes it.
 * @example targetPathOf('koin', 'docs/intro/index.md', 'ja') → 'ja/koin/intro/index.md'
 */
export function targetPathOf(id, file, targetLang, { repos = REPOS } = {}) {
  const repoConfig = repoConfigOf(id, repos);
  const page = isDocFile(repoConfig, file) ? pageOf(repoConfig, file) : null;
  if (!page) throw new Error(`流水线不发布这个文件: ${file}`);
  return toContentRelPath(targetLang, repoConfig.docType, page);
}

/**
 * Where the tool saves a translation, under docs/: a page read from an
 * upstream goes where the pipeline writes it; an uploaded file, which has no
 * upstream, goes to the root of its project, by its file name.
 * @param {{projectName: string, fileName: string, targetLang: string, sourceId?: string, sourcePath?: string}} file
 */
export function saveTargetPath({ projectName, fileName, targetLang, sourceId, sourcePath }, options) {
  if (sourceId && sourcePath) return targetPathOf(sourceId, sourcePath, targetLang, options);
  const name = path.posix.basename(fileName.replaceAll('\\', '/'));
  if (!name || name === '..' || ![projectName, targetLang].every((part) => /^[\w-]+$/.test(part))) throw new Error(`无效的保存路径: ${projectName}/${fileName}`);
  return toContentRelPath(targetLang, projectName, name);
}

/**
 * The pages as a tree, by where they go on the site (what is shown is where
 * the translation is saved).
 */
export function buildPageTree(pages) {
  const tree = [];
  for (const { path: file, page } of pages) {
    const parts = page.split('/');
    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      if (i === parts.length - 1) {
        current.push({ name, type: 'file', path: file, page });
      } else {
        let dir = current.find((n) => n.name === name && n.type === 'directory');
        if (!dir) {
          dir = { name, type: 'directory', children: [] };
          current.push(dir);
        }
        current = dir.children;
      }
    }
  }

  (function sortTree(nodes) {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => n.children && sortTree(n.children));
  })(tree);

  return tree;
}
