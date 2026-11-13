/**
 * Writerside's inline tags, which mark file names, UI labels and keys inside
 * running text (see theme/index.ts for how they render).
 *
 * VitePress treats a line that starts with any tag outside its own list of
 * inline HTML tags as an HTML block, so a paragraph that opens with one, like
 *
 *   <Path>build.gradle.kts</Path> ファイルを開き、…
 *
 * came out unwrapped, without its <p> (P3-21). Naming the tags here makes
 * VitePress parse such a line as a paragraph. The match is case-sensitive,
 * hence both spellings of path.
 *
 * Keep in step with TAGS in tools/pipeline/utils/coded-tags.mjs.
 *
 * <math> (TeX, rendered by markdown-it-ws-math.ts) is here too: a formula on
 * a line of its own is a paragraph on kotlinlang.org (P3-28). It is not a
 * label, so coded-tags.mjs does not list it.
 */
export const WS_INLINE_TAGS = ['Path', 'path', 'ui-path', 'control', 'shortcut', 'emphasis', 'math']
