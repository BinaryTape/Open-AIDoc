// Writerside variables as text, for the server and the browser alike: no
// Node modules here (utils/writerside-variables.ts reads the files on the
// server, utils/writerside-labels.ts bundles them for the browser).

/**
 * The variable files (docs/.vitepress/variables/, copied there by the docs
 * pipeline) of each doc type, in order: the first file defining a variable
 * wins, kotlin-web-site's own variables over those of kotlinx.serialization,
 * whose pages also go to kotlin/.
 */
export const VARIABLE_FILES: Record<string, string[]> = {
  kotlin: ['kotlin.v.list', 'serialization.v.list'],
  ktor: ['ktor.v.list'],
  kmp: ['kmp.v.list'],
}

/** The `<var name value/>` definitions of variable files, by name; the first file defining a name wins. */
export function parseVariables(...sources: string[]): Record<string, string> {
  const variables: Record<string, string> = Object.create(null)
  for (const source of sources) {
    for (const m of source.matchAll(/<var\s+name="(?<name>[^"]+)"\s+value="(?<value>[^"]+)"[^>]*>/gi)) {
      if (!(m.groups!.name in variables)) variables[m.groups!.name] = m.groups!.value
    }
  }
  return variables
}

/** `%name%` replaced by the variable's value; a name without a variable is left as it is, as in the page text. */
export function substituteVariables(text: string, variables: Record<string, string>): string {
  return text.replace(/%([\w.-]+)%/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : whole)
}

/**
 * A label of labels.list with the variables filled in, as the page text: KMP's
 * EAP label is "Compose Multiplatform %org.jetbrains.compose-eap%", which
 * kotlinlang.org shows as "Compose Multiplatform 1.13.0-beta02" (P2-34).
 */
export function labelWithVariables<T extends { name: string, description?: string }>(label: T, variables: Record<string, string>): T {
  return {
    ...label,
    name: substituteVariables(label.name, variables),
    ...(label.description === undefined ? {} : { description: substituteVariables(label.description, variables) }),
  }
}
