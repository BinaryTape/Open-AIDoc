import {DocsItemConfig} from "../docs.config";
import {SideLocaleConfig} from "../locales.config";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { parseTitleComment } from "../utils/title-comment";

// `withStatus: false` gives plain-text titles (no beta mark), for page headings.
export default function generateSidebar(localeConfig: SideLocaleConfig, docsConfig: DocsItemConfig, { withStatus = true } = {}) {
    let sidebarPrefixDir = localeConfig.lang === "zh-Hans" ? docsConfig.path : path.posix.join(localeConfig.lang, docsConfig.path);
    const relativePrefixDir = path.posix.join("docs", sidebarPrefixDir);
    sidebarPrefixDir = path.posix.join("/", sidebarPrefixDir);
    return generateSidebarNode(localeConfig.lang, docsConfig.framework, docsConfig.type, sidebarPrefixDir, relativePrefixDir, withStatus);
}

function generateSidebarNode(lang: string, framework: string, type: string, sidebarPrefixDir: string, relativePrefixDir: string, withStatus: boolean) {
    const sidebarPath = `docs/.vitepress/sidebar/${type}.sidebar.json`;
    const sidebar = JSON.parse(fs.readFileSync(sidebarPath, 'utf8'));
    const locale: Record<string, string> = JSON.parse(fs.readFileSync(`docs/.vitepress/locales/${lang}.json`, 'utf8'));

    const localizeNode = (node): any => {
        const localizedText =
            (node.text && locale[node.text]) ??
            (node.link ? getTitleFromMarkdown(framework, relativePrefixDir, node.link) : node.text);

        const status = withStatus && node.link && framework === 'MKDocs' ? getPageStatus(relativePrefixDir, node.link, locale) : '';

        const out = {
            ...node,
            text: localizedText && localizedText + status,
            link: node.link ? `${sidebarPrefixDir}${node.link}` : node.href ? localizeHref(lang, node.href) : undefined,
            collapsed: node.collapsed ?? undefined,
        };

        if (node.include) {
            const includedSidebarPath = `docs/.vitepress/sidebar/${node.include}.sidebar.json`;
            const fallbackDocPath = path.join(relativePrefixDir, `${node.include}.md`);

            if (fs.existsSync(includedSidebarPath)) {
                out.items = generateSidebarNode(lang, framework, node.include, sidebarPrefixDir, relativePrefixDir, withStatus);
            } else if (fs.existsSync(fallbackDocPath)) {
                // Some upstream Writerside trees reference an optional child
                // documentation set that is not part of this repository. Keep
                // the existing local overview page reachable instead of
                // making the whole site configuration fail to load.
                out.link = `${sidebarPrefixDir}${node.include}`;
                delete out.include;
                delete out.items;
            } else {
                throw new Error(
                    `Sidebar "${type}" includes missing sidebar "${node.include}" ` +
                    `and no fallback document exists at "${fallbackDocPath}".`
                );
            }
        } else if (Array.isArray(node.items)) {
            out.items = node.items.map(localizeNode);
        } else {
            delete out.items;
        }

        return out;
    };

    return sidebar.map(localizeNode);
}

// A site path in an href (/kotlin/x, linked from another doc type's sidebar)
// stays in the reader's language; URLs are left alone.
export function localizeHref(lang: string, href: string) {
    if (!href.startsWith('/') || href.startsWith('//') || lang === 'zh-Hans') return href;
    return `/${lang}${href}`;
}

function getTitleFromMarkdown(framework: string, rootDir: string, filePath: string) {
    const fullPath = path.join(rootDir, `${filePath}.md`);
    if (!fs.existsSync(fullPath)) return null;
    const content = fs.readFileSync(fullPath, "utf-8");

    switch (framework) {
        // Docusaurus falls back to the first H1 when a page sets no title.
        case 'Docusaurus' : const { data, content: body } = matter(content); return data.title || body.match(/^# (.+)$/m)?.[1] || null;
        case 'Writerside' : return getWritersideTitle(content) || null;
        default : break;
    }
}

// Material's navigation.status: a page with `status: beta` in its front matter
// gets a β after its title (styles/mk-admonition.css). Statuses without a
// message (`mkdocs.status.<status>`) are not shown.
export function getPageStatus(rootDir: string, filePath: string, locale: Record<string, string>) {
    const fullPath = path.join(rootDir, `${filePath}.md`);
    if (!fs.existsSync(fullPath)) return '';
    const status = matter(fs.readFileSync(fullPath, "utf-8")).data.status;
    const label = typeof status === 'string' && /^[\w-]+$/.test(status) ? locale[`mkdocs.status.${status}`] : undefined;
    if (!label) return '';
    const escaped = label.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return `<span class="mk-status mk-status--${status}" role="img" title="${escaped}" aria-label="${escaped}"></span>`;
}

function getWritersideTitle(content: string) {
    const topicMatch = content.match(/<topic\s*([^>]*)>([\s\S]*?)<\/topic>/)
    if (topicMatch && topicMatch[1]) {
        const topicTitleMatch = topicMatch[1].match(/title="([^"]+)"/)
        return topicTitleMatch ? topicTitleMatch[1] : null;
    }
    const markdownTitle = parseTitleComment(content)
    const markdownHeaderMatch = content.match(/^# (.+)$/m)
    return markdownTitle ?? markdownHeaderMatch?.[1] ?? null;
}
