// Process comments and convert title to markdown heading

export default function markdownItWsFrontmatter(md) {
  // The title runs to the comment's last ")": titles can contain parentheses,
  // e.g. "Enum classes (Enums)" or, escaped, "Select expression \(experimental\)".
  const titleCommentRe = /\[\/\/\]: # \(title:\s*(.*)\)\s*$/i;
  const primaryLabelRe = /<primary-label\s+ref="([^"]+)"\/>/i;

  // 在 normalize 阶段之前运行，修改 state.src
  md.core.ruler.before('normalize', 'ws_frontmatter', state => {
    const src = state.src;
    const lines = src.split(/\r?\n/);

    // 找到 title 注释所在的行索引
    const titleLineIndex = lines.findIndex(line => titleCommentRe.test(line));
    if (titleLineIndex < 0) {
      return; // 没有 title 注释，跳过
    }

    // 提取 title 文本
    const titleMatch = titleCommentRe.exec(lines[titleLineIndex]);
    const titleContent = titleMatch[1].trim();

    // 在 title 之后的 4 行内寻找 primary-label
    let ref = '';
    for (let i = titleLineIndex + 1; i <= titleLineIndex + 4 && i < lines.length; i++) {
      const m = primaryLabelRe.exec(lines[i]);
      if (m && m[1] && m[1].trim().toLowerCase() !== 'none') {
        ref = m[1].trim();
        break;
      }
    }

    // 根据是否找到 ref 决定插入 <TopicTitle> 还是普通 Markdown 标题
    let newSrc;
    if (ref) {
      // An attribute value is not Markdown: undo the escapes, then escape for HTML.
      const title = md.utils.escapeHtml(titleContent.replace(/\\([\\()[\]])/g, '$1'));
      newSrc = `<TopicTitle labelRef="${md.utils.escapeHtml(ref)}" title="${title}"/>\n\n${src}`;
    } else {
      newSrc = `# ${titleContent}\n\n${src}`;
    }

    state.src = newSrc;
  });
}