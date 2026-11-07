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
 */
export const WS_INLINE_TAGS = ['Path', 'path', 'ui-path', 'control', 'shortcut', 'emphasis']
