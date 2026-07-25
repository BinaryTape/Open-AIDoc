# 添加新的文档翻译指南

本文面向维护者或贡献者，介绍如何把“新的上游文档”纳入本仓库（**Open AIDoc**）的自动同步与翻译流程，或在现有专题中新增页面并正确出现在站点侧边栏中。

适用读者：
- 想要新增一个要跟踪的开源项目文档仓库（如某库的官网文档）；
- 想在现有专题中增加/修复某些页面，并让流水线自动翻译；
- 想在本地运行翻译流水线进行验证。

---

## 一、关键概念速览

- **docType（文档类型）**：站点中每个专题的类型标识，如 `kotlin`、`kmp`、`ktor`、`sqldelight`、`koog`、`coil` 等。它决定译文输出目录。
- **REPOS 配置**：位于 `tools/pipeline/repos.config.mjs`，定义上游仓库与显式字段（`id` / `docType` / `sidebarId` / `cloneDir` / `sourceDocRoot` / `syncStrategy` 等）。
- **SyncStrategy（同步策略）**：位于 `tools/pipeline/sync-strategies/`（如 `strategy-kotlin.mjs`）。定义如何发现需要处理的文档（glob）、以及在同步/检测/翻译各阶段做自定义处理（Writerside `.topic` 转换、侧边栏生成、资源拷贝等）。**只在流水线运行时生效，不参与站点构建。**
- **LinkRewrite（链接改写）**：位于 `docs/.vitepress/link-rewrites/`（如 `kotlin.link-rewrite.ts`）。在 VitePress **编译 Markdown 时** 把文内 `href` 改成本站路由（或回退到官方 URL）。通过 `docs/.vitepress/docs.config.ts` 的 `rewriteHref` 挂到对应 docType。**与 SyncStrategy 无关。**
- **Sidebar 与 Locale**：侧边栏 JSON 写在 `docs/.vitepress/sidebar/{sidebarId}.sidebar.json`，多语言文案写在 `docs/.vitepress/locales/*.json`，由 `SidebarProcessor.mjs` 自动生成/增量更新。
- **输出目录结构**：
    - 简体中文（默认 root locale）：`docs/{docType}/...`
    - 其它语言：`docs/{lang}/{docType}/...`（如 `docs/ja/kotlin/...`）。

### SyncStrategy vs LinkRewrite

| | SyncStrategy | LinkRewrite |
|---|---|---|
| 位置 | `tools/pipeline/sync-strategies/` | `docs/.vitepress/link-rewrites/` |
| 时机 | CI / 本地流水线（同步与翻译） | 站点构建（Markdown 编译） |
| 职责 | 上游 → 可翻译 Markdown、侧边栏、静态资源 | 文内链接 → 本站路径或官方 URL |
| 注册处 | `repos.config.mjs` 的 `syncStrategy` 字段 | `docs.config.ts` 的 `rewriteHref` 字段 |

### REPOS 字段

| 字段 | 含义 |
|---|---|
| `id` | 唯一标识（日志、commit 摘要、checkpoint 语义） |
| `docType` | 译文输出目录名 |
| `sidebarId` | `docs/.vitepress/sidebar/{sidebarId}.sidebar.json` |
| `cloneDir` | 本地 clone 目录（仓库根下） |
| `sourceDocRoot` | 上游文档根（相对 clone 根） |
| `lastCheckFile` | 进度文件（当前仍放在 `.github/`） |
| `syncStrategy` | SyncStrategy 对象 |
| `assets` | 可选：资源拷贝 `src` → `dest` |

---

## 二、准备工作

- Node 20+，pnpm 已安装
- 拉取本项目代码并安装依赖：
  ```bash
  pnpm i
  ```

---

## 三、新增一个“上游文档仓库/新专题”

当你希望把一个全新的开源项目文档纳入本项目并自动翻译时，按以下步骤：

1) 增加 SyncStrategy（若可复用现有策略，可跳过）
- 根据上游站点技术栈选择相近策略：
    - Writerside 示例：`kotlinStrategy`、`kmpStrategy`（处理 `.topic`、生成 Writerside 侧边栏）。
    - MkDocs 示例：`koogStrategy`、`coilStrategy`（从 `mkdocs.yml` 生成侧边栏）。
    - Docusaurus 示例：`koinStrategy`（一般是纯 Markdown 目录结构）。
