// Process comments and convert title to markdown heading
import { TITLE_COMMENT_LINE, parseTitleComment } from '../../../utils/title-comment'

export default function markdownItWsFrontmatter(md) {
  const primaryLabelRe = /<primary-label\s+ref="([^"]+)"\/>/i;

  // 在 normalize 阶段之前运行，修改 state.src
  md.core.ruler.before('normalize', 'ws_frontmatter', state => {
    const lines = state.src.split(/\r?\n/);

    // 找到 title 注释所在的行索引
    const titleLineIndex = lines.findIndex(line => TITLE_COMMENT_LINE.test(line));
    if (titleLineIndex < 0) {
      return; // 没有 title 注释，跳过
    }

    // 提取 title 文本
    const titleLine = lines[titleLineIndex];
    const titleContent = titleLine.match(TITLE_COMMENT_LINE)[1].trim();

    // 在 title 之后的 4 行内寻找 primary-label
    let ref = '';
    for (let i = titleLineIndex + 1; i <= titleLineIndex + 4 && i < lines.length; i++) {
      const m = primaryLabelRe.exec(lines[i]);
      if (m && m[1] && m[1].trim().toLowerCase() !== 'none') {
        ref = m[1].trim();
        break;
      }
    }

    // The comment has become the heading. Drop it: a title with parentheses
    // makes it invalid Markdown, which would show the comment as text.
    lines.splice(titleLineIndex, 1);
    const src = lines.join('\n');

    // 根据是否找到 ref 决定插入 <TopicTitle> 还是普通 Markdown 标题
    let newSrc;
    if (ref) {
      // An attribute value is not Markdown: use the plain title, escaped for HTML.
      const title = md.utils.escapeHtml(parseTitleComment(titleLine));
      newSrc = `<TopicTitle labelRef="${md.utils.escapeHtml(ref)}" title="${title}"/>\n\n${src}`;
    } else {
      newSrc = `# ${titleContent}\n\n${src}`;
    }

    state.src = newSrc;
  });
}
