import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'
import { decodeSampleRanges, withSampleMarkers } from '../utils/runnable-code'

/**
 * Turns the runnable Kotlin samples of a page (`div.ws-runnable`, from
 * markdown-it-ws-runnable.ts) into Kotlin Playground editors, as on
 * kotlinlang.org: run button, editable code, output, the code outside
 * `//sampleStart`…`//sampleEnd` folded.
 *
 * - Only in the browser and after hydration (the server HTML keeps the
 *   highlighted block), and only once a sample is about to scroll into view:
 *   a page can hold 30 of them, and the Playground script (~150 KB gzipped)
 *   is fetched on the first one.
 * - The highlighted block stays in the page, hidden, until the editor is up;
 *   if Playground fails to load, it is what the reader keeps.
 * - IntelliJ IDEA's light or Darcula theme follows the site's; switching
 *   rebuilds the editors (edits are lost).
 * - Code runs on JetBrains' public compiler service (api.kotlinlang.org),
 *   like on kotlinlang.org, when the reader presses Run.
 */
type Playground = (target: Element, options?: Record<string, unknown>) => Promise<unknown>

let playground: Promise<Playground> | undefined
let visible: IntersectionObserver | undefined

const loadPlayground = () => (playground ??= import('kotlin-playground').then((module: any) => module.default ?? module))

const isDark = () => document.documentElement.classList.contains('dark')

async function mount(sample: HTMLElement) {
  const block = sample.querySelector(':scope > div[class*="language-"]')
  const code = block?.querySelector('pre code')?.textContent
  if (code == null) return
  sample.dataset.wsPlayground = 'mounted'

  const target = document.createElement('code')
  target.textContent = withSampleMarkers(code.replace(/\n$/, ''), decodeSampleRanges(sample.dataset.sample))
  target.setAttribute('theme', isDark() ? 'darcula' : 'idea')
  target.setAttribute('data-crosslink', 'enabled')
  if (sample.dataset.minCompilerVersion) target.setAttribute('data-min-compiler-version', sample.dataset.minCompilerVersion)
  const editor = document.createElement('div')
  editor.className = 'ws-runnable__editor'
  editor.append(target)
  sample.append(editor)

  try {
    await (await loadPlayground())(target, { callback: () => sample.classList.add('is-mounted') })
  } catch (error) {
    console.error('Kotlin Playground:', error)
    editor.remove()
    sample.classList.remove('is-mounted')
  }
}

function unmount(sample: HTMLElement) {
  sample.querySelector(':scope > .ws-runnable__editor')?.remove()
  sample.classList.remove('is-mounted')
  delete sample.dataset.wsPlayground
}

/** Waits for each sample of the page that has no editor yet to come near the viewport. */
function watchSamples() {
  visible ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      visible!.unobserve(entry.target)
      mount(entry.target as HTMLElement)
    }
  }, { rootMargin: '200px 0px' })
  for (const sample of document.querySelectorAll<HTMLElement>('.vp-doc .ws-runnable:not([data-ws-playground])')) {
    sample.dataset.wsPlayground = 'waiting'
    visible.observe(sample)
  }
}

export function useKotlinPlayground() {
  const route = useRoute()
  onMounted(() => {
    watchSamples()
    // The new page's content is in the DOM by the time a post-flush watcher runs.
    watch(() => route.path, watchSamples, { flush: 'post' })

    let dark = isDark()
    new MutationObserver(() => {
      if (isDark() === dark) return
      dark = isDark()
      for (const sample of document.querySelectorAll<HTMLElement>('.vp-doc .ws-runnable[data-ws-playground="mounted"]')) {
        unmount(sample)
        mount(sample)
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
}
