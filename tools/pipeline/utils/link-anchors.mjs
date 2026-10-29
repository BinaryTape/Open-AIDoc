/**
 * Translations keep link targets as upstream writes them, except the part after
 * `#`: a model that translates `[smart casts](typecasts.md#smart-casts)` often
 * translates the anchor along with the text, `typecasts.md#スマートキャスト`. No
 * heading has that id (translated headings carry the upstream anchor, see
 * heading-anchors.mjs), so the link lands at the top of the page.
 *
 * The fix is to put back the anchor the source link had. Links are paired with
 * the source document's by position, as headings are.
 */
import { codeLines } from "./heading-anchors.mjs";

// [text](target), [text](<target>), [text](target "title")
const MARKDOWN_LINK = /\]\(\s*(<[^>\n]*>|[^)\s]+)/g;
const HREF = /\bhref="([^"]*)"/g;
const INLINE_CODE = /(`+)(?:(?!\1).)+?\1/g;
const ASCII = /^[\x00-\x7f]*$/;

/**
 * Link targets outside code, in document order: `{ href, start }`, where
 * `start` is the offset of the target in the document.
 */
export function listLinks(markdown) {
  const lines = markdown.split("\n");
  const code = codeLines(lines);
  const links = [];
  let offset = 0;

  lines.forEach((line, index) => {
    if (!code[index]) {
      // Blank out inline code, keeping offsets: `[a](b)` there is an example.
      const text = line.replace(INLINE_CODE, (span) => " ".repeat(span.length));
      const found = [];
      for (const match of text.matchAll(MARKDOWN_LINK)) {
        const bracketed = match[1].startsWith("<");
        const href = bracketed ? match[1].slice(1, -1) : match[1];
        found.push({ href, start: offset + match.index + match[0].length - match[1].length + (bracketed ? 1 : 0) });
      }
      for (const match of text.matchAll(HREF)) {
        found.push({ href: match[1], start: offset + match.index + match[0].length - 1 - match[1].length });
      }
      links.push(...found.sort((a, b) => a.start - b.start));
    }
    offset += line.length + 1;
  });

  return links;
}

/**
 * Give every translated link the anchor its source link has.
 *
 * When both documents link the same pages in the same order, link N is link N.
 * Otherwise the links are aligned by their page part (longest common
 * subsequence).
 *
 * Only an anchor the model evidently translated — one with non-ASCII
 * characters — is replaced. An ASCII anchor that differs from the source's
 * belongs to a link the translation reordered, and is left alone.
 *
 * @returns {{content: string, restored: number}}
 */
export function applySourceLinkAnchors(translated, source) {
  const sourceLinks = listLinks(source);
  const targetLinks = listLinks(translated);

  const inOrder =
    sourceLinks.length === targetLinks.length &&
    targetLinks.every((link, i) => samePage(sourceLinks[i].href, link.href));
  const pairs = inOrder
    ? targetLinks.map((link, i) => [link, sourceLinks[i]])
    : alignLinks(sourceLinks, targetLinks);

  const edits = [];
  for (const [target, from] of pairs) {
    const href = restoredHref(from.href, target.href);
    if (href !== null) edits.push({ start: target.start, end: target.start + target.href.length, href });
  }

  let content = translated;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    content = content.slice(0, edit.start) + edit.href + content.slice(edit.end);
  }
  return { content, restored: edits.length };
}

/**
 * The source link target, when the translated one is that same link with its
 * anchor translated; null otherwise.
 *
 * A translated link with no page part and the source's anchor is that link
 * too: Ktor pages converted before the Writerside `<a href anchor>` fix lost
 * the page of such a link (`server-plugins.md#install` became `#install`).
 */
export function restoredHref(source, translated) {
  if (source === translated || !source.includes("#") || !translated.includes("#")) return null;
  const [sourcePage, sourceHash] = splitHash(source);
  const [targetPage, targetHash] = splitHash(translated);
  if (sourcePage === targetPage) return ASCII.test(safeDecode(targetHash)) ? null : source;
  if (targetPage === "" && targetHash === sourceHash) return source;
  return null;
}

/** Same page, or the anchor-only form a lost page left (see restoredHref). */
function samePage(source, translated) {
  const [sourcePage, sourceHash] = splitHash(source);
  const [targetPage, targetHash] = splitHash(translated);
  return sourcePage === targetPage || (targetPage === "" && targetHash !== "" && targetHash === sourceHash);
}

function alignLinks(sourceLinks, targetLinks) {
  const same = (s, t) => samePage(s.href, t.href);
  // lengths[i][j]: LCS of sourceLinks[i..] and targetLinks[j..]
  const lengths = Array.from({ length: sourceLinks.length + 1 }, () =>
    new Array(targetLinks.length + 1).fill(0)
  );
  for (let i = sourceLinks.length - 1; i >= 0; i--) {
    for (let j = targetLinks.length - 1; j >= 0; j--) {
      lengths[i][j] = same(sourceLinks[i], targetLinks[j])
        ? lengths[i + 1][j + 1] + 1
        : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const pairs = [];
  for (let i = 0, j = 0; i < sourceLinks.length && j < targetLinks.length; ) {
    if (same(sourceLinks[i], targetLinks[j])) pairs.push([targetLinks[j++], sourceLinks[i++]]);
    else if (lengths[i + 1][j] >= lengths[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

function splitHash(href) {
  const at = href.indexOf("#");
  return at === -1 ? [href, ""] : [href.slice(0, at), href.slice(at + 1)];
}

function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
