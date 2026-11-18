import kotlin from '../labels/kotlin.json'
import kmp from '../labels/kmp.json'
import ktor from '../labels/ktor.json'
// The variable files of each doc type, bundled for the browser (variable-text.ts VARIABLE_FILES)
import kotlinVariables from '../variables/kotlin.v.list?raw'
import serializationVariables from '../variables/serialization.v.list?raw'
import ktorVariables from '../variables/ktor.v.list?raw'
import kmpVariables from '../variables/kmp.v.list?raw'
import { labelWithVariables, parseVariables } from './variable-text'

/**
 * The labels of the Writerside docs, copied out of each repository's
 * labels.list by the docs pipeline on every sync
 * (tools/pipeline/utils/writerside-labels.mjs). Pages refer to them by id:
 * `<primary-label ref="alpha"/>`, `<secondary-label ref="maven"/>`.
 */
export interface Label {
  name: string
  color?: string
  description?: string
}

interface Labels {
  primary: Record<string, Label>
  secondary: Record<string, Label>
}

const LABELS: Record<string, Labels> = { kotlin, kmp, ktor }

/** The variables of each doc type, which a label's name can hold (labelWithVariables). */
export const LABEL_VARIABLES: Record<string, Record<string, string>> = {
  kotlin: parseVariables(kotlinVariables, serializationVariables),
  kmp: parseVariables(kmpVariables),
  ktor: parseVariables(ktorVariables),
}

/**
 * The doc type of a page that has labels, from its path (`ja/kmp/x.md` → `kmp`).
 * For the client: utils/doctype-utils.ts reaches docs.config.ts, which pulls in Node modules.
 */
export function labelsDocType(relativePath: string): string | null {
  return relativePath.split('/').find((p) => p in LABELS) ?? null
}

/** A label of a doc type, or null when its labels.list has no such id. */
export function findLabel(kind: 'primary' | 'secondary', docType: string | null, ref: string): Label | null {
  const label = docType && LABELS[docType]?.[kind]?.[ref]
  return label ? labelWithVariables(label, LABEL_VARIABLES[docType] ?? {}) : null
}

/** The colour class of a label (styles/ws-label.css): `ws-label--red`, `ws-label--default`. */
export function labelColorClass(label: Label | null): string {
  return `ws-label--${label?.color && /^[a-z]+$/.test(label.color) ? label.color : 'default'}`
}