- 如需自定义，复制一个最接近的策略文件，新建例如 `tools/pipeline/sync-strategies/strategy-xxx.mjs`：
  ```js
  import { defaultStrategy } from "./strategy.mjs";
  import path from "path";
  import fs from "fs-extra";
  import { generateSidebar } from "../processors/SidebarProcessor.mjs";

  export const myLibStrategy = {
    ...defaultStrategy,
    // 1) 指定需要处理的文档文件匹配模式（相对上游仓库根目录）
    getDocPatterns: () => ["docs/**/*.md"],

    // 2) 如需：拉取后做预处理（可为空）
    postSync: async (repoPath) => {},

    // 3) 检测阶段：生成侧边栏（使用配置中的 sidebarId，不要从路径推导）
    postDetect: async (repoConfig, task) => {
      const sidebarPath = path.join(repoConfig.cloneDir, "docs/mkdocs.yml");
      if (await fs.pathExists(sidebarPath)) {
        await generateSidebar(sidebarPath, repoConfig.sidebarId);
      }
    },

    // 4) 翻译结束后：拷贝资源等
    postTranslate: async (context, repoConfig) => {
      const { src, dest } = repoConfig.assets || {};
      if (src && dest) {
        const srcPath = path.join(repoConfig.cloneDir, src);
        if (await fs.pathExists(srcPath)) {
          await fs.ensureDir(dest);
          await fs.copy(srcPath, dest, { overwrite: true });
          context.gitAddPaths.add(dest);
        }
      }
    },
  };
  ```

2) 在 REPOS 中注册新仓库
- 编辑 `tools/pipeline/repos.config.mjs`，引入并添加一项：
  ```js
  import { myLibStrategy } from "./sync-strategies/strategy-my-lib.mjs";

  export const REPOS = [
    // ...已有条目
    {
      id: "my-lib",
      docType: "my-lib",
      sidebarId: "my-lib",
      repo: "org/my-lib",
      branch: "origin/main",
      cloneDir: "my-lib-repo",
      sourceDocRoot: "./docs",
      lastCheckFile: ".github/last_check_my-lib.txt",
      assets: {
        src: "docs/images",
        dest: "docs/public/my-lib",
      },
      syncStrategy: myLibStrategy,
    },
  ];
  ```

3) 在站点配置中注册 docType（及可选的 LinkRewrite）
- 编辑 `docs/.vitepress/docs.config.ts`，在 `DocsTypeConfig` 中添加：
  ```ts
  import { myLibRewriteHref } from "./link-rewrites/my-lib.link-rewrite"; // 可选

  export const DocsTypeConfig = {
    // ...已有
    "my-lib": {
      type: "my-lib",
      title: "MyLib",
      path: "/my-lib/",
      framework: "MKDocs",
      rewriteHref: myLibRewriteHref, // 可选：LinkRewrite
    },
  } as const;
  ```
- 若无需特殊链接重写，可不提供 `rewriteHref`。
- 实现 LinkRewrite 时，可参考 `docs/.vitepress/link-rewrites/*.link-rewrite.ts`，并复用 `link-rewrite-utils.ts` 中的工具函数。

完成以上三步后，流水线会：
- 在 `STAGE 1` 克隆/更新新仓库；
- 在 `STAGE 2` 依据 SyncStrategy 的 `getDocPatterns()` 找到新增/变更文档；
- 在 `STAGE 3` 调用 Gemini 翻译，输出到 `docs/{docType}/...`（简中）与其他语言目录；
- 在 `STAGE 3.1` 生成/更新侧边栏与多语言 locale；
- 在 `STAGE 4` 统一提交并推送。

### 关于“自定义 Markdown 语法/HTML 组件”的处理（重要）

有些上游文档会使用框架自定义的 Markdown 语法（如 Writerside 的变量、容器，或 MkDocs 的标签/条件），也可能直接嵌入自定义 HTML。总体有两条路径可选：

- A. 在 **SyncStrategy** 阶段做预处理（同步/检测阶段）——把非常“上游特定”的语法先转换为更通用的 Markdown/HTML，再交给翻译与构建。适合一次性重写、重命名、批量替换等。通常在 `tools/pipeline/sync-strategies/strategy-*.mjs` 的 `postSync`/`postDetect` 中处理。
- B. 在站点编译阶段用 MarkdownIt 插件转换 —— 保留上游原始语法，在 VitePress 编译 Markdown 时做语法解析与转换，甚至直接产出目标 HTML。适合需要可重复维护、跨仓库/多专题复用的语法规则。链接改写请用 **LinkRewrite**，不要塞进 SyncStrategy。

如何选择：
- 如果你的转换只和某个上游绑定，且需要在“翻译之前”就统一格式（比如把 `.topic` 转成 `.md`、把特殊标签替换掉），优先用 SyncStrategy 预处理。
- 如果语法具有通用性、需要在渲染期按上下文动态处理（比如根据 frontmatter、语言或链接重写），优先用 MarkdownIt 插件 / LinkRewrite。

