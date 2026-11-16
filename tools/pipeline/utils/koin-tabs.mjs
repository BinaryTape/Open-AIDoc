/**
 * Koin's code examples come in three styles, shown on insert-koin.io as tabs
 * (Compiler Plugin DSL / Annotations / Constructor / Classic DSL, the choice
 * applying to every page). llms-full.txt flattens each tab into its label in
 * bold followed by its content:
 *
 *   **Compiler Plugin DSL**
 *   ```kotlin
 *   single<ApiService>()
 *   ```
 *
 *   **Annotations**
 *   ...
 *
 * A tab can hold paragraphs as well as code, so where the last tab of a set
 * ends cannot be told from the Markdown. The site's own page can: its HTML
 * has every tab and its content. This puts the tabs back as the site's
 * Writerside tabs (Tabs.vue), linked across pages by `group-key`:
 *
 *   <tabs group="koin-style">
 *   <tab title="Compiler Plugin DSL" group-key="compiler-plugin">
 *
 *   ```kotlin
 *   ...
 *   ```
 *
 *   </tab>
 *   ...
 *   </tabs>
 */

export const KOIN_TAB_GROUP = "koin-style";

/** The tabs of every set, in their order on the site. */
export const KOIN_TABS = [
  { title: "Compiler Plugin DSL", key: "compiler-plugin" },
  { title: "Annotations", key: "annotations" },
  { title: "Constructor / Classic DSL", key: "classic" },
];

// ---------------------------------------------------------------------------
// The site's page: its tab sets, and the kind of each block in each tab
// ---------------------------------------------------------------------------

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

/**
 * The elements of an HTML document as a tree, enough for reading the tabs:
 * tag, attributes (as written), children, and the text inside.
 */
function parseHtml(html) {
  const root = { tag: "#root", attrs: "", children: [], start: 0, end: html.length };
  const stack = [root];
  for (const match of html.matchAll(TAG)) {
    const [whole, closing, name, attrs] = match;
    if (whole.startsWith("<!--")) continue;
    const tag = name.toLowerCase();
    const parent = stack.at(-1);
    if (closing) {
      // Close up to the matching element; a stray closing tag is ignored
      const index = stack.findLastIndex((element) => element.tag === tag);
      if (index <= 0) continue;
      for (const element of stack.splice(index)) element.end = match.index;
      continue;
    }
    const element = { tag, attrs, children: [], start: match.index + whole.length, end: match.index + whole.length };
    parent.children.push(element);
    if (!VOID.has(tag) && !attrs.trimEnd().endsWith("/") && tag !== "script" && tag !== "style") stack.push(element);
  }
  return root;
}

const hasAttr = (element, name, value) =>
  new RegExp(`(?:^|\\s)${name}=(["'])([^"']*\\s)?${value}(\\s[^"']*)?\\1`).test(element.attrs);
const hasClass = (element, prefix) =>
  new RegExp(`(?:^|\\s)class=(["'])(?:[^"']*\\s)?${prefix}`).test(element.attrs);

function* descendants(element) {
  for (const child of element.children) {
    yield child;
    yield* descendants(child);
  }
}

const decode = (text) => text
  .replace(/<[^>]*>/g, "")
  .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
  .trim();

/**
 * The tab sets of a page of insert-koin.io, in order.
 * @param {string} html
 * @returns {{tabs: string[], panels: ("code" | "text")[][]}[]} For each set, its tab titles,
 *   and for each tab the kind of each of its blocks (a code block, or anything else)
 */
export function officialTabSets(html) {
  const root = parseHtml(html);
  const article = [...descendants(root)].find((element) => element.tag === "article") ?? root;
  const sets = [];
  for (const container of descendants(article)) {
    if (!hasClass(container, "tabs-container")) continue;
    const list = container.children.find((child) => hasAttr(child, "role", "tablist"));
    const panelsParent = container.children.find((child) => child !== list);
    if (!list || !panelsParent) continue;
    const tabs = [...descendants(list)].filter((e) => hasAttr(e, "role", "tab")).map((e) => decode(html.slice(e.start, e.end)));
    const panels = panelsParent.children
      .filter((child) => hasAttr(child, "role", "tabpanel"))
      .map((panel) => panel.children.map((block) => (hasClass(block, "language-") || hasClass(block, "codeBlockContainer") ? "code" : "text")));
    sets.push({ tabs, panels });
  }
  return sets;
}

