import { parseCodeBlockAttrs } from '../../../utils/code-block-attrs'

// What an attribute line becomes before parsing: an HTML comment, which
// markdown-it parses as a block of its own right after the fence.
const MARKER = /^<!--ws-code-attrs:([^>]*)-->\s*$/

/**
 * Takes the `{…}` attribute line after a Writerside code block out of the
 * source, and keeps the attributes on the fence token
 * (`token.meta.wsAttrs`, see utils/code-block-attrs.ts).
 *
 * The attribute line is replaced by a marker comment before parsing; after
 * parsing, the marker's attributes go on the fence right before it and the
 * marker is dropped. markdown-it itself thus decides which fence the line
 * belongs to, in lists and indented blocks too.
 */
export default function markdownItWsRemoveCodeAttr(md) {
    md.core.ruler.after("normalize", "remove-code-attrs", function (state) {
        // First a one-line attribute list, where a quoted value may hold "}"
        // (collapsed-title=".clickable { count += 1 }"); the old pattern stopped
        // there and left the rest of the line on the page. Else as before.
        // The closing fence may end in spaces (coroutine-context-and-dispatchers).
        const marker = (indention, attrs) =>
            `${indention}<!--ws-code-attrs:${encodeURIComponent(JSON.stringify(attrs))}-->`
        state.src = state.src.replace(
            /([ \t]*)```[ \t]*\n[ \t]*(?:\{(?:[^}"'\n]|"[^"\n]*"|'[^'\n]*')*\}|\{[\s\S]*?\})/gm,
            (match, indention) => {
                const attrs = parseCodeBlockAttrs(match.slice(match.indexOf('\n') + 1))
                return `${indention}\`\`\`\n${attrs ? marker(indention, attrs) : ''}`
            }
        );
        // Writerside also reads the attributes after a blank line (as
        // kotlinlang.org does); only a line that is all attributes, so other
        // text after a code block stays.
        state.src = state.src.replace(
            /^([ \t]*)```[ \t]*\n[ \t]*\n([ \t]*\{[^\n]*\})[ \t]*$/gm,
            (match, indention, line) => {
                const attrs = parseCodeBlockAttrs(line)
                return attrs ? `${indention}\`\`\`\n${marker(indention, attrs)}` : match
            }
        );
    });

    md.core.ruler.after("block", "code-attrs-to-fence", function (state) {
        const tokens = state.tokens
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i]
            // The source pattern also matches after an opening fence, where
            // the line was always emptied (two pages whose fences do not
            // pair up): empty the marker's line in the code too.
            if (token.type === 'fence' && token.content.includes('<!--ws-code-attrs:')) {
                token.content = token.content.replace(/^[ \t]*<!--ws-code-attrs:[^>]*-->[ \t]*$/gm, '')
            }
            if (token.type !== 'html_block') continue
            const match = MARKER.exec(token.content.trim())
            if (!match) continue
            const fence = tokens[i - 1]
            if (fence?.type === 'fence') {
                fence.meta = { ...fence.meta, wsAttrs: JSON.parse(decodeURIComponent(match[1])) }
            }
            tokens.splice(i--, 1)
        }
    });
}
