import { coilStrategy } from "./sync-strategies/strategy-coil.mjs";
import { koinStrategy } from "./sync-strategies/strategy-koin.mjs";
import { sqlDelightStrategy } from "./sync-strategies/strategy-sqldelight.mjs";
import { kotlinStrategy } from "./sync-strategies/strategy-kotlin.mjs";
import { kmpStrategy } from "./sync-strategies/strategy-kmp.mjs";
import { koogStrategy } from "./sync-strategies/strategy-koog.mjs";
import { ktorStrategy } from "./sync-strategies/strategy-ktor.mjs";

/**
 * Upstream repositories tracked by the docs pipeline.
 *
 * Field meanings:
 * - id: unique key for logs, commits, and checkpoints
 * - docType: content output folder under docs/ (and docs/{locale}/)
 * - sidebarId: sidebar JSON key → docs/.vitepress/sidebar/{sidebarId}.sidebar.json
 * - cloneDir: local git clone directory at repo root
 * - sourceDocRoot: docs root inside the upstream clone (relative)
 * - syncStrategy: SyncStrategy hooks for this upstream layout
 * - lastCheckFile: checkpoint still lives under .github/ (see project plan)
 */
export const REPOS = [
  {
    id: "koin",
    docType: "koin",
    sidebarId: "koin",
    repo: "InsertKoinIO/koin",
    branch: "origin/main",
    cloneDir: "koin-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_koin.txt",
    syncStrategy: koinStrategy,
  },
  {
    id: "koin-annotations",
    docType: "koin",
    sidebarId: "koin",
    repo: "InsertKoinIO/koin-annotations",
    branch: "origin/main",
    cloneDir: "koin-annotations-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_koin_annotations.txt",
    syncStrategy: koinStrategy,
  },
  {
    id: "sqldelight",
    docType: "sqldelight",
    sidebarId: "sqldelight",
    repo: "sqldelight/sqldelight",
    branch: "origin/master",
    cloneDir: "sqldelight-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_sqldelight.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/sqldelight",
    },
    syncStrategy: sqlDelightStrategy,
  },
  {
    id: "kotlin-web-site",
    docType: "kotlin",
    sidebarId: "kotlin",
    repo: "JetBrains/kotlin-web-site",
    branch: "origin/master",
    cloneDir: "kotlin-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_kotlin.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/kotlin",
    },
    syncStrategy: kotlinStrategy,
  },
  {
    id: "kotlinx-coroutines",
    docType: "kotlin",
    sidebarId: "coroutines",
    repo: "Kotlin/kotlinx.coroutines",
    branch: "origin/main",
    cloneDir: "coroutines-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_coroutines.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/kotlin",
    },
    syncStrategy: kotlinStrategy,
  },
  {
    id: "dokka",
    docType: "kotlin",
    sidebarId: "dokka",
    repo: "Kotlin/dokka",
    branch: "origin/main",
    cloneDir: "dokka-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_dokka.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/kotlin",
    },
    syncStrategy: kotlinStrategy,
  },
  {
    id: "lincheck",
    docType: "kotlin",
    sidebarId: "lincheck",
    repo: "JetBrains/lincheck",
    branch: "origin/main",
    cloneDir: "lincheck-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_lincheck.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/kotlin",
    },
    syncStrategy: kotlinStrategy,
  },
  {
    id: "api-guidelines",
    docType: "kotlin",
    sidebarId: "api-guidelines",
    repo: "Kotlin/api-guidelines",
    branch: "origin/main",
    cloneDir: "api-guidelines-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_api-guidelines.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/kotlin",
    },
    syncStrategy: kotlinStrategy,
  },
  {
    id: "ktor",
    docType: "ktor",
    sidebarId: "ktor",
    repo: "ktorio/ktor-documentation",
    branch: "origin/main",
    cloneDir: "ktor-repo",
    sourceDocRoot: "./topics",
    lastCheckFile: ".github/last_check_ktor.txt",
    assets: {
      src: "images",
      dest: "docs/public/ktor",
    },
    syncStrategy: ktorStrategy,
  },
  {
    id: "kmp",
    docType: "kmp",
    sidebarId: "kmp",
    repo: "JetBrains/kotlin-multiplatform-dev-docs",
    branch: "origin/main",
    cloneDir: "kmp-repo",
    sourceDocRoot: "./topics",
    lastCheckFile: ".github/last_check_kmp.txt",
    assets: {
      src: "images",
      dest: "docs/public/kmp",
    },
    syncStrategy: kmpStrategy,
  },
  {
    id: "koog",
    docType: "koog",
    sidebarId: "koog",
    repo: "JetBrains/koog",
    branch: "origin/develop",
    cloneDir: "koog-repo",
    sourceDocRoot: "./docs/docs",
    lastCheckFile: ".github/last_check_koog.txt",
    assets: {
      src: "docs/docs/img",
      dest: "docs/public/koog",
    },
    syncStrategy: koogStrategy,
  },
  {
    id: "coil",
    docType: "coil",
    sidebarId: "coil",
    repo: "coil-kt/coil",
    branch: "origin/main",
    cloneDir: "coil-repo",
    sourceDocRoot: "./docs",
    lastCheckFile: ".github/last_check_coil.txt",
    assets: {
      src: "docs/images",
      dest: "docs/public/coil",
    },
    syncStrategy: coilStrategy,
  },
];

const REQUIRED_FIELDS = [
  "id",
  "docType",
  "sidebarId",
  "repo",
  "branch",
  "cloneDir",
  "sourceDocRoot",
  "lastCheckFile",
  "syncStrategy",
];

/**
 * Validate REPOS configuration. Throws if ids collide or required fields are missing.
 * @param {typeof REPOS} repos
 */
export function validateRepos(repos = REPOS) {
  const ids = new Set();
  const lastCheckFiles = new Set();
  const errors = [];

  for (const [index, entry] of repos.entries()) {
    for (const field of REQUIRED_FIELDS) {
      if (entry[field] == null || entry[field] === "") {
        errors.push(`REPOS[${index}] missing required field "${field}"`);
      }
    }

    if (entry.id) {
      if (ids.has(entry.id)) {
        errors.push(`Duplicate REPOS id: "${entry.id}"`);
      }
      ids.add(entry.id);
    }

    if (entry.lastCheckFile) {
      if (lastCheckFiles.has(entry.lastCheckFile)) {
        errors.push(`Duplicate lastCheckFile: "${entry.lastCheckFile}"`);
      }
      lastCheckFiles.add(entry.lastCheckFile);
    }

    if (
      entry.syncStrategy &&
      typeof entry.syncStrategy.getDocPatterns !== "function"
    ) {
      errors.push(
        `REPOS[${index}] (${entry.id ?? "?"}) syncStrategy must define getDocPatterns()`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid REPOS config:\n- ${errors.join("\n- ")}`);
  }

  return true;
}
