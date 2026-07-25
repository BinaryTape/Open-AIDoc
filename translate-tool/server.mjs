import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { toContentRelPath } from '../shared/content-paths.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ─── 加载 .env.local ─────────────────────────────────────────────────────────
// 项目根目录的 .env.local 已在 .gitignore 中忽略，可安全存放本地密钥
const envPath = path.join(ROOT, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val; // 不覆盖已有环境变量
  }
  console.log('  📄 已加载 .env');
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Config ─────────────────────────────────────────────────────────────────
const config = JSON.parse(
  fs.readFileSync(path.join(ROOT, '.github/scripts/translate-config.json'), 'utf8')
);

// Raw terminology content for preview; per-language selection uses getTerminologyForLang()
let terminologyContentRaw = '';
try {
  terminologyContentRaw = fs.readFileSync(path.join(ROOT, config.terminologyPath), 'utf8');
} catch { terminologyContentRaw = ''; }

// ─── Projects: GitHub repos with doc paths ──────────────────────────────────
// Mirrors docs-repo-config.mjs — branches strip "origin/", docPaths from strategy.getDocPatterns()
const PROJECTS = [
  {
    name: 'kotlin', displayName: 'Kotlin',
    repos: [
      // kotlinStrategy: getDocPatterns → docs/**/*.md, docs/**/*.topic
      { repo: 'JetBrains/kotlin-web-site', branch: 'master', docPaths: ['docs/topics'] },
      { repo: 'Kotlin/kotlinx.coroutines', branch: 'master', docPaths: ['docs/topics'] },
      { repo: 'Kotlin/dokka', branch: 'master', docPaths: ['docs/topics'] },
      { repo: 'JetBrains/lincheck', branch: 'master', docPaths: ['docs/topics'] },
      { repo: 'Kotlin/api-guidelines', branch: 'main', docPaths: ['docs/topics'] },
    ],
  },
  {
    // kmpStrategy: getDocPatterns → topics/**/*.md, topics/**/*.topic
    name: 'kmp', displayName: 'Kotlin Multiplatform',
    repos: [
      { repo: 'JetBrains/kotlin-multiplatform-dev-docs', branch: 'master', docPaths: ['topics'] },
    ],
  },
  {
    // ktorStrategy: getDocPatterns → topics/*.md
    name: 'ktor', displayName: 'Ktor',
    repos: [
      { repo: 'ktorio/ktor-documentation', branch: 'main', docPaths: ['topics'] },
    ],
  },
  {
    // koinStrategy (defaultStrategy): getDocPatterns → docs/**/*.md
    name: 'koin', displayName: 'Koin',
    repos: [
      { repo: 'InsertKoinIO/koin', branch: 'main', docPaths: ['docs'] },
      { repo: 'InsertKoinIO/koin-annotations', branch: 'main', docPaths: ['docs'] },
    ],
  },
  {
    // sqlDelightStrategy: getDocPatterns → docs/**/*.md
    name: 'sqldelight', displayName: 'SQLDelight',
    repos: [
      { repo: 'sqldelight/sqldelight', branch: 'master', docPaths: ['docs'] },
    ],
  },
  {
    // koogStrategy: getDocPatterns → docs/docs/**/*.md
    name: 'koog', displayName: 'Koog',
    repos: [
      { repo: 'JetBrains/koog', branch: 'develop', docPaths: ['docs/docs'] },
    ],
  },
  {
    // coilStrategy: getDocPatterns → docs/**/*.md
    name: 'coil', displayName: 'Coil',
    repos: [
      { repo: 'coil-kt/coil', branch: 'main', docPaths: ['docs'] },
    ],
  },
];

const LANGUAGES = config.targetLanguages;
const LANGUAGE_NAMES = config.languageNames;
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash' },
];

// ─── GenAI Client ───────────────────────────────────────────────────────────
let currentApiKey = process.env.GOOGLE_API_KEY || '';
let genAI = null;

function getGenAI(apiKey) {
  const key = apiKey || currentApiKey;
  if (!key) throw new Error('请先设置 Google API Key');
  if (key !== currentApiKey || !genAI) {
    currentApiKey = key;
    genAI = new GoogleGenAI({ apiKey: key });
  }
  return genAI;
}

