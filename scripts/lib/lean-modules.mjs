/**
 * VitePress gives each page two client modules: the full one, and a lean one
 * for the first load, with the HTML of its static vnodes emptied (the HTML is
 * already on the page). It marks those strings when the chunk is rendered and
 * strips the marked spans after minification.
 *
 * A marker that spans more than one string strips the code between them too:
 * a SyntaxError at best (P0-10, kotlin/lincheck-getting-started), content
 * gone without a word when the brackets happen to balance. Either way the
 * lean module calls the static vnode helper fewer times than the full one.
 */

/** The static vnode helper of a lean module: the function it calls with "". */
const EMPTIED = /([\w$]+)\(""\s*,\s*\d+\)/g

const escapeName = (name) => name.replace(/\$/g, '\\$')

/**
 * Calls of the static vnode helper with a string, in the full and the lean
 * module, for each helper whose counts differ. Empty when the lean module
 * only lost the HTML.
 * @param {string} full
 * @param {string} lean
 * @returns {{name: string, full: number, lean: number}[]}
 */
export function strippedCode(full, lean) {
  const names = new Set([...lean.matchAll(EMPTIED)].map((m) => m[1]))
  const differences = []
  for (const name of names) {
    // A call with a string literal: `a("<p>…", 3)`, `a("", 3)`. Not `a()` in the HTML text.
    const call = new RegExp(`(?<![\\w$.])${escapeName(name)}\\([\`"']`, 'g')
    const counts = { full: full.match(call)?.length ?? 0, lean: lean.match(call)?.length ?? 0 }
    if (counts.full !== counts.lean) differences.push({ name, ...counts })
  }
  return differences
}
