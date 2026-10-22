// Material for MkDocs code block titles: ```kotlin title="build.gradle.kts"
// shows the title in a bar above the code. It began with `diff` blocks only.
import { isMkDocsDoc } from '../../../utils/doctype-utils'

export default function markdownItMkDiffCodeBlock(md) {
  // Store the original fence renderer
  const defaultFenceRenderer = md.renderer.rules.fence || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.fence = function(tokens, idx, options, env, self) {
    const token = tokens[idx];
    const info = token.info ? md.utils.unescapeAll(token.info).trim() : ''; // Unescape and trim info string

    let langName = '';
    let titleValue = null;

    if (info) {
      const langParts = info.split(/\s+/g);
      if (langParts.length > 0) {
        langName = langParts[0]; // First word is the language
      }

      // Regex to extract title="some value"
      // \b ensures "title" is a whole word
      // "([^"]*)" captures content within double quotes. Allows empty title.
      const titleMatch = info.match(/\btitle="([^"]*)"/);
      if (titleMatch && typeof titleMatch[1] !== 'undefined') {
        titleValue = md.utils.escapeHtml(titleMatch[1]); // Escape HTML special chars in title
      }
    }

    // A diff block with a title, or any MkDocs code block with one (Koog,
    // SQLDelight: ```kotlin title="build.gradle.kts").
    if (titleValue !== null && (langName === 'diff' || isMkDocsDoc(env))) {
      // Construct the title HTML element
      const titleHtml = `<div class="vp-code-block-title-bar">${titleValue}</div>\n`;

      // Get the default rendering of the fenced code block
      const codeBlockHtml = defaultFenceRenderer(tokens, idx, options, env, self);

      // Wrap the title and the code block in a new div
      // Added a specific class for styling the diff wrapper
      return `<div class="vp-code-block-title">\n${titleHtml}${codeBlockHtml}</div>\n`;
    }

    // Without a title, or outside MkDocs docs, use the default renderer.
    return defaultFenceRenderer(tokens, idx, options, env, self);
  };
}