// ─── GitHub API ─────────────────────────────────────────────────────────────
const githubCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function githubHeaders() {
  const h = { Accept: 'application/vnd.github.v3+json' };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `token ${token}`;
  return h;
}

/**
 * 获取仓库的文档文件列表。
 * 优先用 Trees API（每仓库 1 次请求），失败则降级为 Contents API（逐目录递归）。
 */
async function fetchDocFiles(repoFullName, branch, docPaths) {
  const cacheKey = `docs:${repoFullName}@${branch}:${docPaths.join(',')}`;
  const cached = githubCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  console.log(`  Fetching docs: ${repoFullName}@${branch} [${docPaths.join(', ')}]`);
  const headers = githubHeaders();

  // 方法 1: Trees API — 1 次请求拿到完整文件树
  let allFiles = await fetchViaTreesAPI(repoFullName, branch, docPaths, headers);

  // 方法 2: 降级到 Contents API — 逐目录递归（更多请求但更可靠）
  if (allFiles === null) {
    console.log(`    Falling back to Contents API for ${repoFullName}`);
    allFiles = [];
    for (const dp of docPaths) {
      const files = await listDirRecursive(repoFullName, branch, dp, headers);
      allFiles.push(...files);
    }
  }

  githubCache.set(cacheKey, { data: allFiles, ts: Date.now() });
  return allFiles;
}

/** Trees API: 一次请求获取整棵树，然后按 docPaths 过滤 */
async function fetchViaTreesAPI(repo, branch, docPaths, headers) {
  try {
    const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`    Trees API ${res.status} for ${repo}@${branch}`);
      return null; // 触发降级
    }
    const data = await res.json();
    const tree = data.tree || [];
    // 过滤出 docPaths 下的 .md / .topic 文件
    return tree.filter(item => {
      if (item.type !== 'blob') return false;
      if (!/\.(md|topic)$/i.test(item.path)) return false;
      return docPaths.some(dp => item.path.startsWith(dp + '/'));
    });
  } catch (e) {
    console.warn(`    Trees API error for ${repo}: ${e.message}`);
    return null;
  }
}

/** Contents API 降级: 递归列出目录 */
async function listDirRecursive(repo, branch, dirPath, headers) {
  const url = `https://api.github.com/repos/${repo}/contents/${dirPath}?ref=${branch}`;
  let res;
  try { res = await fetch(url, { headers }); }
  catch (e) { return []; }
  if (!res.ok) return [];

  const items = await res.json();
  if (!Array.isArray(items)) return [];

  const result = [];
  for (const item of items) {
    if (item.type === 'file' && /\.(md|topic)$/i.test(item.name)) {
      result.push({ path: item.path, type: 'blob' });
    } else if (item.type === 'dir') {
      const sub = await listDirRecursive(repo, branch, item.path, headers);
      result.push(...sub);
    }
  }
  return result;
}

