import fs from "fs";
import path from "path";

export async function replaceAsync(str, regex, asyncReplacer) {
    const matches = [];
    let match;

    regex.lastIndex = 0;

    while ((match = regex.exec(str)) !== null) {
        matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
        });

        if (!regex.global) break;
    }

    for (let i = matches.length - 1; i >= 0; i--) {
        const matchInfo = matches[i];
        const replacement = await asyncReplacer(matchInfo.match, ...matchInfo.groups);
        str = str.substring(0, matchInfo.index) + replacement + str.substring(matchInfo.index + matchInfo.match.length);
    }

    return str;
}

/**
 * Extract and process <topic> content from raw file content (pure in-memory, no file I/O).
 * @param {string} rawContent  - Raw file content (e.g. .topic XML)
 * @param {boolean} isKtor     - Whether to apply Ktor-specific XML tag processing
 * @param {string} filePath    - File path (used by processTopicContentAsync for anchor resolution)
 * @param {string} docsPath    - Docs directory path (used for include/card/link resolution)
 * @returns {Promise<string|null>} Processed topic content, or null if no <topic> tag found
 */
export async function extractTopicContent(rawContent, isKtor = false, filePath = '', docsPath = '') {
    const match = rawContent.match(/<topic\s*([^>]*)>([\s\S]*?)<\/topic>/);
    if (!match) return null;

    let topicContent = match[0];

    if (isKtor) {
        topicContent = await processTopicContentAsync(filePath, docsPath, topicContent);
    }

    // Remove <include-in-head> tag and its content
    topicContent = topicContent.replace(
        /<include-in-head>[\s\S]*?<\/include-in-head>/gm,
        ''
    );

    // Remove any empty lines from the extracted topic content
    topicContent = topicContent
        .split(/\r?\n/)
        .filter(line => line.trim() !== '')
        .join('\n');

    if (topicContent.includes('<section-starting-page>')) {
        topicContent = "---\naside: false\n---\n" + topicContent;
    }

    return topicContent;
}

export async function processTopicFileAsync(inputFile, outputPath, isKtor = false) {
    try {
        const data = await fs.promises.readFile(inputFile, 'utf8');
        const topicContent = await extractTopicContent(data, isKtor, inputFile, outputPath);

        if (topicContent !== null) {
            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            const inputFileName = path.basename(inputFile).replace('.topic', '');
            const outputFile = path.join(outputPath, `${inputFileName}.md`);

            await fs.promises.writeFile(outputFile, topicContent);
            console.log(`Successfully exported <topic> content to ${outputFile}`);
        } else {
            console.log('No <topic> tag found');
        }
    } catch (err) {
        console.error('Failed to process topic file:', err);
    }
}

