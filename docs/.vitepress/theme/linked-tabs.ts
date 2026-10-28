import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { STORAGE_KEY, choose, emptyChoices, parseChoices, preferredTab, type TabChoices } from '../utils/linked-tabs'

/**
 * Links the page's tab sets and remembers the reader's choice across the
 * site, as kotlinlang.org, ktor.io and the Material sites (Koog, SQLDelight)
 * do; the rules are in utils/linked-tabs.ts.
 *
 * Two kinds of sets share the `.ws-tabs-container` markup:
 * - Tabs.vue (Writerside): `data-group` on the set, `data-key` on each label.
 *   Choosing goes through a click on the label, so the component's own state
 *   follows. Only sets with a group link.
 * - `.ws-tabs-static` (MkDocs, markdown-it-mk-code-tabs.ts): plain radio
 *   inputs switched by CSS; choosing checks the input. They link by title.
 *
 * When sets above the clicked one change height, the page is scrolled back so
 * the clicked tab stays where it was.
 */
const SETS = '.vp-doc .ws-tabs-container:is([data-group], .ws-tabs-static)'

let choices: TabChoices = emptyChoices()
let applying = false

function load() {
  try {
    choices = parseChoices(localStorage.getItem(STORAGE_KEY))
  } catch {
    choices = emptyChoices()
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices))
  } catch {}
}

const labelsOf = (set: Element) => [...set.querySelectorAll<HTMLLabelElement>(':scope > .ws-tablist > label')]
const optionOf = (label: HTMLLabelElement) => ({ key: label.dataset.key, title: label.dataset.title })

function select(label: HTMLLabelElement) {
  const input = document.getElementById(label.htmlFor) as HTMLInputElement | null
  if (!input || input.checked) return
  if (label.closest('.ws-tabs-static')) input.checked = true
  else label.click()
}

function withoutLinking(run: () => void) {
  applying = true
  try {
    run()
  } finally {
    applying = false
  }
}

/** Every linked set of the page shows the tab the remembered choices prefer. */
function applyAll() {
  withoutLinking(() => {
    for (const set of document.querySelectorAll(SETS)) {
      const labels = labelsOf(set)
      const index = preferredTab(choices, labels.map(optionOf))
      if (index >= 0) select(labels[index])
    }
  })
}

/** The page's other sets that link with the clicked one show the same tab. */
function applyLike(clicked: HTMLLabelElement, set: HTMLElement) {
  const group = set.dataset.group, key = clicked.dataset.key, title = clicked.dataset.title
  const linked = set.classList.contains('ws-tabs-static')
    ? document.querySelectorAll('.vp-doc .ws-tabs-static')
    : document.querySelectorAll(`.vp-doc .ws-tabs-container[data-group="${CSS.escape(group!)}"]`)
  withoutLinking(() => {
    for (const other of linked) {
      const label = labelsOf(other).find((l) => (set.classList.contains('ws-tabs-static') ? l.dataset.title === title : l.dataset.key === key))
      if (label) select(label)
    }
  })
}

function onClick(event: MouseEvent) {
  if (applying) return
  const label = (event.target as Element | null)?.closest?.<HTMLLabelElement>('.vp-doc .ws-tabs-container > .ws-tablist > label')
  const set = label?.closest<HTMLElement>(SETS)
  if (!label || !set) return
  choices = choose(choices, optionOf(label))
  save()

  const top = label.getBoundingClientRect().top
  // After the clicked set has switched (Vue re-renders on the next tick).
  requestAnimationFrame(() => {
    applyLike(label, set)
    requestAnimationFrame(() => window.scrollBy(0, label.getBoundingClientRect().top - top))
  })
}

export function useLinkedTabs() {
  const route = useRoute()
  onMounted(() => {
    load()
    applyAll()
    document.addEventListener('click', onClick)
    // Another browser tab of the site may have changed the choice.
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        load()
        applyAll()
      }
    })
    watch(() => route.path, () => applyAll(), { flush: 'post' })
  })
}
