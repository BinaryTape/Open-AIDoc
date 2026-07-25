import fs from 'fs/promises';
import {parseStringPromise} from 'xml2js';
import path from 'node:path';
import {slugify} from "@mdit-vue/shared";
import yaml from 'js-yaml';
import { CONTENT_LOCALES } from '../../../shared/locales.ts';

/** 读 JSON，若不存在返回 {} */
async function readJson(file) {
    try {
        return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
        return {};
    }
}

/** 写 JSON，保持结尾换行 */
async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
}

export async function generateSidebar(source, docType, baseUrl = '') {
    let sidebarNodes, translateKeys;

    if (source.endsWith('tree')) {
        ({ sidebarNodes, translateKeys } = await parseWSSidebar(source, docType));
    } else if (source.includes('mkdocs')) {
        ({ sidebarNodes, translateKeys } = await parseMKSidebar(source, docType, baseUrl));
    } else {
        sidebarNodes = [];
        translateKeys = new Map();
    }

    await generateSidebarJson(docType, sidebarNodes);
    await generateLocaleJson(translateKeys);
}

async function generateSidebarJson(prefix, sidebarNodes) {
    const sidebarFile = `docs/.vitepress/sidebar/${prefix}.sidebar.json`;
    await writeJson(sidebarFile, sidebarNodes)
}

async function generateLocaleJson(translateKeys) {
    const LOCALE_DIR = 'docs/.vitepress/locales';
    /* ---------- ① 处理英文 en.json ---------- */
    const enFile = path.join(LOCALE_DIR, 'en.json');
    const enDict = await readJson(enFile);

    for (const [key, text] of translateKeys) {
        if (key in enDict) {
            if (enDict[key] === text) {
                // Case 1: key 存在且内容一致 → 移除缓冲区
                translateKeys.delete(key);
            } else {
                // Case 2: key 存在但内容不同 → 覆盖英文文本，保留缓冲区
                enDict[key] = text;
            }
        } else {
            // Case 3: key 不存在 → 新增 & 保留缓冲区
            enDict[key] = text;
        }
    }
    await writeJson(enFile, enDict);

    /* ---------- ② 更新其他语言 ---------- */
    for (const lang of CONTENT_LOCALES) {
        const file = path.join(LOCALE_DIR, `${lang}.json`);
        const dict = await readJson(file);

        for (const [key, text] of translateKeys) {
            // 若已有则替换，没有则添加
            dict[key] = text
        }
        await writeJson(file, dict);
    }

}

async function parseWSSidebar(source, docType) {
    const xml = await fs.readFile(source, 'utf8');
    const parsed = await parseStringPromise(xml, {explicitArray: false});
    const translateKeys = new Map();

    /** 找到真正包含 toc‑element 的数组（或对象） */
    function locateToc(container) {
        if (!container || typeof container !== 'object') return null;
        if (container['toc-element']) return container['toc-element'];
        for (const k of Object.keys(container)) {
            const found = locateToc(container[k]);
            if (found) return found;
        }
        return null;
    }

    const stripExt = s => s.replace(/\.(md|topic)$/i, '');

    const tocRoot = locateToc(parsed);
    if (!tocRoot) throw new Error('<toc-element> not found in ' + source);

    async function walk(node) {
        if (!node || typeof node !== 'object') return null;
        const a = node.$ || {};
        if (a.hidden === 'true') return null;

        const slug = stripExt(a.topic || slugify(a['toc-title']));
        const key = `${docType}.${slug}`;

        let baseText = a['toc-title'];
        if (baseText) {
            translateKeys.set(key, baseText);
        }

        const out = {text: key};
        if (a.topic) out.link = `${slug}`;
        if (a.href) out.href = a.href;

        const includes = node['include'];
        if (includes) {
            out.collapsed = true;
            out.include = includes.$.origin;
        }

        const children = node['toc-element'];
        if (children) {
            const arr = Array.isArray(children) ? children : [children];
            out.items = (await Promise.all(arr.map(walk))).filter(Boolean);
            out.collapsed = out.items.length > 0 ? true : undefined;
            out.items = out.items.length > 0 ? out.items : undefined;
        }

        return out;
    }

    const arr = Array.isArray(tocRoot) ? tocRoot : [tocRoot];
    const sidebarNodes = (await Promise.all(arr.map(walk))).filter(Boolean);

    return {
        sidebarNodes,
        translateKeys
    }
}

async function parseMKSidebar(source, docType, baseUrl) {
    let yamlStr = await fs.readFile(source, 'utf8');
    yamlStr = preprocessPythonTags(yamlStr);
    yamlStr = yamlStr.replace(/!ENV\s*\[([^\]]+)\]/g, 'null');

    const yamlObj = yaml.load(yamlStr);
    const siteUrl = baseUrl ? baseUrl : yamlObj.site_url;

    const translateKeys = new Map();

    function entryToNode(title, value) {
        const hasPath = typeof value === 'string' && value.trim().length > 0;

        // key 规则：有路径 → 用路径（稳定）；否则用标题 slug
        const key = `${docType}.${slugify(title)}`;

        translateKeys.set(key, title);

        const node = {text: key};

        if (hasPath) {
            const p = value.trim();
            if (/^https?:\/\//i.test(p)) {
                node.href = p;                          // 绝对外链
            } else if (p.startsWith('index')) {
                node.link = p;
            } else if (p.endsWith('.md')) {
                node.link = p.replace(/\.md$/i, '');
            } else if (p.endsWith('.html')) {
                node.href = siteUrl + p;                          // 本地 html（API 文档等）→ href
            }
            return node;
        }

        // value 是子列表（数组或对象）→ 递归
        const children = Array.isArray(value)
            ? value
            : (value && typeof value === 'object')
                ? Object.entries(value).map(([t, v]) => ({[t]: v}))
                : [];

        node.items = children
            .map((child) => {
                const [[t, v]] = Object.entries(child);
                return entryToNode(t, v);
            })
            .filter(Boolean);

        node.collapsed = node.items.length > 0 ? true : undefined;

        return node;
    }

    function preprocessPythonTags(yml) {
        return yml
            // object/apply
            .replace(/!!python\/object\/apply:[\w.]+/g, '')
            // name
            .replace(/!!python\/name:[^\s\n]+/g, 'null');
    }

    const sidebarNodes = (yamlObj.nav || [])
        .map((item) => {
            const [[title, value]] = Object.entries(item);
            return entryToNode(title, value);
        })
        .filter(Boolean);

    return { sidebarNodes, translateKeys };
}

async function generateFromDir(dir, docType) {
    const files = await fs.readdir(dir);
}