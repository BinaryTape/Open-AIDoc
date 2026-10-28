/**
 * Linked tabs (theme/linked-tabs.ts): choosing a tab chooses the same tab in
 * the page's other tab sets, and the choice is remembered across the site.
 *
 * - Writerside sets (Kotlin, KMP, Ktor) link within a `group`, by `group-key`
 *   (`<tabs group="build-script">`, `<tab group-key="groovy">`). Sets without
 *   a group do not link, as on kotlinlang.org.
 * - MkDocs sets (Koog, SQLDelight) link by the tab's title, as Material's
 *   `content.tabs.link` does.
 *
 * The choice is kept for the whole site (the user chose that over one record
 * per upstream site) as one list of choices, the most recent first, each a
 * lower-cased key or title. A set shows the tab that matches the earliest
 * entry of the list, by key or by title, so choosing Groovy in the Kotlin docs
 * also picks Groovy in SQLDelight's and the other way round.
 */
export interface TabChoices {
  recent: string[]
}

/** A tab as the linking sees it: its key (Writerside) and its title. */
export interface TabOption {
  key?: string
  title?: string
}

export const STORAGE_KEY = 'openaidoc.tabs'
const MAX_CHOICES = 20

const norm = (value: string | undefined) => value?.trim().toLowerCase() || undefined

export function emptyChoices(): TabChoices {
  return { recent: [] }
}

export function parseChoices(value: string | null): TabChoices {
  try {
    const parsed = JSON.parse(value ?? '')
    return { recent: Array.isArray(parsed?.recent) ? parsed.recent.filter((t: unknown) => typeof t === 'string') : [] }
  } catch {
    return emptyChoices()
  }
}

/** The tab's key and title go first; older choices follow, without repeats. */
export function choose(choices: TabChoices, tab: TabOption): TabChoices {
  const first = [...new Set([norm(tab.key), norm(tab.title)].filter((v): v is string => !!v))]
  return { recent: [...first, ...choices.recent.filter((c) => !first.includes(c))].slice(0, MAX_CHOICES) }
}

/** Which of a set's tabs to show, or -1 to leave the set as it is. */
export function preferredTab(choices: TabChoices, tabs: TabOption[]): number {
  for (const choice of choices.recent) {
    const index = tabs.findIndex((tab) => norm(tab.key) === choice || norm(tab.title) === choice)
    if (index >= 0) return index
  }
  return -1
}
