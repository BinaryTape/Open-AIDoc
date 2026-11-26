<script setup lang="ts">
/**
 * A GIF as kotlinlang.org and ktor.io show one (P2-46): still, with a "Gif"
 * button over it, playing once clicked and still again on the next click.
 * markdown-it-ws-gif turns the GIFs of a Writerside page into this.
 *
 * The still is `preview`, else the GIF's first frame, drawn in the browser as
 * those sites do: until then a blank image keeps the GIF's place. In dark mode
 * the GIF is `darkSrc`, when there is one; the page is rendered light, so that
 * waits until the player is mounted.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  src: string
  preview?: string
  darkSrc?: string
  alt?: string
  width?: string
  naturalWidth?: string
  naturalHeight?: string
  site?: string
  rounded?: boolean
}>()

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const playing = ref(false)
const dark = ref(false)
const frames = ref<Record<string, string>>({})

const gif = computed(() => (dark.value && props.darkSrc) || props.src)
const still = computed(() => (gif.value === props.src && props.preview) || frames.value[gif.value])
const shown = computed(() => (playing.value ? gif.value : still.value ?? BLANK))
const ratio = computed(() => (props.naturalWidth && props.naturalHeight ? `aspect-ratio:${props.naturalWidth} / ${props.naturalHeight};` : undefined))

/** The first frame of a GIF, as a PNG: what an image not yet shown draws. */
function drawFirstFrame(url: string) {
  if (frames.value[url] || (url === props.src && props.preview)) return
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    frames.value = { ...frames.value, [url]: canvas.toDataURL('image/png') }
  }
  image.src = url
}

const root = ref<HTMLElement>()
let classes: MutationObserver | undefined
let near: IntersectionObserver | undefined
let seen = false

onMounted(() => {
  const html = document.documentElement
  dark.value = html.classList.contains('dark')
  classes = new MutationObserver(() => (dark.value = html.classList.contains('dark')))
  classes.observe(html, { attributes: true, attributeFilter: ['class'] })
  // A GIF can be large: it is loaded for its first frame only near the screen.
  near = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    seen = true
    drawFirstFrame(gif.value)
    near?.disconnect()
  }, { rootMargin: '400px' })
  if (root.value) near.observe(root.value)
})

watch(gif, (url) => seen && drawFirstFrame(url))

onBeforeUnmount(() => {
  classes?.disconnect()
  near?.disconnect()
})
</script>

<template>
  <button
    ref="root"
    type="button"
    class="ws-gif"
    :class="{ 'ws-gif--rounded': rounded, 'ws-gif--playing': playing }"
    :data-site="site"
    :aria-pressed="playing"
    @click="playing = !playing"
  >
    <img class="ws-gif__image" :src="shown" :alt="alt" :width="width ?? naturalWidth" :style="ratio">
    <span v-if="!playing" class="ws-gif__badge" aria-hidden="true"><span>Gif</span></span>
  </button>
</template>

<style>
/* Measured on kotlinlang.org and ktor.io (.gif-player): a 1px border, 9px
   round with border-effect="rounded"; a 50px "Gif" disc in the site's purple,
   80% opaque under the pointer, with black text in dark mode. */
.ws-gif {
  --ws-gif-primary: #7f52ff;
  --ws-gif-primary-dim: rgba(127, 82, 255, 0.8);
  --ws-gif-text: #fff;
  --ws-gif-border: #d1d1d2;
  position: relative;
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 16px 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.ws-gif[data-site="ktor"] {
  --ws-gif-primary: #6c46bc;
  --ws-gif-primary-dim: rgba(108, 70, 188, 0.8);
}

.dark .ws-gif {
  --ws-gif-text: #19191c;
  --ws-gif-border: #474749;
}

.vp-doc .ws-gif__image {
  display: block;
  margin: 0;
  border: 1px solid var(--ws-gif-border);
  background-clip: padding-box;
}

.ws-gif--rounded .ws-gif__image {
  border-radius: 9px;
}

.ws-gif__badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ws-gif__badge > span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  color: var(--ws-gif-text);
  background-color: var(--ws-gif-primary);
  font-size: 16px;
  line-height: 1;
  transition: background-color 0.1s;
}

.ws-gif:hover .ws-gif__badge > span {
  background-color: var(--ws-gif-primary-dim);
}

.ws-gif:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
</style>