/** 从 GitHub raw 获取文件内容 */
async function fetchGitHubFile(repoFullName, branch, filePath) {
  const cacheKey = `file:${repoFullName}@${branch}:${filePath}`;
  const cached = githubCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  const url = `https://raw.githubusercontent.com/${repoFullName}/${branch}/${filePath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);

  const content = await res.text();
  githubCache.set(cacheKey, { data: content, ts: Date.now() });
  return content;
}

/** 将文件列表构建为前端树形结构 */
function buildTreeFromFiles(allFiles, docPaths) {
  const tree = [];

  for (const file of allFiles) {
    const matchDP = docPaths.find(dp => file.path.startsWith(dp + '/'));
    if (!matchDP) continue;
    const relPath = file.path.slice(matchDP.length + 1);
    const parts = relPath.split('/');

    let current = tree;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      if (i === parts.length - 1) {
        current.push({ name, type: 'file', path: file.path });
      } else {
        let dir = current.find(n => n.name === name && n.type === 'directory');
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
    nodes.forEach(n => n.children && sortTree(n.children));
  })(tree);

  return tree;
}

// ─── Pre-processing（直接复用 .github/scripts/processors） ──────────────────
//
// extractTopicContent        — 提取 <topic> 内容 + Writerside XML 标签处理 + 清理空行 + frontmatter
// processFullMarkdownContent — Writerside XML 标签处理 + Markdown 特殊语法处理（完整流水线）
//
// 需要本地文件系统的操作（include 解析、snippet 获取、标题查找）会自动 fallback（catch → 返回原文）
//
import {
  extractTopicContent,
} from '../.github/scripts/processors/TopicProcessor.mjs';
import {
  processFullMarkdownContent,
} from '../.github/scripts/processors/MarkdownProcessor.mjs';
import {
  cleanupTranslation,
  getPromptTemplate,
  getLocalePromptTemplate,
  getLangDisplayName,
  fillPromptTemplate,
  getTerminologyForLang,
} from '../.github/scripts/translate.mjs';

/**
 * 预处理内容。根据 preprocessMode 选择处理方式:
 *   'topic'    — 仅 .topic → 提取 <topic> 内容（用于 kotlin 策略的 .topic 文件）
 *   'markdown' — 仅 Markdown 变换（用于 ktor/kmp 的 .md 文件）
 *   'both'     — 先 topic 处理再 markdown 处理
 *   'none'     — 不处理
 *
 * 复用 TopicProcessor.extractTopicContent 和 MarkdownProcessor.processFullMarkdownContent，
 * 与 CI 流水线行为一致。文件系统相关操作（include 解析、snippet 获取、标题查找）
 * 找不到文件时会静默失败。
 *
 * @param {string} content      原始文件内容
 * @param {string} fileName     文件名（用于判断 .topic / .md）
 * @param {string} projectName  项目名（用于 docsPath / filePath 构造）
 * @param {string} preprocessMode  'topic' | 'markdown' | 'both' | 'none'
 */
async function preprocessContent(content, fileName, projectName, preprocessMode) {
  if (!content || preprocessMode === 'none') return content;

  const doTopic = preprocessMode === 'topic' || preprocessMode === 'both';
  const doMarkdown = preprocessMode === 'markdown' || preprocessMode === 'both';

  // ── .topic 文件提取 ──
  if (doTopic) {
    try {
      const isKtor = projectName === 'ktor';
      const fakeDocsPath = `${projectName}-repo/topics`;
      const result = await extractTopicContent(content, isKtor, fileName, fakeDocsPath);
      return result !== null ? result : content;
    } catch (e) {
      console.warn('  ⚠️ Topic processing partial failure (expected):', e.message);
      return content;
    }
  }

  // ── Markdown 处理 ──
  if (doMarkdown) {
    try {
      const fakeFilePath = `${projectName}-repo/docs/${fileName}`;
      content = await processFullMarkdownContent(fakeFilePath, content);
    } catch (e) {
      console.warn('  ⚠️ Markdown processing partial failure (expected):', e.message);
    }
  }

  return content;
}

// ─── VitePress createMarkdownRenderer（完整插件链 + shiki + Vue 组件支持） ───
let mdRenderer = null;

async function getRenderer() {
  if (mdRenderer) return mdRenderer;

  const { createMarkdownRenderer } = await import('vitepress');

  // tsx 把 TS named exports 包在 .default 下；用相对路径避免 Windows 路径问题
  const mdConfigModule = await import('../docs/.vitepress/config/markdown.config.ts');
  const mdConfig = mdConfigModule.default || mdConfigModule;
  const { registerMarkdownPlugins, markdownItMkLiquidCondition, shikiRemoveDiffMarker } = mdConfig;

  const mkDiffGrammar = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'docs/.vitepress/plugins/shiki/shiki-mk-diff.json'), 'utf8'),
  );

  // 使用 VitePress 自身的 createMarkdownRenderer —— 包含：
  //   • VitePress 内置容器（::: tip / warning / danger / details / code-group）
  //   • VitePress 代码块增强（copy button、语言标签、双主题高亮、行号）
  //   • VitePress 锚链接
  //   • shiki 双主题（github-light + github-dark）
  //   • 项目自定义 Writerside / MkDocs / Common 全部 23 个插件
  //   • shiki diff marker 移除 transformer + 自定义 diff 语法
  const md = await createMarkdownRenderer('docs', {
    attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
    preConfig: (md) => { md.use(markdownItMkLiquidCondition); },
    shikiSetup: async (shiki) => { await shiki.loadLanguage(mkDiffGrammar); },
    codeTransformers: [shikiRemoveDiffMarker()],
    config: (md) => { registerMarkdownPlugins(md); },
  });

  mdRenderer = md;
  console.log('  ✅ VitePress createMarkdownRenderer 已初始化（含全部插件 + shiki 双主题）');
  return md;
}

// ─── Queue & State ──────────────────────────────────────────────────────────
const translationQueue = [];
let isProcessingQueue = false;
const uploadedFiles = [];
const customPrompts = {};

// ─── Prompt Templates ───────────────────────────────────────────────────────
// cleanupTranslation, getPromptTemplate, getLocalePromptTemplate,
// getLangDisplayName, fillPromptTemplate are imported from translate.mjs

function getDefaultPrompt(targetLang) {
  if (customPrompts[targetLang]) return customPrompts[targetLang];
  return getPromptTemplate(targetLang, getLangDisplayName(targetLang));
}

// ─── Translation Helpers ────────────────────────────────────────────────────

/**
 * Find the local previous translation for a file.
 * @param {string} projectName - e.g. "kotlin"
 * @param {string} fileName - basename of the file, e.g. "getting-started.md"
 * @param {string} targetLang
 */
function loadPreviousTranslation(projectName, fileName, targetLang) {
  try {
    const targetPath = path.join(
      ROOT,
      'docs',
      toContentRelPath(targetLang, projectName, fileName)
    );
    if (fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, 'utf8');
      return `\n### 先前翻译版本\n\`\`\`\n${content}\n\`\`\`\n`;
    }
  } catch (e) {
    console.warn('Failed to load previous translation:', e.message);
  }
  return '';
}