export async function processTopicContentAsync(currentFilePath, docsPath, topicContent) {
    const docName = docsPath.split('/')[0].split('-')[0];
    const docRoot = `/${docName}/`;

    function docHref(href) {
        return `${docRoot}${href.split('.')[0]}`;
    }

    topicContent = topicContent.replace(
        /<path>([\s\S]*?)<\/path>/g,
        (match, content) => {
            const escapedContent = content.replace(/\\/g, "\\\\");

            return `<Path>${escapedContent}</Path>`
        }
    );

    // <include> is expanded earlier, on the original pages (utils/writerside-include.mjs).

    topicContent = topicContent.replace(
        /<card\s*([^>]*)\/>/g,
        (match, attrs) => {
            const href = attrs.match(/href="([^"]+)"/)[1];
            if (href.startsWith('http')) {
                return match;
            }

            const topicPath = path.join(docsPath, href);
            const summary = getCardSummary(topicPath);
            const inner = getTopicTitle(topicPath);

            return `<card href="${docHref(href)}" summary="${summary}">${inner}</card>`;
        }
    );

    topicContent = topicContent.replace(
        /<card\b\s*([^>]*)>([\s\S]*?)<\/card>/g,
        (match, attrs, inner) => {
            const href = attrs.match(/href="([^"]+)"/)[1];
            const summaryMatch = attrs.match(/summary="([^"]+)"/);

            if (href.startsWith('http')) {
                return match;
            }

            const topicPath = path.join(docsPath, href);
            const summary = summaryMatch ? summaryMatch[1] : getCardSummary(topicPath);

            return `<card href="${docHref(href)}" summary="${summary}">${inner}</card>`;
        }
    );

    // <anchor name="x"/>: an extra link target, usually right above a heading
    topicContent = topicContent.replace(/<anchor\s+name="([^"]+)"\s*\/>/g, '<a id="$1"></a>');

    // \b: not <action>, <anchor>, ... (an Android manifest in a code block)
    topicContent = topicContent.replace(
        /<a\b\s*([^>]*)\/>/g,
        (match, attrs) => {
            const anchor = attrs.match(/anchor="([^"]+)"/);
            const href = attrs.match(/href="([^"]+)"/);

            if (anchor && href) {
                return `<a href="${href[1]}#${anchor[1]}"></a>`;
            } else if (href) {
                return `<a href="${href[1]}"></a>`;
            } else if (anchor) {
                const inner = getChapterTitle(currentFilePath, anchor[1]) || anchor[1]
                return `<a anchor="${anchor[1]}">${inner}</a>`
            }
            return match;
        }
    );

    topicContent = topicContent.replace(
        /<a\b\s*([^>]*)>([\s\S]*?)<\/a>/g,
        (match, attrs, inner) => {
            const anchor = attrs.match(/anchor="([^"]+)"/);
            if (anchor) {
                return `<a href="#${anchor[1]}">${inner}</a>`;
            }

            const hrefMatch = attrs.match(/href="([^"]+)"/);
            if (!hrefMatch) return match; // a link target: <a id="x"></a>

            const summaryMatch = attrs.match(/summary="([^"]+)"/);
            const href = hrefMatch[1];
            if (summaryMatch && summaryMatch[1] !== undefined) {
                return `<card href="${docHref(href)}" summary="${summaryMatch[1]}">${inner}</card>`;
            }

            if (href.startsWith('http')) {
                return match;
            }

            if (href.startsWith('#')) {
                return match;
            } else if (href.includes('#')) {
                const topicPath = path.join(docsPath, href.split('#')[0]);
                if (inner === '') {
                    inner = getChapterTitle(topicPath, href.split('#')[1]) || getTopicTitle(topicPath) || href;
                }
                return `<a href="${href}">${inner}</a>`;
            }

            const topicPath = path.join(docsPath, href);
            if (inner === '') {
                inner = getTopicTitle(topicPath);
            }

            const summary = getLinkSummary(topicPath);

            return `<Links href="${docHref(href)}" summary="${summary}">${inner}</Links>`;
        }
    );

    topicContent = await replaceAsync(
        topicContent,
        /<code-block\b([^>]*?)\s+src="([^"]+)"([^>]*)\/>/gi,
        async (match, beforeAttrs, srcPath, afterAttrs) => {
            let ranges = [];
            const inc = /include-lines="([^"]+)"/.exec(beforeAttrs + afterAttrs);
            if (inc) {
                ranges = inc[1].split(',');
            }

            const snippetsPath = resolveCodeSnippetsDir(docsPath);
            let codeText = await fetchSnippet(snippetsPath, srcPath, ranges);

            codeText = codeText.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
            const escaped = codeText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '&#10;');

            const cleanAttrs = (beforeAttrs + afterAttrs)
                .replace(/\s+src="[^"]+"/, '')
                .replace(/\s+include-lines="[^"]+"/, '')
                .trim();
            const space = cleanAttrs ? ' ' : '';
                return `<code-block${space}${cleanAttrs} code="${escaped}"/>`;
        }
    );

    topicContent = await replaceAsync(
        topicContent,
        /<code-block\b(?![^>]*\/>)\s*([^>]*)>([\s\S]*?)<\/code-block>/gi,
        async (match, rawAttrs, inner) => {
            if (/\s+code="[\s\S]*?"/.test(rawAttrs)) {
                return match;
            }

            let rawCode;
            if (/\bsrc=/i.test(rawAttrs)) {
                const src = /src="([^"]+)"/.exec(rawAttrs);
                const include_lines = /include-lines="([^"]+)"/.exec(rawAttrs);
                const ranges = include_lines ? include_lines[1].split(',') : [];
                const snippetsPath = resolveCodeSnippetsDir(docsPath);
                rawCode = await fetchSnippet(snippetsPath, src[1], ranges);
                rawAttrs = rawAttrs.replace(/\s+src="[^"]+"/, '')
                    .replace(/\s+include-lines="[^"]+"/, '')
                    .trim();
            } else {
                rawCode = inner.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');
            }

            rawCode = rawCode.replace(/^\s*\n/, '').replace(/\n\s*$/, '');

            const escaped = rawCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '&#10;');

            const space = rawAttrs ? ' ' : '';
            return `<code-block${space}${rawAttrs} code="${escaped}"/>`;
        }
    );

    return normalizeWritersideCodeBlocks(topicContent);
}

/**
 * Convert Writerside <code-block> bodies (including XML CDATA) into a Vue-safe
 * self-closing tag. Idempotent for blocks that already have a `code` attribute.
 */
