/**
 * Audit the published translations against the upstream documents they are
 * translated from, prepared the way the pipeline prepares them, and queue the
 * broken ones (truncated, summarized, missing sections) for the next sync.
 *
 *   node --import tsx scripts/audit-translations.mjs --clones <dir> [--repo id[,id]] [--strict] [--repair] [--write] [--missing]
 *
 * Each repository's clone (<dir>/<cloneDir>, see repos.config.mjs) is copied
 * and run through its strategy's postDetect as on a first run, then every
 * prepared document is checked in every language with the structural check
 * translation itself uses (utils/translation-check.mjs).
 *
 * --strict   also flag pages missing three or more headings or code blocks,
 *            which the check at translation time lets through
 * --repair   fix in place what needs no translation (a closing fence dropped at
 *            the end of the page), when the fixed page then passes the check
 * --write    add the remaining broken translations to
 *            .github/last_check_<id>.pending.json; the next sync translates
 *            only those languages again
 * --missing  also queue documents with no translation in a language
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { glob } from "glob";
import { REPOS } from "../tools/pipeline/repos.config.mjs";
import { checkTranslation, structureOf } from "../tools/pipeline/utils/translation-check.mjs";
import { readPending, writePending } from "../tools/pipeline/utils/pending.mjs";
import { restoreTrailingFence } from "../tools/pipeline/utils/wrapper-fence.mjs";
import { toContentRelPath } from "../shared/content-paths.ts";

const config = JSON.parse(fs.readFileSync("tools/pipeline/translate-config.json", "utf8"));
const LANGS = config.targetLanguages;

/**
 * Stricter than the check translation applies (which must not reject a
 * good translation): headings and code blocks are never dropped on purpose,
 * so three of either missing is a page that lost part of its content.
 */
function strictProblems(translated, source) {
  const [src, out] = [structureOf(source), structureOf(translated)];
  const problems = [];
  if (src.headings - out.headings >= 3) problems.push(`headings ${out.headings}/${src.headings}`);
  if (src.codeBlocks - out.codeBlocks >= 3) problems.push(`code blocks ${out.codeBlocks}/${src.codeBlocks}`);
  return problems;
}

function parseArgs(argv) {
  const args = { clones: null, repos: null, strict: false, repair: false, write: false, missing: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--clones") args.clones = argv[++i];
    else if (argv[i] === "--repo") args.repos = argv[++i].split(",");
    else if (argv[i] === "--repair") args.repair = true;
    else if (argv[i] === "--strict") args.strict = true;
    else if (argv[i] === "--write") args.write = true;
    else if (argv[i] === "--missing") args.missing = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  if (!args.clones) throw new Error("--clones <dir> is required");
  return args;
}

/** Run the strategy's postDetect on a copy of the clone, as on a first run. */
async function prepare(repoConfig, clonesDir) {
  const source = path.join(clonesDir, repoConfig.cloneDir);
  const clone = fs.mkdtempSync(path.join(os.tmpdir(), `audit-${repoConfig.id}-`));
  fs.cpSync(source, clone, { recursive: true, filter: (p) => path.basename(p) !== ".git" });

  const patterns = repoConfig.syncStrategy.getDocPatterns();
  const files = [...new Set((await Promise.all(patterns.map((p) => glob(p, { cwd: clone, nodir: true, dot: true })))).flat())]
    .map((f) => f.replaceAll("\\", "/"));
  const task = { files };

  const { log, warn, error } = console;
  console.log = console.warn = console.error = () => {};
  try {
    await repoConfig.syncStrategy.postDetect({ ...repoConfig, cloneDir: clone }, task);
  } finally {
    Object.assign(console, { log, warn, error });
  }
  return { clone, files: [...new Set(task.files.map((f) => f.replaceAll("\\", "/")))] };
}

async function audit(repoConfig, clonesDir, { repair, strict }) {
  const { clone, files } = await prepare(repoConfig, clonesDir);
  const broken = [];
  const missing = [];
  const repaired = [];
  let checked = 0;

  for (const file of files.sort()) {
    const sourcePath = path.join(clone, file);
    const source = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath, "utf8") : "";
    if (!source.trim()) continue;
    const relative = path.relative(repoConfig.sourceDocRoot, file).replaceAll("\\", "/");

    for (const lang of LANGS) {
      const target = path.join("docs", toContentRelPath(lang, repoConfig.docType, relative));
      if (!fs.existsSync(target)) {
        missing.push({ file, lang, target });
        continue;
      }
      checked++;
      const translated = fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n");
      let problems = checkTranslation(translated, source);
      if (problems.length === 0 && strict) problems = strictProblems(translated, source);
      if (problems.length === 0) continue;

      const fixed = repair ? restoreTrailingFence(translated, source) : { changed: false };
      if (fixed.changed && checkTranslation(fixed.content, source).length === 0) {
        fs.writeFileSync(target, fixed.content);
        repaired.push(target);
      } else {
        broken.push({ file, lang, target, problems });
      }
    }
  }

  fs.rmSync(clone, { recursive: true, force: true });
  return { checked, broken, missing, repaired };
}

const args = parseArgs(process.argv.slice(2));
const totals = { checked: 0, repaired: 0, broken: 0, missing: 0, queued: 0 };

for (const repoConfig of REPOS) {
  if (args.repos && !args.repos.includes(repoConfig.id)) continue;
  if (!fs.existsSync(path.join(args.clones, repoConfig.cloneDir))) {
    console.log(`${repoConfig.id}: no clone in ${args.clones}, skipped`);
    continue;
  }

  const { checked, broken, missing, repaired } = await audit(repoConfig, args.clones, args);
  totals.checked += checked;
  totals.repaired += repaired.length;
  totals.broken += broken.length;
  totals.missing += missing.length;
  console.log(
    `\n${repoConfig.id}: ${checked} translations checked, ` +
      (args.repair ? `${repaired.length} repaired, ` : "") +
      `${broken.length} broken, ${missing.length} missing`
  );
  for (const { target, problems } of broken) console.log(`  ✗ ${target}: ${problems.join("; ")}`);

  if (!args.write) continue;
  const queue = [...broken.map((b) => ({ ...b, reason: `audit: ${b.problems.join("; ")}` }))];
  if (args.missing) queue.push(...missing.map((m) => ({ ...m, reason: "audit: no translation" })));
  if (queue.length === 0) continue;

  const pending = await readPending(repoConfig);
  for (const { file, lang, reason } of queue) {
    const entry = (pending[file] ??= { langs: [], reason });
    if (!entry.langs.includes(lang)) entry.langs.push(lang);
  }
  await writePending(repoConfig, pending);
  totals.queued += queue.length;
}

console.log(
  `\nTotal: ${totals.checked} checked, ` +
    (args.repair ? `${totals.repaired} repaired, ` : "") +
    `${totals.broken} broken, ${totals.missing} missing` +
    (args.write ? `, ${totals.queued} queued for the next sync` : "")
);