/**
 * Calculate the local target path for saving a translated file.
 * @param {string} projectName - e.g. "kotlin"
 * @param {string} fileName - basename of the file
 * @param {string} targetLang
 */
function calculateTargetPath(projectName, fileName, targetLang) {
  return toContentRelPath(targetLang, projectName, fileName);
}

// ─── SSE Clients ────────────────────────────────────────────────────────────
const sseClients = new Set();

function broadcastQueue() {
  const data = JSON.stringify({ queue: translationQueue.map(q => ({ ...q, sourceContent: undefined })), isProcessing: isProcessingQueue });
  for (const client of sseClients) {
    client.write(`data: ${data}\n\n`);
  }
}

// ─── API Routes ─────────────────────────────────────────────────────────────

// SSE endpoint for real-time queue updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('data: connected\n\n');
  sseClients.add(res);
  req.on('close', () => sseClients.delete(res));
});

// Config
app.get('/api/config', (req, res) => {
  res.json({
    projects: PROJECTS,
    languages: LANGUAGES,
    languageNames: LANGUAGE_NAMES,
    models: MODELS,
    hasApiKey: !!process.env.GOOGLE_API_KEY,
    hasGitHubToken: !!process.env.GITHUB_TOKEN,
  });
});

// ─── GitHub file browsing ───────────────────────────────────────────────────

// Get file tree for a project (all repos)
app.get('/api/files/:project', async (req, res) => {
  const project = PROJECTS.find(p => p.name === req.params.project);
  if (!project) return res.status(404).json({ error: '项目不存在' });

  const repos = [];
  for (const rc of project.repos) {
    try {
      const allFiles = await fetchDocFiles(rc.repo, rc.branch, rc.docPaths);
      const tree = buildTreeFromFiles(allFiles, rc.docPaths);
      repos.push({
        repo: rc.repo,
        branch: rc.branch,
        docPaths: rc.docPaths,
        tree,
        fileCount: allFiles.length,
      });
    } catch (error) {
      console.warn(`  ⚠️ Failed to fetch ${rc.repo}@${rc.branch}: ${error.message}`);
      repos.push({
        repo: rc.repo, branch: rc.branch, docPaths: rc.docPaths,
        tree: [], fileCount: 0, error: error.message,
      });
    }
  }
  res.json({ project: project.name, repos });
});

// Get file content from GitHub
app.get('/api/github/file', async (req, res) => {
  const { repo, branch, path: filePath } = req.query;
  if (!repo || !branch || !filePath) {
    return res.status(400).json({ error: '缺少参数: repo, branch, path' });
  }
  try {
    const content = await fetchGitHubFile(repo, branch, filePath);
    res.json({ content, repo, branch, path: filePath });
  } catch (error) {
    console.error('GitHub file error:', error);
    res.status(502).json({ error: error.message });
  }
});