// ---------------------------------------------------------------------------
// The page's Markdown
// ---------------------------------------------------------------------------

/** A label line: the tab's title alone in bold. */
const LABEL = /^\*\*([^*]+?)\*\*:?[ \t]*$/;

/** Which tab a label of the upstream names (its index in KOIN_TABS), or -1. */
export function tabOfTitle(label) {
  return KOIN_TABS.findIndex((tab) => tab.title === label.trim());
}

/**
 * Which tab a label of a translated page names, or -1. Translations of the
 * flattened pages translated the labels, in a few ways each (编译器插件 DSL,
 * アノテーション, 어노테이션 (Annotations)...).
 */
export function tabOfLabel(label) {
  const text = label.toLowerCase();
  if (/plugin|插件|外掛|プラグイン|플러그인/.test(text)) return 0;
  if (/annotation|注解|註解|アノテーション|애너테이션|어노테이션|애노테이션/.test(text)) return 1;
  if (/classic|constructor|经典|經典|传统|傳統|クラシック|コンストラクタ|클래식|생성자|构造|建構/.test(text)) return 2;
  return -1;
}

/** Whether the page has a tab label line, so its tabs are worth reading from the site. */
export function hasTabLabels(markdown, labelOf = tabOfTitle) {
  return markdown.split(/\r?\n/).some((line) => {
    const label = LABEL.exec(line);
    return label !== null && labelOf(label[1]) >= 0;
  });
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/**
 * The blocks of Markdown lines from `from`, until `to`: a fenced code block,
 * a ::: container, or lines up to a blank line. A list or other block that
 * continues after a blank line counts as one more block, which the
 * comparison with the site's blocks then catches.
 * @returns {{start: number, end: number, kind: "code" | "text"}[]} Line ranges, `end` exclusive
 */
export function markdownBlocks(lines, from = 0, to = lines.length) {
  const blocks = [];
  let i = from;
  while (i < to) {
    if (lines[i].trim() === "") {
      i++;
      continue;
    }
    const start = i;
    const fence = FENCE.exec(lines[i]);
    if (fence) {
      const marker = fence[1];
      i++;
      while (i < to && !new RegExp(`^ {0,3}${marker[0]}{${marker.length},}\\s*$`).test(lines[i])) i++;
      blocks.push({ start, end: Math.min(i + 1, to), kind: "code" });
      i++;
      continue;
    }
    if (/^:::/.test(lines[i])) {
      i++;
      while (i < to && !/^:::\s*$/.test(lines[i])) i++;
      blocks.push({ start, end: Math.min(i + 1, to), kind: "text" });
      i++;
      continue;
    }
    // A paragraph (or list, heading...) ends at a blank line or where a fence starts
    i++;
    while (i < to && lines[i].trim() !== "" && !FENCE.test(lines[i])) i++;
    blocks.push({ start, end: i, kind: "text" });
  }
  return blocks;
}

const sameKinds = (blocks, kinds) => blocks.length === kinds.length && blocks.every((block, i) => block.kind === kinds[i]);

/**
 * Put the tabs of a page back, by the site's tab sets for the page.
 *
 * The label lines of the page, in order, must form the site's sets (each set
 * one label per tab, in the order of KOIN_TABS), and the blocks under each
 * label must be the blocks of that tab on the site. Then the last tab of a
 * set takes as many blocks as the site shows in it. Otherwise nothing is
 * changed and `problem` says why.
 *
 * @param {string} markdown
 * @param {{tabs: string[], panels: ("code" | "text")[][]}[]} sets - From officialTabSets
 * @param {{labelOf?: (label: string) => number}} [options] - How labels are read:
 *   the upstream's English titles (default), or tabOfLabel for a translated page
 * @returns {{markdown: string, sets: number, problem?: string}}
 */
export function applyKoinTabs(markdown, sets, { labelOf = tabOfTitle } = {}) {
  const eol = markdown.includes("\r\n") ? "\r\n" : "\n";
  const lines = markdown.split(/\r?\n/);
  const unchanged = (problem) => ({ markdown, sets: 0, problem });

  for (const set of sets) {
    if (set.tabs.length !== KOIN_TABS.length || set.tabs.some((title, i) => title !== KOIN_TABS[i].title)) {
      return unchanged(`the site has a tab set other than ${KOIN_TABS.map((t) => t.title).join(" / ")}: ${set.tabs.join(" / ")}`);
    }
  }

  // Label lines outside code blocks
  const labels = [];
  const codeLines = new Set();
  for (const block of markdownBlocks(lines)) {
    if (block.kind === "code") for (let i = block.start; i < block.end; i++) codeLines.add(i);
  }
  lines.forEach((line, index) => {
    const label = LABEL.exec(line);
    if (!label || codeLines.has(index)) return;
    const tab = labelOf(label[1]);
    if (tab >= 0) labels.push({ line: index, tab });
  });
  if (labels.length === 0 && sets.length === 0) return { markdown, sets: 0 };
  if (labels.length !== sets.length * KOIN_TABS.length) {
    return unchanged(`${labels.length} tab labels for ${sets.length} tab sets on the site`);
  }

  const replacements = [];
  for (let s = 0; s < sets.length; s++) {
    const setLabels = labels.slice(s * KOIN_TABS.length, (s + 1) * KOIN_TABS.length);
    if (setLabels.some((label, i) => label.tab !== i)) {
      return unchanged(`tab set ${s + 1}: labels out of order (line ${setLabels[0].line + 1})`);
    }
    const tabs = [];
    for (let t = 0; t < KOIN_TABS.length; t++) {
      const from = setLabels[t].line + 1;
      const last = t === KOIN_TABS.length - 1;
      const next = last ? (labels[(s + 1) * KOIN_TABS.length]?.line ?? lines.length) : setLabels[t + 1].line;
      const expected = sets[s].panels[t];
      let blocks = markdownBlocks(lines, from, next);
      if (last) blocks = blocks.slice(0, expected.length);
      if (!sameKinds(blocks, expected)) {
        return unchanged(`tab set ${s + 1}, ${KOIN_TABS[t].title} (line ${from}): blocks ${blocks.map((b) => b.kind).join(",") || "none"}, the site has ${expected.join(",") || "none"}`);
      }
      tabs.push({ label: setLabels[t].line, blocks });
    }
    const end = tabs.at(-1).blocks.at(-1)?.end ?? tabs.at(-1).label + 1;
    const out = [`<tabs group="${KOIN_TAB_GROUP}">`];
    tabs.forEach((tab, t) => {
      out.push(`<tab title="${KOIN_TABS[t].title}" group-key="${KOIN_TABS[t].key}">`, "");
      const content = tab.blocks.length > 0 ? lines.slice(tab.blocks[0].start, tab.blocks.at(-1).end) : [];
      if (content.length > 0) out.push(...content, "");
      out.push("</tab>");
    });
    out.push("</tabs>");
    replacements.push({ start: setLabels[0].line, end, lines: out });
  }

  for (const { start, end, lines: out } of replacements.reverse()) {
    // Blank lines around the tabs: an HTML block cannot interrupt a paragraph
    const before = start > 0 && lines[start - 1].trim() !== "" ? [""] : [];
    const after = end < lines.length && lines[end].trim() !== "" ? [""] : [];
    lines.splice(start, end - start, ...before, ...out, ...after);
  }
  return { markdown: lines.join(eol), sets: sets.length };
}
