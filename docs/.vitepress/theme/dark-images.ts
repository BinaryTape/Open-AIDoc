import { onMounted, watch } from 'vue'
import { onContentUpdated, useData } from 'vitepress'

/**
 * In dark mode, show the dark version of each image that names one in
 * `data-dark-src` (markdown-it-ws-dark-image.ts), as ktor.io does (P2-43), and
 * the first one again in light mode. The src keeps the light file in the HTML,
 * so it is swapped only once the page is in the DOM, after hydration.
 */
export function showDarkImages(images: Iterable<HTMLImageElement>, dark: boolean) {
  for (const img of images) {
    img.dataset.lightSrc ??= img.getAttribute('src') ?? ''
    const src = dark ? img.dataset.darkSrc! : img.dataset.lightSrc
    if (img.getAttribute('src') !== src) img.setAttribute('src', src)
  }
}

export function useDarkImages() {
  const { isDark } = useData()
  const show = () => showDarkImages(document.querySelectorAll<HTMLImageElement>('img[data-dark-src]'), isDark.value)
  // Content runs the callbacks when a page is mounted or updated.
  onContentUpdated(show)
  onMounted(() => {
    show()
    watch(isDark, show)
  })
}
