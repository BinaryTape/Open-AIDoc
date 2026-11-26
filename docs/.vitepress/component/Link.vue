<script setup lang="ts">
// Spans only: the link sits inside paragraphs, where a <div> makes the browser
// split the paragraph and Vue hydration fail.
import { ref, useId } from 'vue'
import { tooltipPosition } from '../utils/tooltip'

const props = defineProps({
  href: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  }
})

/*
 * kotlinlang.org and ktor.io show the summary in a tooltip (tippy.js) while the
 * pointer is on the link or the keyboard has moved to it, and not on a touch
 * screen, where a tap follows the link (P2-54). It fades in, sliding 10px away
 * from the link, in 300ms, and out in 250ms; utils/tooltip.ts places it.
 *
 * Hidden, it is display: none. It used to be only transparent, at least 360px
 * wide, and made a page wider than a phone's screen (P2-53). The link names it
 * as its description, so that a screen reader still reads it.
 */
const id = useId()
const link = ref<HTMLElement>()
const tip = ref<HTMLElement>()
const open = ref(false)
let pointerY: number | undefined

function show(y?: number) {
  pointerY = y
  if (open.value) place()
  else open.value = true
}

function hide() {
  open.value = false
}

function onPointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'touch') show(event.clientY)
}

function onFocus(event: FocusEvent) {
  // Focus from the keyboard only: a tap focuses the link too.
  if ((event.target as HTMLElement).matches(':focus-visible')) show()
}

/** Puts the shown tooltip over the line of the link under the pointer (the first one from the keyboard). */
function place() {
  const t = tip.value, a = link.value
  if (!t || !a) return
  const lines = [...a.getClientRects()]
  const line = (pointerY !== undefined && lines.find((r) => pointerY! >= r.top && pointerY! <= r.bottom)) || lines[0]
  if (!line) return
  // The tooltip's box at left: 0, top: 0 of its containing block, before it slides in.
  t.style.left = t.style.top = '0px'
  t.style.transform = 'none'
  const origin = t.getBoundingClientRect()
  t.style.transform = ''
  const { x, y, below } = tooltipPosition(line, origin, document.documentElement.clientWidth)
  t.dataset.placement = below ? 'bottom' : 'top'
  t.style.left = `${x - origin.left}px`
  t.style.top = `${y - origin.top}px`
}
</script>

<template>
  <span class="ws-tooltip-wrapper">
    <a
      ref="link"
      :href="props.href"
      class="ws-link"
      :aria-describedby="props.summary ? id : undefined"
      @pointerenter="onPointerEnter"
      @pointerleave="hide"
      @focus="onFocus"
      @blur="hide"
      @click="hide"
    ><slot/></a>
    <!-- No tooltip, rather than an empty box, for a page with no text for one (as ktor.io) -->
    <Transition name="ws-tooltip" @enter="place">
      <span v-if="props.summary" v-show="open" :id="id" ref="tip" class="ws-tooltip" role="tooltip">
        {{ props.summary }}
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.ws-link {
  text-underline-offset: auto;
}

.ws-tooltip-wrapper {
  position: relative;
  display: inline-block;
  width: fit-content;
}

/* Measured on kotlinlang.org and ktor.io (.link__popover): at most 320px wide,
   24px padding, a 1px border, 16px text on 24px lines, left-aligned; dark on
   ktor.io's dark theme. */
.ws-tooltip {
  --ws-tooltip-bg: #fff;
  --ws-tooltip-text: #19191c;
  --ws-tooltip-border: rgba(25, 25, 28, 0.2);
  position: absolute;
  z-index: 9999;
  box-sizing: border-box;
  width: max-content;
  max-width: min(320px, calc(100vw - 10px));
  padding: 24px;
  border: 1px solid var(--ws-tooltip-border);
  background: var(--ws-tooltip-bg);
  color: var(--ws-tooltip-text);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: normal;
  text-align: left;
  white-space: normal;
  pointer-events: none;
}

.dark .ws-tooltip {
  --ws-tooltip-bg: #19191c;
  --ws-tooltip-text: rgba(255, 255, 255, 0.8);
}

.ws-tooltip-enter-active {
  transition: opacity 0.3s, transform 0.3s;
}

.ws-tooltip-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.ws-tooltip-enter-from,
.ws-tooltip-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.ws-tooltip-enter-from[data-placement="bottom"],
.ws-tooltip-leave-to[data-placement="bottom"] {
  transform: translateY(-10px);
}

.ws-link-container .ws-tooltip-wrapper {
  margin-bottom: 12px;
}
</style>