export function normalizeWritersideCodeBlocks(content) {
    content = content.replace(
        /<code-block\b(?![^>]*\/>)\s*([^>]*)>([\s\S]*?)<\/code-block>/gi,
        (match, rawAttrs, inner) => {
            if (/\s+code="[\s\S]*?"/.test(rawAttrs)) {
                return match;
            }
            if (/\bsrc=/i.test(rawAttrs)) {
                return match;
            }

            let rawCode = inner.replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');
            rawCode = rawCode.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
            const escaped = rawCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '&#10;');
            const space = rawAttrs ? ' ' : '';
            return `<code-block${space}${rawAttrs} code="${escaped}"/>`;
        }
    );

    return content.replace(
        /<!\[CDATA\[([\s\S]*?)]]>/g,
        (match, inner) => {
            return inner
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/\n/g, '&#10;');
        }
    );
}

/**
 * Resolve codeSnippets/ next to the Writerside topics/docs directory.
 * Works for both absolute and relative paths (unlike path.split('/')[0]).
 */
export function resolveCodeSnippetsDir(topicsOrDocsDir) {
    return path.resolve(topicsOrDocsDir, '..', 'codeSnippets')
}

export async function fetchSnippet(snippetsPath, srcPath, include_lines) {
    let codeText;

    if (srcPath.startsWith('http')) {
        try {
            if (typeof fetch === "function") {
                const res = await fetch(srcPath, {redirect: "follow"});
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                codeText = await res.text();
            }
        } catch (e) {
            console.warn("Unable to load snippet from URL.", srcPath, e?.message || e);
            return "";
        }
    } else {
        try {
            const snippetFile = path.join(snippetsPath, srcPath);
            codeText = await fs.promises.readFile(snippetFile, 'utf8');
        } catch (e) {
            console.warn('Unable to load snippet from file.', srcPath);
            return '';
        }
    }

    if (include_lines.length > 0) {
        const lines = codeText.split(/\r?\n/);
        const sel = [];
        include_lines.forEach(r => {
            if (r.includes('-')) {
                const [s, e] = r.split('-').map(n => parseInt(n, 10) - 1);
                sel.push(...lines.slice(s, e + 1));
            } else {
                const idx = parseInt(r, 10) - 1;
                if (lines[idx] !== undefined) sel.push(lines[idx]);
            }
        });
        codeText = sel.join('\n');
    }

    return codeText;
}

export function getTopicTitle(fileUrl) {
    try {
        const file = fs.readFileSync(fileUrl, 'utf8');

        let match;
        if (fileUrl.includes('.md')) {
            match = file.match(/^\[\/\/\]:\s*#\s*\(title:\s*(.+?)\s*\)/);
            return match ? match[1] : '';
        } else {
            match = file.match(/<topic\b([^>]*?)\s+title="([^"]+)"([^>]*?)>/);
            return match ? match[2] : '';
        }
    } catch (e) {
        console.error('Failed to get topic title', fileUrl, e);
        return '';
    }
}

// The id Writerside gives a Markdown heading without an explicit one
const headingSlug = (title) =>
    title.toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Title of the chapter (heading) with the given id, or '' when not found.
 */
export function getChapterTitle(fileUrl, chapterId) {
    try {
        const file = fs.readFileSync(fileUrl, 'utf8');

        if (fileUrl.includes('.md')) {
            for (const line of file.split('\n')) {
                const heading = /^#{1,6}\s+(.+?)\s*(?:\{([^{}]*)\})?\s*$/.exec(line);
                if (!heading) continue;
                const id = heading[2] && /(?:^|\s)id\s*=\s*"?([^"\s}]+)"?/.exec(heading[2]);
                if ((id ? id[1] : headingSlug(heading[1])) === chapterId) return heading[1];
            }
        } else {
            const chapter = file.match(new RegExp(`<chapter\\b[^>]*\\bid="${chapterId}"[^>]*>`));
            const title = chapter && /\btitle="([^"]+)"/.exec(chapter[0]);
            if (title) return title[1];
        }
    } catch (e) {
        console.error('Failed to get chapter title', fileUrl, e);
    }
    return '';
}

function getCardSummary(fileUrl) {
    try {
        const file = fs.readFileSync(fileUrl, 'utf8');
        const match = file.match(/<card-summary>([\s\S]*?)<\/card-summary>/);
        if (match && match[1] !== undefined) {
            return match[1].trim();
        }
    } catch (e) {
        console.error('Failed to get link summary', fileUrl, e);
    }
    return '';
}

export function getLinkSummary(fileUrl) {
    try {
        const file = fs.readFileSync(fileUrl, 'utf8');
        const match = file.match(/<link-summary>([\s\S]*?)<\/link-summary>/);
        if (match && match[1] !== undefined) {
            return match[1].trim();
        } else {
            const match = file.match(/<tldr>([\s\S]*?)<\/tldr>/);
            if (match && match[1] !== undefined) {
                match[1] = match[1].replace(/<([\s\S]*?)>/g, '');
                return match[1].split('\n').map(line => line.trim()).filter(line => line.length > 0).join(' ');
            }
        }
    } catch (e) {
        console.error('Failed to get link summary', fileUrl, e);
    }
    return '';
}

