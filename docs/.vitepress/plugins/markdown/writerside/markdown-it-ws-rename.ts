import { DOCS_TYPES, DocsTypeConfig } from "../../../docs.config";
import { isWritersideDoc } from "../../../utils/doctype-utils";

export default function markdownItWsRename(md) {
    const defaultRender = md.renderer.rules.html_block || function (tokens, idx, options, env, self) {
        return tokens[idx].content;
    };

    md.renderer.rules.html_block = function (tokens, idx, options, env, self) {
        const parts = env.relativePath.split('/')
        const docType = parts.find(p => DOCS_TYPES.includes(p))
        const docTypeConfig = DocsTypeConfig[docType];
        if (docTypeConfig.framework === "Writerside") {
            tokens[idx].content = tokens[idx].content.replace(/<video/g, '<YouTubeVideo');
        }
        return defaultRender(tokens, idx, options, env, self);
    };

    md.core.ruler.push('ws_def_title', (state) => {
        if (isWritersideDoc(state.env)) renameDefinitionTitles(state.tokens);
    });
}

const TAG = /<(\/?)([a-zA-Z][\w-]*)(?:\s[^>]*?)?(\/?)>/g;
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/**
 * Writerside titles a definition with a `<title>` that holds markup:
 *
 *   <def id="pingIntervalMillis"><title><code>pingIntervalMillis</code></title>…</def>
 *
 * Vue parses `<title>` as RCDATA, as HTML does: its content stays text, so the
 * page showed "<code>pingIntervalMillis</code>". Rename the title of a `<def>`
 * to `<def-title>`, an element Vue parses as such; Def.vue reads it.
 *
 * A blank line can put the title in a later HTML block than its `<def>`, so
 * the open tags are followed across the page's HTML tokens, in order. Other
 * `<title>`s (panels, cards, link groups) are left alone.
 */
export function renameDefinitionTitles(tokens: any[]): void {
    const open: string[] = [];
    const renamed: boolean[] = []; // one per open <title>
    const rewrite = (html: string) => html.replace(TAG, (tag, close: string, tagName: string, selfClosing: string) => {
        const name = tagName.toLowerCase();
        if (close) {
            const i = open.lastIndexOf(name);
            if (i >= 0) open.length = i;
            return name === 'title' && renamed.pop() ? '</def-title>' : tag;
        }
        if (selfClosing || VOID_ELEMENTS.has(name)) return tag;
        const isDefTitle = name === 'title' && open.at(-1) === 'def';
        if (name === 'title') renamed.push(isDefTitle);
        open.push(name);
        return isDefTitle ? '<def-title' + tag.slice('<title'.length) : tag;
    });

    for (const token of tokens) {
        if (token.type === 'html_block' || token.type === 'html_inline') {
            token.content = rewrite(token.content);
        } else if (token.type === 'inline' && token.children) {
            for (const child of token.children) {
                if (child.type === 'html_inline') child.content = rewrite(child.content);
            }
        }
    }
}
