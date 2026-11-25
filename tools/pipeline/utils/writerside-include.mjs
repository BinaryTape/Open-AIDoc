/**
 * Writerside includes, expanded before translation.
 *
 * Writerside reuses content across pages with
 *
 *   <include from="page.md" element-id="some-id" [use-filter="a,b"]/>
 *   <include from="page.md" element-id="some-id"><var name="x" value="y"/></include>
 *
 * which the site cannot render, so a strategy replaces every include with the
 * content it points at. The target `element-id` can be
 *
 *   - an XML element:     <snippet id="some-id">…</snippet>, <chapter id="…">…
 *   - a Markdown heading: ## Title {id="some-id"}       → the whole section
 *   - a Markdown block:   > A note                      → the block above the
 *                         {style="note" id="some-id"}     attribute line
 *
 * `use-filter` keeps only the elements whose `filter` attribute names one of
 * the filters (elements without one stay), and `<var>` children override the
 * `%name%` variables of the included content.
 *
 * Includes are resolved against the original content of every page, before
 * any other processing, and recursively. One that cannot be resolved is left
 * as it is and reported.
 */
import fs from "node:fs";
import path from "node:path";

const INCLUDE_RE = /([ \t]*)<include\b((?:[^>"]|"[^"<]*")*?)(?:\/>|>([\s\S]*?)<\/include\s*>)/g;
const ATTR_RE = /([\w-]+)\s*=\s*"([^"]*)"/g;
const VAR_RE = /<var\s+name\s*=\s*"([^"]+)"\s+value\s*=\s*"([^"]*)"\s*\/?>/g;
const FENCE_RE = /^[ \t]*(`{3,}|~{3,})/;
const HEADING_RE = /^(#{1,6})\s+.*$/;
const LIST_MARKER_RE = /^[ \t]*(?:[-*+]|\d+[.)])$/;

/** Files the expansion reads and writes: Writerside pages. */
export const isPage = (file) => /\.(md|topic)$/.test(file);

function attributes(text) {
  return Object.fromEntries([...text.matchAll(ATTR_RE)].map(([, name, value]) => [name, value]));
}

/** Ranges of fenced code blocks and HTML comments, where tags are not tags. */
function literalRanges(content) {
  const ranges = [];
  for (const match of content.matchAll(/<!--[\s\S]*?-->/g)) {
    ranges.push([match.index, match.index + match[0].length]);
  }
  let offset = 0;
  let open = null;
  for (const line of content.split("\n")) {
    const fence = FENCE_RE.exec(line);
    if (fence) {
      if (open === null) open = { start: offset, marker: fence[1] };
      else if (fence[1][0] === open.marker[0] && fence[1].length >= open.marker.length) {
        ranges.push([open.start, offset + line.length]);
        open = null;
      }
    }
    offset += line.length + 1;
  }
  if (open) ranges.push([open.start, content.length]);
  return ranges;
}

const inside = (ranges, index) => ranges.some(([start, end]) => index >= start && index < end);

/**
 * The includes of a page, outside code blocks and comments.
 * @returns {{start: number, end: number, indent: string, from: string, elementId: string,
 *   filters: string[] | null, vars: Record<string, string>, tag: string}[]}
 */
export function findIncludes(content) {
  const literal = literalRanges(content);
  const includes = [];
  for (const match of content.matchAll(INCLUDE_RE)) {
    const [tag, indent, attrText, body = ""] = match;
    const attrs = attributes(attrText);
    if (!attrs.from || !attrs["element-id"]) continue; // e.g. Maven's <include>x</include>
    if (inside(literal, match.index + indent.length)) continue;
    includes.push({
      start: match.index,
      end: match.index + tag.length,
      indent,
      from: path.basename(attrs.from.trim()),
      elementId: attrs["element-id"],
      filters: attrs["use-filter"] ? attrs["use-filter"].split(",").map((f) => f.trim()) : null,
      vars: Object.fromEntries([...body.matchAll(VAR_RE)].map(([, name, value]) => [name, value])),
      tag: tag.slice(indent.length),
    });
  }
  return includes;
}

/**
 * Position of the tag that closes the element opened just before `from`,
 * counting nested elements of the same name.
 * @returns {{start: number, end: number} | null}
 */
function closingTag(content, name, from) {
  const tagRe = new RegExp(`<(/?)${name}\\b((?:[^>"]|"[^"<]*")*)>`, "g");
  tagRe.lastIndex = from;
  let depth = 1;
  for (let match; (match = tagRe.exec(content)); ) {
    if (match[1]) depth--;
    else if (!match[2].trimEnd().endsWith("/")) depth++;
    if (depth === 0) return { start: match.index, end: match.index + match[0].length };
  }
  return null;
}

function findXmlElement(content, elementId, literal) {
  const openRe = /<([\w-]+)\b((?:[^>"]|"[^"<]*")*)>/g;
  for (let match; (match = openRe.exec(content)); ) {
    const [tag, name, attrText] = match;
    if (attributes(attrText).id !== elementId || inside(literal, match.index)) continue;
    if (attrText.trimEnd().endsWith("/")) return name === "snippet" ? "" : tag;
    const close = closingTag(content, name, match.index + tag.length);
    if (!close) return null;
    // A snippet is only a wrapper; any other element is included whole.
    return name === "snippet"
      ? content.slice(match.index + tag.length, close.start)
      : content.slice(match.index, close.end);
  }
  return null;
}

function idOfAttributeBlock(text) {
  const block = /\{([^{}]*)\}\s*$/.exec(text);
  if (!block) return null;
  const id = /(?:^|\s)id\s*=\s*"?([^"\s}]+)"?/.exec(block[1]);
  return id ? id[1] : null;
}

function findMarkdownElement(content, elementId) {
  const lines = content.split("\n");
  const inFence = [];
  let open = null;
  for (const line of lines) {
    const fence = FENCE_RE.exec(line);
    if (fence && open === null) {
      open = fence[1];
      inFence.push(true);
    } else if (fence && fence[1][0] === open[0] && fence[1].length >= open.length) {
      open = null;
      inFence.push(true);
    } else {
      inFence.push(open !== null);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    if (inFence[i] || idOfAttributeBlock(lines[i]) !== elementId) continue;

    // A heading: the heading and its section
    const heading = HEADING_RE.exec(lines[i]);
    if (heading) {
      let end = i + 1;
      while (end < lines.length) {
        const next = !inFence[end] && HEADING_RE.exec(lines[end]);
        if (next && next[1].length <= heading[1].length) break;
        end++;
      }
      return lines.slice(i, end).join("\n").replace(/\s+$/, "");
    }

    // An attribute line: the block right above it, and the line itself
    if (/^\s*\{[^{}]*\}\s*$/.test(lines[i])) {
      let start = i - 1;
      if (start >= 0 && inFence[start]) {
        while (start > 0 && !FENCE_RE.test(lines[start])) start--; // closing fence
        start--;
        while (start > 0 && !FENCE_RE.test(lines[start])) start--; // opening fence
      } else {
        while (start > 0 && lines[start - 1].trim() !== "" && !inFence[start - 1]) start--;
      }
      return start >= 0 ? lines.slice(start, i + 1).join("\n") : null;
    }
  }
  return null;
}

/**
 * The content an `element-id` points at in a page, or null.
 */
export function findElement(content, elementId) {
  return findXmlElement(content, elementId, literalRanges(content)) ?? findMarkdownElement(content, elementId);
}

/** Drop the elements whose `filter` names none of the filters. */
export function applyFilters(content, filters) {
  const openRe = /<([\w-]+)\b((?:[^>"]|"[^"<]*")*)>/g;
  let out = "";
  let last = 0;
  for (let match; (match = openRe.exec(content)); ) {
    const [tag, name, attrText] = match;
    const filter = attributes(attrText).filter;
    if (filter === undefined) continue;
    if (filter.split(",").some((f) => filters.includes(f.trim()))) continue;
    const close = attrText.trimEnd().endsWith("/")
      ? { end: match.index + tag.length }
      : closingTag(content, name, match.index + tag.length);
    if (!close) continue;
    // An element on a line of its own takes the line break before it along
    const lineStart = content.lastIndexOf("\n", match.index - 1) + 1;
    const start = content.slice(lineStart, match.index).trim() === "" ? Math.max(lineStart - 1, 0) : match.index;
    out += content.slice(last, start);
    last = close.end;
    openRe.lastIndex = close.end;
  }
  return out + content.slice(last);
}

/** Set `%name%` variables, and drop the snippet's own definitions of them. */
function applyVars(content, vars) {
  for (const [name, value] of Object.entries(vars)) {
    content = content
      .replace(new RegExp(`[ \\t]*<var\\s+name\\s*=\\s*"${name}"[^>]*>[ \\t]*\\n?`, "g"), "")
      .replaceAll(`%${name}%`, value);
  }
  return content;
}

/** @param {string} [rest] - Indentation of the lines after the first */
function reindent(content, indent, rest = indent) {
  const lines = content.replace(/^\s*\n/, "").replace(/\s+$/, "").split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => /^[ \t]*/.exec(l)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l, i) => (l.trim() ? (i === 0 ? indent : rest) + l.slice(min) : "")).join("\n");
}

/** The `<var>` definitions of a page, by name; the first definition wins. */
function definitions(content) {
  const vars = {};
  for (const [, name, value] of content.matchAll(VAR_RE)) if (!(name in vars)) vars[name] = value;
  return vars;
}

/**
 * The variables an included fragment uses that neither the including page
 * nor the fragment itself defines, with their value in the page the fragment
 * comes from, where the fragment is: the last definition before it (a page
 * can set one again for a later section), else its first. Writerside takes a
 * variable from the including page, else from the page the content is in:
 * ktor.io's client-opentelemetry includes a section of server-opentelemetry,
 * and shows its own %plugin_name% (KtorClientTelemetry) with
 * server-opentelemetry's %artifact_name% (opentelemetry-ktor-3.0) (P3-34).
 * @param {string} fragment - The fragment, its includes expanded
 * @param {string} source - The page it comes from
 * @param {string} element - The fragment as it is in that page
 * @param {Set<string>} pageVars - Variables the including page defines
 */
function sourceVars(fragment, source, element, pageVars) {
  const at = source.indexOf(element);
  const before = at < 0 ? "" : source.slice(0, at);
  const defined = { ...definitions(source) };
  for (const [, name, value] of before.matchAll(VAR_RE)) defined[name] = value;
  const own = definitions(fragment);
  const vars = {};
  for (const [, name] of fragment.matchAll(/%([\w.-]+)%/g)) {
    if (!pageVars.has(name) && !Object.hasOwn(own, name) && Object.hasOwn(defined, name)) vars[name] = defined[name];
  }
  return vars;
}

/**
 * Blank lines between an included block and the lines around it. In
 * Writerside an include on a line of its own is a block of its own; in
 * Markdown a block runs on into the next line: ktor.io's client-opentelemetry
 * has two includes on consecutive lines, and the heading of the second
 * ("## Configure OpenTelemetry") was taken into the HTML block ending the
 * first (`</tabs>`), showing as text (P2-20).
 * @param {string} replacement - The included content
 * @param {string} before - The page before the include, includes expanded
 * @param {string} after - The page after it
 */
function separateBlock(replacement, before, after) {
  const rest = /^[ \t]*(\n|$)/.exec(after);
  if (!rest) return replacement; // more on the line of the include
  if (/\S[ \t]*\n$/.test(before)) replacement = "\n" + replacement;
  if (rest[1] && /^[ \t]*\S/.test(after.slice(rest[0].length))) replacement += "\n";
  return replacement;
}

/** The Markdown headings of a text, outside code blocks: line number and level. */
function headingLines(lines) {
  const headings = [];
  let open = null;
  for (const [i, line] of lines.entries()) {
    const fence = FENCE_RE.exec(line);
    if (fence && (open === null || (fence[1][0] === open[0] && fence[1].length >= open.length))) {
      open = open === null ? fence[1] : null;
    } else if (open === null) {
      const heading = HEADING_RE.exec(line);
      if (heading) headings.push({ line: i, level: heading[1].length });
    }
  }
  return headings;
}

/**
 * kotlinlang.org and ktor.io put an included section one level below the
 * heading of the including page it follows: that page's own headings, not
 * those included before it, nor the level the section is written at. Ktor's
 * client-opentelemetry includes server-opentelemetry's `### Add custom
 * attributes` after its own `### Capture response headers`: an h4 there
 * (P3-36). The included headings keep their levels to one another.
 * @param {string} element - The included content
 * @param {string} before - The including page before the include, includes not expanded
 * @param {boolean} page - Whether it is the page itself, whose title is the h1 above every heading
 */
function nestHeadings(element, before, page) {
  const above = headingLines(before.split("\n")).at(-1)?.level ?? (page ? 1 : null);
  const lines = element.split("\n");
  const headings = headingLines(lines);
  if (above === null || headings.length === 0) return element;
  const shift = above + 1 - Math.min(...headings.map((h) => h.level));
  if (shift === 0) return element;
  for (const { line, level } of headings) {
    lines[line] = "#".repeat(Math.min(6, Math.max(1, level + shift))) + lines[line].slice(level);
  }
  return lines.join("\n");
}

/**
 * Replace the includes of a page with the content they point at.
 * @param {string} content - The page
 * @param {string} file - Its file name, for messages and cycle detection
 * @param {(name: string) => string | null} readPage - Original content of a page by file name
 * @param {{file: string, from: string, elementId: string, reason: string}[]} [unresolved] - Collects failures
 * @param {string[]} [stack] - Includes being expanded (cycle detection)
 * @param {Set<string>} [pageVars] - Variables the including page defines (of the page itself when left out)
 * @param {{from: string, name: string, value: string}[]} [filled] - Collects the variables taken from the page a fragment comes from
 */
export function expandIncludes(content, file, readPage, unresolved = [], stack = [], pageVars = new Set(Object.keys(definitions(content))), filled = []) {
  let out = "";
  let last = 0;
  for (const include of findIncludes(content)) {
    const key = `${include.from}#${include.elementId}`;
    const fail = (reason) => unresolved.push({ file, from: include.from, elementId: include.elementId, reason });
    let replacement = null;

    const target = readPage(include.from);
    if (stack.includes(key)) fail("include cycle");
    else if (target === null) fail("page not found");
    else {
      const found = findElement(target, include.elementId);
      let element = found;
      if (element === null) fail("element not found");
      else {
        if (include.filters) element = applyFilters(element, include.filters);
        element = applyVars(element, include.vars);
        element = expandIncludes(element, file, readPage, unresolved, [...stack, key], pageVars, filled);
        // After the includes inside it, which may leave variables of this source
        const fallback = sourceVars(element, target, found, pageVars);
        for (const [name, value] of Object.entries(fallback)) filled.push({ from: include.from, name, value });
        element = applyVars(element, fallback);
        // Inside included content with no heading before the include, the
        // levels are set when that content is put in the page.
        if (file.endsWith(".md")) element = nestHeadings(element, content.slice(0, include.start), stack.length === 0);
        // An include after a list marker (`1. <include …/>`) is the item's
        // content: its other lines go to the column of the tag.
        const lead = content.slice(content.lastIndexOf("\n", include.start - 1) + 1, include.start);
        replacement = LIST_MARKER_RE.test(lead)
          ? reindent(element, include.indent, " ".repeat(lead.length + include.indent.length))
          : reindent(element, include.indent);
        if (lead === "" && include.indent === "" && file.endsWith(".md")) {
          replacement = separateBlock(replacement, out + content.slice(last, include.start), content.slice(include.end));
        }
      }
    }

    out += content.slice(last, include.start) + (replacement ?? include.indent + include.tag);
    last = include.end;
  }
  return out + content.slice(last);
}

/**
 * Expand the includes of every page in a directory (not recursive), each
 * against the original content of the others, and write the pages that changed.
 * @param {string} dir - A flat directory of Writerside pages
 * @returns {{file: string, from: string, elementId: string, reason: string}[]} Includes left unresolved
 */
export function expandIncludesInDir(dir) {
  const pages = readPages(dir);
  const readPage = (name) => pages.get(name) ?? null;
  const unresolved = [];
  for (const [name, content] of pages) {
    const expanded = expandIncludes(content, name, readPage, unresolved);
    if (expanded !== content) fs.writeFileSync(path.join(dir, name), expanded);
  }
  for (const { file, from, elementId, reason } of unresolved) {
    console.warn(`  ⚠️  Unresolved include in ${file}: ${from}#${elementId} (${reason})`);
  }
  return unresolved;
}

function readPages(dir) {
  return new Map(
    fs.readdirSync(dir)
      .filter(isPage)
      .map((name) => [name, fs.readFileSync(path.join(dir, name), "utf8").replace(/\r\n/g, "\n")])
  );
}

/**
 * Prepare the includes of a strategy's flattened pages for translation: add
 * the pages that include a changed page to the task (what they show changed
 * too), then expand every include.
 * @param {{files: string[]}} task - Detected task; files are paths in the clone
 * @param {string} dir - The flat directory of pages in the clone
 * @param {string} relDir - The same directory relative to the clone ("docs", "topics")
 */
export function expandIncludesForTask(task, dir, relDir) {
  const changed = task.files.map((file) => path.basename(file));
  const including = includingPages(dir, changed);
  if (including.length > 0) {
    console.log(`  Pages including a changed page, translated again: ${including.join(", ")}`);
    task.files.push(...including.map((name) => `${relDir}/${name}`));
  }
  return expandIncludesInDir(dir);
}

/**
 * Pages that include, directly or through other pages, one of the given
 * pages: they need translating again when those change.
 * @param {string} dir - A flat directory of Writerside pages
 * @param {string[]} changed - File names of the changed pages
 * @returns {string[]} File names of the including pages, not in `changed`
 */
export function includingPages(dir, changed) {
  const includedBy = new Map();
  for (const [name, content] of readPages(dir)) {
    for (const { from } of findIncludes(content)) {
      if (!includedBy.has(from)) includedBy.set(from, new Set());
      includedBy.get(from).add(name);
    }
  }

  const found = new Set(changed);
  const queue = [...changed];
  while (queue.length > 0) {
    for (const page of includedBy.get(queue.shift()) ?? []) {
      if (!found.has(page)) {
        found.add(page);
        queue.push(page);
      }
    }
  }
  changed.forEach((name) => found.delete(name));
  return [...found].sort();
}
