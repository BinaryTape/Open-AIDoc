import fs from "fs";
import {
    fetchSnippet,
    getChapterTitle,
    getTopicTitle,
    processTopicContentAsync,
    replaceAsync,
    resolveCodeSnippetsDir,
} from "./TopicProcessor.mjs";
import path from "node:path";

/**
 * Full markdown processing pipeline (pure in-memory, no file I/O).
 * Applies Writerside XML tag processing (processTopicContentAsync) followed by
 * markdown-specific transformations (processMarkdownContent).
 * @param {string} filePath - File path (used for snippet/title resolution)
 * @param {string} content  - Raw markdown content
 * @returns {Promise<string>} Processed markdown content
 */
export async function processFullMarkdownContent(filePath, content) {
    let processedContent = await processTopicContentAsync(filePath, path.dirname(filePath), content);
    return await processMarkdownContent(filePath, processedContent);
}

export async function processMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    const processedContent = await processFullMarkdownContent(filePath, content);
    fs.writeFileSync(filePath, processedContent, "utf-8");
}

// Attributes kept on the expanded block: the site folds it (code-block-attrs.ts).
// The others (src, include-lines, style, …) only shaped the block upstream.
const KEPT_ATTRS = /\b(?:collapsible|initial-collapse-state|default-state|collapsed-title|collapsed-title-line-number)=(?:"[^"]*"|'[^']*')/g;

/**
 * Fills each empty code block followed by a `{src="…"}` attribute line with
 * that file of the snippets directory (lines picked by `include-lines`).
 * The folding attributes (collapsible, collapsed-title, …) stay on a line of
 * their own after the block. A snippet that cannot be read leaves the block
 * as it was and is reported, so the empty block does not go out unnoticed.
 * @param {string} content
 * @param {string} snippetsPath - Directory `src` is relative to
 * @param {string} [label] - Page named in the report
 */
export async function expandCodeSnippets(content, snippetsPath, label = "") {
    return replaceAsync(
        content,
        /```([^\n`]*)\n(\s*)```(?:\s*\n)?(\s*)\{([^}]*)\}/gm,
        async (match, language, indent, endIndent, attr) => {
            const src = /\bsrc="([^"]+)"/.exec(attr);
            if (!src) return match;

            const include_lines = /include-lines="([^"]+)"/.exec(attr);
            const ranges = include_lines ? include_lines[1].split(',') : [];
            const code = await fetchSnippet(snippetsPath, src[1], ranges);
            if (!code) {
                console.error(`  ❌ Snippet not found or empty: ${src[1]} (in ${snippetsPath}), used by ${label || "a page"}`);
                return match;
            }

            let lines = code.split("\n");

            const minIndent = Math.min(
                ...lines.map(line => {
                    const match = line.match(/^(\s*)/);
                    return match ? match[1].length : 0;
                })
            );

            lines = lines.map(line => line.slice(minIndent));

            const indentedCode = lines
                .map(line => indent + line)
                .join("\n");

            const rest = (attr.match(KEPT_ATTRS) ?? []).join(" ");
            return `\`\`\`${language}\n${indentedCode}\n${indent}\`\`\`` + (rest ? `\n${endIndent}{${rest}}` : "");
        }
    );
}

export async function processMarkdownContent(filePath, content) {
    content = await expandCodeSnippets(content, resolveCodeSnippetsDir(path.dirname(filePath)), filePath);

    content = content.replace(
        /\[\[\[([^\|\]]+)\|([^\]]+)\]\]\]/g,
        (_, title, link) => {
            return `${title}`
        }
    );

    content = content
        .replace(/<\s*tabs\b([^>]*)>/gi, '<Tabs$1>')
        .replace(/<\s*\/\s*tabs\s*>/gi, '</Tabs>')
        .replace(/<\s*tab\b([^>]*)>/gi, '<TabItem$1>')
        .replace(/<\s*\/\s*tab\s*>/gi, '</TabItem>');

    content = content.replace(
        /<code>([\s\S]*?)(<\/code>|<\/code-block>)/g,
        (match, content, closing) => {
            const escapedContent = content
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\*/g, "&#42;");
            return `<code>${escapedContent}</code>`;
        }
    );

    content = content.replace(
        /\[]\(([\s\S]*?)\)/g,
        (match, href) => {
            // Writerside fills an empty link with the title of its target
            const [page, anchor] = href.split('#');
            const targetFile = page ? path.join(path.dirname(filePath), page) : filePath;
            const title = (anchor !== undefined && getChapterTitle(targetFile, anchor))
                || (page && getTopicTitle(targetFile))
                || href;

            return `[${title}](${href})`
        }
    );

    content = content.replace(
        /(<tr>)([\s\S]*?)(<\/tr>)/g,
        (match, open, content, close) => {
            const normalized = content.trim();
            return `\n${open}\n${normalized}\n${close}\n`;
        }
    );

    content = content.replace(
        /<table>([\s\S]*?)<\/table>/g,
        (match, content) => {
            return match.replace(
                /\n```([^\n`]*)\n([\s\S]*?)```\n/gm,
                (match, lang, content) => {
                    const code = content
                        .replace(/^\s*\n/, '')
                        .replace(/\n\s*$/, '')
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/\n/g, '&#10;');
                    return `<code-block lang="${lang}" code="${code}"/>`;
                }
            )
        }
    );

    return content;
}