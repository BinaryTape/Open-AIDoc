import kotlin from '../labels/kotlin.json'
import kmp from '../labels/kmp.json'
import ktor from '../labels/ktor.json'

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

/** A label of a doc type, or null when its labels.list has no such id. */
export function findLabel(kind: 'primary' | 'secondary', docType: string | null, ref: string): Label | null {
  return (docType && LABELS[docType]?.[kind]?.[ref]) || null
}

/** The colour class of a label (styles/ws-label.css): `ws-label--red`, `ws-label--default`. */
export function labelColorClass(label: Label | null): string {
  return `ws-label--${label?.color && /^[a-z]+$/.test(label.color) ? label.color : 'default'}`
}
