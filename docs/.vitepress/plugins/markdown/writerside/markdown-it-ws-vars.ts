import { DOCS_TYPES } from "../../../docs.config";
import { resolveLinkSummaries, writersideVariables } from "../../../utils/writerside-variables";

export default function markdownItWsVars(md) {
  function substituteGlobalVariables(state) {
    // A <Links> tooltip first takes the variables of the page it links to
    let currentSrc = state.env?.relativePath ? resolveLinkSummaries(state.src, state.env.relativePath) : state.src;

    // The doc type's variables (docs/.vitepress/variables/), then the page's own <var>s
    const docType = state.env?.relativePath?.split('/').find(p => DOCS_TYPES.includes(p));
    const variables = writersideVariables(docType);

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
    // For what is read out of the source before this rule: the attributes
    // after a code block (markdown-it-ws-remove-code-attr.ts)
    if (state.env) state.env.wsVariables = variables;
  }

  md.core.ruler.before('block', 'global_variable_replacer', substituteGlobalVariables);
}
