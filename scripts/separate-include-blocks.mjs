// One-time migration for P2-20: in the translations, put a blank line between
// a heading and the line closing an HTML block right above it.
//
// The docs pipeline now keeps an included block apart from the lines around
// it (tools/pipeline/utils/writerside-include.mjs), as Writerside does, but
// the translations made before have ktor/client-opentelemetry's two includes
// run together: the heading the second starts with is right after the
// `</Tabs>` ending the first, so Markdown takes it into that HTML block and
// the page shows `## 配置 OpenTelemetry {id="configure-otel"}` as text.
//
//   node scripts/separate-include-blocks.mjs [--write]
//
// Without --write it only lists what it would change.
import fs from "node:fs";
import path from "node:path";

const write = process.argv.includes("--write");
const FENCE_RE = /^\s*(`{3,}|~{3,})/;
let changed = 0;

for (const lang of ["", "zh-Hant/", "ja/", "ko/"]) {
  for (const docType of ["kotlin", "ktor", "kmp"]) {
    const dir = `docs/${lang}${docType}`;
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const file = path.join(dir, name);
      const text = fs.readFileSync(file, "utf8");
      const eol = text.includes("\r\n") ? "\r\n" : "\n";
      const lines = text.split(/\r?\n/);
      const out = [];
      let fence = null;
      for (const [i, line] of lines.entries()) {
        const marker = FENCE_RE.exec(line)?.[1];
        if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length))) {
          fence = fence ? null : marker;
        } else if (!fence && i > 0 && /^#{1,6}\s/.test(line) && /^\s*<\/[\w-]+\s*>\s*$/.test(lines[i - 1])) {
          console.log(`${file}:${i + 1}: ${line}`);
          out.push("");
        }
        out.push(line);
      }
      if (out.length === lines.length) continue;
      changed++;
      if (write) fs.writeFileSync(file, out.join(eol));
    }
  }
}
console.log(`${changed} file(s) ${write ? "changed" : "to change"}`);
