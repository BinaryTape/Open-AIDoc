import fs from 'node:fs'
import path from 'node:path'

// Writerside variable files (docs/.vitepress/variables/) of each doc type,
// copied there by the docs pipeline
const VARIABLE_FILES: Record<string, string[]> = {
  kotlin: ['kotlin.v.list', 'serialization.v.list'],
  ktor: ['ktor.v.list'],
  kmp: ['kmp.v.list'],
}

/**
 * The Writerside variables (`<var name value/>`) of a doc type, by name. The
 * first file defining a variable wins: kotlin-web-site's own variables over
 * those of kotlinx.serialization, whose pages also go to kotlin/.
 */
export function writersideVariables(docType: string | undefined): Record<string, string> {
  const variables: Record<string, string> = Object.create(null)
  for (const file of VARIABLE_FILES[docType ?? ''] ?? []) {
    let source = ''
    try {
      const resolved = path.resolve('docs/.vitepress/variables', file)
      if (fs.existsSync(resolved)) source = fs.readFileSync(resolved, 'utf-8')
    } catch (error) {
      console.error(`Error reading XML variable file:`, error)
    }
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
