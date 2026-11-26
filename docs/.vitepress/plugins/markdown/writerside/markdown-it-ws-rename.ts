import { isWritersideDoc } from "../../../utils/doctype-utils";

// Writerside's <video> becomes a <YouTubeVideo> in markdown-it-ws-video (P1-12).
export default function markdownItWsRename(md) {
    md.core.ruler.push('ws_def_title', (state) => {
        if (isWritersideDoc(state.env)) renameDefinitionTitles(state.tokens);
    });

    md.core.ruler.push('ws_list_style', (state) => {
        if (isWritersideDoc(state.env)) forEachHtml(state.tokens, listStyleAsType);
    });

    // After the attributes of `{type="alpha-lower"}` are set (VitePress's
    // curly_attributes rule): HTML letters a list with type="a" (P2-48).
    md.core.ruler.push('ws_markdown_list_type', (state) => {
        if (!isWritersideDoc(state.env)) return;
        for (const token of state.tokens) {
            if (token.type === 'ordered_list_open' && token.attrGet('type') === 'alpha-lower') token.attrSet('type', 'a');
        }
    });
}

function forEachHtml(tokens: any[], rewrite: (html: string) => string): void {
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

const LIST_TYPES = new Set(['bullet', 'decimal', 'none', 'alpha-lower']);

/**
 * A list can name its type as a style, `<list style="decimal">`
 * (ktor server-auto-reload), which ktor.io numbers as it does
 * `<list type="decimal">`. Vue drops a style that is no CSS, so List.vue
 * would never see it: write it as the type (P2-47).
 */
export function listStyleAsType(html: string): string {
    return html.replace(/<list\b[^>]*>/gi, (tag) => {
        if (/\stype\s*=/i.test(tag)) return tag;
        return tag.replace(/\sstyle\s*=\s*(["'])([\w-]+)\1/i, (attr, quote, value) =>
            LIST_TYPES.has(value) ? ` type=${quote}${value}${quote}` : attr);
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
