import fs from 'node:fs';
import path from 'node:path';
import { DOCS_TYPES } from "../../../docs.config";

// Writerside variable files (docs/.vitepress/variables/) of each doc type,
// copied there by the docs pipeline
const VARIABLE_FILES: Record<string, string[]> = {
  kotlin: ['kotlin.v.list', 'serialization.v.list'],
  ktor: ['ktor.v.list'],
  kmp: ['kmp.v.list'],
};

export default function markdownItWsVars(md) {
  const fileVarRegex = /<var\s+name="(?<name>[^"]+)"\s+value="(?<value>[^"]+)"[^>]*>/gi;

  function substituteGlobalVariables(state) {
    let currentSrc = state.src;

    const variables = Object.create(null);

    if (state.env && state.env.relativePath) {
      const parts = state.env.relativePath.split('/');
      const docType = parts.find(p => DOCS_TYPES.includes(p));

      // The first file defining a variable wins: kotlin-web-site's own
      // variables over those of kotlinx.serialization, whose pages also go to kotlin/.
      for (const file of VARIABLE_FILES[docType] ?? []) {
        let xmlVarsString = '';
        try {
          const resolvedPath = path.resolve('docs/.vitepress/variables', file);
          if (fs.existsSync(resolvedPath)) {
            xmlVarsString = fs.readFileSync(resolvedPath, 'utf-8');
          }
        } catch (error) {
          console.error(`Error reading XML variable file:`, error);
        }

        let m;
        while ((m = fileVarRegex.exec(xmlVarsString)) !== null) {
          if (!(m.groups.name in variables)) variables[m.groups.name] = m.groups.value;
        }
      }
    }

    const tokenRe = /<var\s+name="([^"]+)"\s+value="([^"]+)"[^>]*\/?>|%([\w.-]+)%/gi;

    let out = '';
    let last = 0;
    for (let m; (m = tokenRe.exec(currentSrc)) !== null; ) {
      const idx = m.index;
      const endIdx = tokenRe.lastIndex;

      const lineStart = currentSrc.lastIndexOf('\n', idx - 1) + 1;
      let lineEnd = currentSrc.indexOf('\n', endIdx);
      if (lineEnd === -1) lineEnd = currentSrc.length;

      const before = currentSrc.slice(last, idx);

      if (m[1] != null) {
        const name = m[1];
        const value = m[2] ?? '';
        variables[name] = value;

        const lineText = currentSrc.slice(lineStart, lineEnd);
        const left = lineText.slice(0, idx - lineStart);
        const right = lineText.slice(idx - lineStart + (endIdx - idx));
        if ((left + right).trim() === '') {
          out += currentSrc.slice(last, lineStart); // 保留到行首之前
          last = lineEnd < currentSrc.length ? lineEnd + 1 : lineEnd; // 跳过整行（含换行）
          continue;
        }

        out += before;
        last = endIdx;
        continue;
      }

      if (m[3] != null) {
        const name = m[3];

        if (!Object.prototype.hasOwnProperty.call(variables, name)) {
          out += before + `%${name}%`;
          last = endIdx;
          continue;
        }

        const replacement = String(variables[name] ?? '');

        if (replacement === '') {
          const lineText = currentSrc.slice(lineStart, lineEnd);
          const left = lineText.slice(0, idx - lineStart);
          const right = lineText.slice(idx - lineStart + (endIdx - idx));
          if ((left + right).trim() === '') {
            out += currentSrc.slice(last, lineStart);
            last = lineEnd < currentSrc.length ? lineEnd + 1 : lineEnd;
            continue;
          }
        }

        out += before + replacement;
        last = endIdx;
        continue;
      }
    }

    out += currentSrc.slice(last);
    state.src = out;
  }

  md.core.ruler.before('block', 'global_variable_replacer', substituteGlobalVariables);
}
