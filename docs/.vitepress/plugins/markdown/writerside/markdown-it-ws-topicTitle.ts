import { slugify } from '@mdit-vue/shared'

export default function markdownItWsTopicTitle(md) {
    md.core.ruler.after('inline', 'ws_topic_title', state => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'heading_open') {
                const openTok = tokens[i];
                const inlineTok = tokens[i + 1];
                const closeTok = tokens[i + 2];
                const nextTok  = tokens[i + 3];

                if (
                    nextTok &&
                    nextTok.type === 'html_inline' &&
                    /^\s*<primary-label\b/.test(nextTok.content)
                ) {

                    const levelMatch = openTok.tag.match(/^h([1-6])$/);
                    const level = levelMatch ? levelMatch[1] : '';

                    const refMatch = nextTok.content.match(/ref="([^"]+)"/);
                    const labelRef = refMatch ? refMatch[1] : '';

                    const titleText = inlineTok.content;
                    const titleIdMatch = titleText.match(/\s*\{id="([^"]+)"\}\s*$/);
                    const titleId = titleIdMatch ? titleIdMatch[1] : slugify(titleText)
                    const titleTextWithoutId = titleText.replace(/\s*\{id="([^"]+)"\}\s*$/, '');

                    // Heading text goes into attribute values: an unescaped quote
                    // would end the attribute early and fail the whole site build.
                    const attr = (value: string) => md.utils.escapeHtml(value);
                    const replacement = {
                        type: 'html_inline',
                        content: `<TopicTitle id="${attr(titleId)}" level="${level}" title="${attr(titleTextWithoutId)}" labelRef="${attr(labelRef)}"/>`,
                        level: openTok.level
                    };

                    tokens.splice(i, 3, replacement);

                    tokens.splice(i + 1, 1);

                    i -= 1;
                }
            }
        }
    });

    md.renderer.rules.html_inline = (tokens, idx) => tokens[idx].content;
};