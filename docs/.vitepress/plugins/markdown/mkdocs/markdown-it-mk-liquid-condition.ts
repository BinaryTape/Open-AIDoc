// Process the Jinja conditions of MkDocs pages (mkdocs-macros), as SQLDelight writes them:
//
//   {% if async %}await{% else %}execute{% endif %}AsList()
//
// The variables are the front matter of the page being built: an included
// file is evaluated with the variables of the page that includes it (async,
// dialect, server, multiplatform in SQLDelight). A variable the page does not
// set is false, as in Jinja.

type Vars = Record<string, unknown>

const TAG_RE = /\{%-?\s*(if|elif|else|endif)\b\s*(.*?)\s*-?%\}/g
const CONDITION_RE = /^(not\s+)?([A-Za-z_]\w*)$/
const VARIABLE_RE = /\{\{\s*([A-Za-z_]\w*)\s*\}\}/g

// What the plugin did before conditions were evaluated: drop every block
const DROP_ALL_RE = /{%\s*if\s+.*?%}[\s\S]*?{%\s*endif\s*%}/g

const truthy = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== null && typeof value === 'object' ? Object.keys(value).length > 0 : Boolean(value)

/**
 * Keep the branches whose condition holds for these variables, and fill in
 * `{{ name }}` from them (`{{ versions.x }}` is left to markdown-it-mk-vars).
 * Supports `if name`, `if not name`, `else` and `endif`, nested or not.
 * A page without `{%` is left as it is: `{{ }}` there is Vue's.
 * @returns `unsupported`: a condition or tag outside that, in which case every
 *   `{% if %}` block is dropped, as before conditions were evaluated
 */
export function evaluateLiquidConditions(src: string, vars: Vars = {}): { text: string; unsupported: string | null } {
  if (!src.includes('{%')) return { text: src, unsupported: null }

  const stack: { holds: boolean; active: boolean }[] = []
  const emitting = () => stack.every((frame) => frame.active)
  let out = ''
  let pos = 0
  let unsupported: string | null = null

  for (const match of src.matchAll(TAG_RE)) {
    const [tag, name, expression] = match
    if (emitting()) out += src.slice(pos, match.index)
    pos = match.index! + tag.length

    if (name === 'if') {
      const condition = CONDITION_RE.exec(expression)
      if (!condition) {
        unsupported = tag
        break
      }
      const holds = truthy(vars[condition[2]]) !== Boolean(condition[1])
      stack.push({ holds, active: holds })
    } else if (name === 'else' && stack.length > 0 && !expression) {
      const frame = stack.at(-1)!
      frame.active = !frame.holds
    } else if (name === 'endif' && stack.length > 0 && !expression) {
      stack.pop()
    } else {
      unsupported = tag
      break
    }
  }
  if (!unsupported && stack.length > 0) unsupported = '{% if %} without {% endif %}'

  if (unsupported) return { text: src.replace(DROP_ALL_RE, ''), unsupported }
  return { text: fillVariables(out + src.slice(pos), vars), unsupported: null }
}

function fillVariables(src: string, vars: Vars) {
  return src.replace(VARIABLE_RE, (match, name) =>
    Object.hasOwn(vars, name) && vars[name] != null && typeof vars[name] !== 'object' ? String(vars[name]) : match
  )
}

export default function markdownItMkLiquidCondition(md) {
  // Registered in preConfig, so this runs inside VitePress's front matter
  // parsing: env.frontmatter is set and the source no longer holds it.
  const originalParse = md.parse
  md.parse = function (src, env) {
    const { text, unsupported } = evaluateLiquidConditions(src, env?.frontmatter ?? {})
    if (unsupported) {
      console.warn(`[liquid-condition] ${env?.relativePath ?? 'page'}: unsupported ${unsupported}, every {% if %} block dropped`)
    }
    return originalParse.call(this, text, env)
  }
}