——

A. 示例：在 SyncStrategy 中预处理 Markdown 语法

```js
// tools/pipeline/sync-strategies/strategy-my-lib.mjs（节选）
import { defaultStrategy } from "./strategy.mjs";
import fs from "fs-extra";
import path from "path";

export const myLibStrategy = {
  ...defaultStrategy,
  getDocPatterns: () => ["docs/**/*.md"],
  postDetect: async (repoConfig, task) => {
    const mdFiles = task.files.filter((f) => f.endsWith(".md"));
    for (const rel of mdFiles) {
      const abs = path.join(repoConfig.cloneDir, rel);
      if (!(await fs.pathExists(abs))) continue;
      let content = await fs.readFile(abs, "utf8");
      content = content.replace(/<var\s+name="(.*?)"\s*\/>/g, (m, p1) => `{{ ${p1} }}`);
      await fs.writeFile(abs, content);
    }
  },
};
```

注意：
- 若涉及“改名/改路径”（如 `.topic` → `.md`），需要像 `strategy-kmp.mjs` 那样同步更新 `task.files`，确保后续翻译拿到更新后的路径。
- 预处理通常在翻译前进行，可显著降低翻译时被奇怪语法干扰的概率。

——

B. 示例：编译阶段用 MarkdownIt 插件

在 `docs/.vitepress` 下新增一个插件文件，并在 `docs/.vitepress/config.mts` 中注册。可参考：
- Writerside：`markdown-it-ws-*.ts`
- MkDocs：`markdown-it-mk-*.ts`
- 链接改写：`docs/.vitepress/link-rewrites/` + `plugins/markdown/writerside/markdown-it-ws-inline-link.ts`

——

C. 自定义 HTML → 用 Vue 组件承载

复杂 HTML/交互可封装为 Vue 组件放在 `docs/.vitepress/component`。

---

## 四、翻译输出路径与语言

流水线在翻译前会设置环境变量：
- `DOC_TYPE = repoConfig.docType`
- `DOC_PATH = repoConfig.sourceDocRoot`
- `REPO_PATH = repoConfig.cloneDir`

输出规则（见 `tools/pipeline/translate.mjs` + `shared/content-paths.ts`）：
- 简体中文：`docs/{DOC_TYPE}/{相对 DOC_PATH 的路径}`
- 其它语言：`docs/{lang}/{DOC_TYPE}/{相对 DOC_PATH 的路径}`

站点支持语言在 `docs/.vitepress/locales.config.ts` / `shared/locales.ts` 中配置（默认：`zh-Hans`、`zh-Hant`、`ja`、`ko`）。

---

## 五、本地运行流水线（可选）

1) 配置 act 环境：https://github.com/nektos/act

2) 在终端运行：
   ```bash
   pnpm pipeline:run
   # 或
   act -s GOOGLE_API_KEY=KEY -j docs-update
   ```

脚本阶段说明：
- STAGE 1: 同步上游仓库（克隆/更新）并执行 SyncStrategy 的 `postSync`；
- STAGE 2: 计算变更并生成任务，调用 SyncStrategy 的 `postDetect`；
- STAGE 3: 调用 Gemini 执行翻译，随后执行 SyncStrategy 的 `postTranslate`（拷贝资源等）；
- STAGE 3.1: 翻译/更新 `docs/.vitepress/locales/*.json`；
- STAGE 4: 统一 `git add` + `commit` + `push` 到 `GITHUB_REF_NAME`。

站点构建时才会应用 **LinkRewrite**（与上述 STAGE 无关）。

---

## 七、验证与预览

- 配置：`pnpm test`（含 REPOS 校验）
- 侧边栏：确认 `docs/.vitepress/sidebar/{sidebarId}.sidebar.json` 已更新；
- 多语言：确认 `docs/.vitepress/locales/en.json` 以及其他语言 JSON 有新增键值；
- 资源：若配置了 `assets`，确认文件已复制至 `docs/public/{docType}`；
- 本地预览站点：
  ```bash
  pnpm docs:dev     # 开发预览
  pnpm docs:build   # 构建
  pnpm docs:preview # 产物预览
  ```

---

## 八、提交变更

- 若你只提交了文档/配置（未运行脚本），请正常 `git add/commit/push` 并发起 PR。

---

如需进一步帮助，请在仓库中提交 Issue，说明目标上游仓库地址与站点技术栈（Writerside/MkDocs/Docusaurus），我们会协助提供对应策略模板。