// Clear GitHub cache
app.post('/api/github/refresh', (req, res) => {
  githubCache.clear();
  res.json({ success: true, message: '缓存已清除' });
});

// ─── Render & Preprocess API ────────────────────────────────────────────────

// Server-side markdown → HTML rendering（VitePress createMarkdownRenderer + renderAsync）
app.post('/api/render', async (req, res) => {
  const { content, projectName, fileName } = req.body;
  if (!content) return res.json({ html: '' });
  try {
    const md = await getRenderer();
    // 提供 env 上下文给需要 relativePath 的插件（ws-rename, auto-title, inline-link 等）
    const name = fileName || 'preview.md';
    const env = { relativePath: projectName ? `${projectName}/${name}` : name };
    const html = await md.renderAsync(content, env);
    res.json({ html });
  } catch (e) {
    console.error('Render error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Pre-process raw source content (topic→md, Writerside/MkDocs transforms)
app.post('/api/preprocess', async (req, res) => {
  const { content, fileName, projectName, mode } = req.body;
  if (!content) return res.json({ content: '' });
  try {
    const processed = await preprocessContent(
      content,
      fileName || 'file.md',
      projectName || 'unknown',
      mode || 'both',
    );
    res.json({ content: processed });
  } catch (e) {
    console.error('Preprocess error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Prompt API ─────────────────────────────────────────────────────────────

app.get('/api/prompt/:lang', (req, res) => {
  const lang = req.params.lang;
  res.json({ prompt: getDefaultPrompt(lang), isCustom: !!customPrompts[lang] });
});

app.post('/api/prompt/:lang', (req, res) => {
  const lang = req.params.lang;
  const { prompt } = req.body;
  if (prompt) customPrompts[lang] = prompt;
  else delete customPrompts[lang];
  res.json({ success: true });
});

// ─── Translation ────────────────────────────────────────────────────────────

app.post('/api/translate', async (req, res) => {
  const { sourceContent, targetLang, model, useTerminology, usePrevTranslation, preprocessMode, customPrompt, projectName, fileName, apiKey } = req.body;

  try {
    // Optional pre-processing
    let content = sourceContent;
    if (preprocessMode && preprocessMode !== 'none' && fileName) {
      content = await preprocessContent(content, fileName, projectName || 'unknown', preprocessMode);
    }

    const ai = getGenAI(apiKey);
    const terms = useTerminology !== false ? getTerminologyForLang(targetLang) : '';
    let prevTranslation = '';
    if (usePrevTranslation !== false && projectName && fileName) {
      prevTranslation = loadPreviousTranslation(projectName, fileName, targetLang);
    }

    const promptTemplate = customPrompt || getDefaultPrompt(targetLang);
    const prompt = fillPromptTemplate(promptTemplate, targetLang, content, terms, prevTranslation);

    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 1 },
    });

    const translated = cleanupTranslation(response.text);
    res.json({ success: true, content: translated });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Queue ──────────────────────────────────────────────────────────────────

app.post('/api/queue/add', (req, res) => {
  const { fileName, sourceContent, projectName, targetLang, model, options } = req.body;
  const id = crypto.randomUUID();
  translationQueue.push({
    id, fileName, sourceContent, projectName,
    targetLang: targetLang || 'zh-Hans',
    model: model || 'gemini-2.5-flash',
    options: options || {},
    status: 'pending', result: null, error: null,
    createdAt: new Date().toISOString(),
  });
  broadcastQueue();
  res.json({ id, queue: translationQueue.map(q => ({ ...q, sourceContent: undefined })) });
});

app.delete('/api/queue/:id', (req, res) => {
  const idx = translationQueue.findIndex(q => q.id === req.params.id);
  if (idx !== -1) translationQueue.splice(idx, 1);
  broadcastQueue();
  res.json({ success: true });
});

app.delete('/api/queue', (req, res) => {
  translationQueue.length = 0;
  broadcastQueue();
  res.json({ success: true });
});

app.get('/api/queue', (req, res) => {
  res.json({
    queue: translationQueue.map(q => ({ ...q, sourceContent: undefined })),
    isProcessing: isProcessingQueue,
  });
});

app.get('/api/queue/:id', (req, res) => {
  const item = translationQueue.find(q => q.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/queue/process', (req, res) => {
  if (isProcessingQueue) return res.json({ message: '正在处理中' });
  const { apiKey } = req.body;
  isProcessingQueue = true;
  broadcastQueue();
  res.json({ message: '开始处理队列' });
  processQueueAsync(apiKey);
});

async function processQueueAsync(apiKey) {
  for (const item of translationQueue) {
    if (item.status !== 'pending') continue;
    item.status = 'translating';
    broadcastQueue();
    try {
      const ai = getGenAI(apiKey);
      const terms = item.options.useTerminology !== false ? getTerminologyForLang(item.targetLang) : '';
      let prevTranslation = '';
      if (item.options.usePrevTranslation !== false && item.projectName && item.fileName) {
        prevTranslation = loadPreviousTranslation(item.projectName, item.fileName, item.targetLang);
      }
      let sourceText = item.sourceContent;
      if (item.options.preprocessMode && item.options.preprocessMode !== 'none' && item.fileName) {
        sourceText = await preprocessContent(sourceText, item.fileName, item.projectName || 'unknown', item.options.preprocessMode);
      }
      const promptTemplate = item.options.customPrompt || getDefaultPrompt(item.targetLang);
      const prompt = fillPromptTemplate(promptTemplate, item.targetLang, sourceText, terms, prevTranslation);
      const response = await ai.models.generateContent({
        model: item.model,
        contents: prompt,
        config: { temperature: 1 },
      });
      item.result = cleanupTranslation(response.text);
      item.status = 'completed';
    } catch (error) {
      item.error = error.message;
      item.status = 'error';
    }
    broadcastQueue();
  }
  isProcessingQueue = false;
  broadcastQueue();
}

// ─── Upload ─────────────────────────────────────────────────────────────────

app.post('/api/upload', (req, res) => {
  const { files: fileList } = req.body;
  if (!fileList || !Array.isArray(fileList)) return res.status(400).json({ error: '无效的文件数据' });
  const uploaded = [];
  for (const file of fileList) {
    const id = crypto.randomUUID();
    const item = { id, name: file.name, content: file.content, uploadedAt: new Date().toISOString() };
    uploadedFiles.push(item);
    uploaded.push({ id: item.id, name: item.name, uploadedAt: item.uploadedAt });
  }
  res.json({ files: uploaded });
});

app.get('/api/uploads', (req, res) => {
  res.json({ files: uploadedFiles.map(f => ({ id: f.id, name: f.name, uploadedAt: f.uploadedAt })) });
});

app.get('/api/upload/:id', (req, res) => {
  const file = uploadedFiles.find(f => f.id === req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ content: file.content, name: file.name });
});

app.delete('/api/upload/:id', (req, res) => {
  const idx = uploadedFiles.findIndex(f => f.id === req.params.id);
  if (idx !== -1) uploadedFiles.splice(idx, 1);
  res.json({ success: true });
});

// ─── Save ───────────────────────────────────────────────────────────────────

app.post('/api/save', (req, res) => {
  const { content, projectName, fileName, targetLang } = req.body;
  if (!content || !projectName || !fileName || !targetLang) {
    return res.status(400).json({ error: '缺少必要参数 (content, projectName, fileName, targetLang)' });
  }
  try {
    const targetRelPath = calculateTargetPath(projectName, fileName, targetLang);
    const targetFullPath = path.join(ROOT, 'docs', targetRelPath);
    fs.mkdirSync(path.dirname(targetFullPath), { recursive: true });
    fs.writeFileSync(targetFullPath, content, 'utf8');
    res.json({ success: true, targetPath: targetRelPath });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Terminology ────────────────────────────────────────────────────────────

app.get('/api/terminology', (req, res) => {
  res.json({ content: terminologyContentRaw });
});

// ─── Fallback ───────────────────────────────────────────────────────────────

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`\n  🌐 Open AIDoc 翻译平台已启动`);
  console.log(`  📍 地址: http://localhost:${PORT}`);
  console.log(`  🔑 API Key: ${currentApiKey ? '已设置 ✅' : '未设置 ❌ (可在界面中设置)'}`);
  console.log(`  🐙 GitHub Token: ${process.env.GITHUB_TOKEN ? '已设置 ✅ (5000 req/hr)' : '未设置 (60 req/hr)'}\n`);
});
