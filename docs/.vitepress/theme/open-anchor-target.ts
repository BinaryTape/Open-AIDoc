import { onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

/**
 * Opens the collapsed <details> around the target of a link (`#id`), so the
 * reader lands on what the link points at instead of a closed section:
 * collapsible sections (markdown-it-ws-collapsible-section.ts) and
 * collapsible code blocks (markdown-it-ws-collapsible-code.ts).
 *
 * - Same page: VitePress fires `hashchange` and scrolls on the next frame, so
 *   opening on `hashchange` is enough.
 * - A page opened with a hash, or reached by a link from another page: the
 *   sections are opened once the page is in the DOM, then the target is
 *   scrolled to again, as the first scroll went to where it was hidden.
 */
function openTarget(hash: string, scroll: boolean) {
  if (!hash) return
  let target: HTMLElement | null = null
  try {
    target = document.getElementById(decodeURIComponent(hash).slice(1))
  } catch {
    return
  }
  const outer = target?.closest('details')
  if (!outer) return
  for (let details: HTMLDetailsElement | null | undefined = outer as HTMLDetailsElement; details; details = details.parentElement?.closest('details')) {
    details.open = true
  }
  if (scroll) target!.scrollIntoView({ block: 'start' })
}

// After VitePress's own scroll to the hash, which comes on the next frame.
const afterScroll = (run: () => void) => requestAnimationFrame(() => requestAnimationFrame(run))

export function useOpenAnchorTarget() {
  const route = useRoute()
  onMounted(() => {
    afterScroll(() => openTarget(location.hash, true))
    window.addEventListener('hashchange', () => openTarget(location.hash, false))
    watch(() => route.path, () => afterScroll(() => openTarget(location.hash, true)), { flush: 'post' })
  })
}
