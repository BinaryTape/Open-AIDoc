<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { calloutClass, calloutLabel } from '../utils/ws-callout'

// Writerside `<tip>` tag; renders like a `{style="tip"}` blockquote.
const { page } = useData()
const path = computed(() => page.value.relativePath)
</script>

<template>
  <div :class="calloutClass('tip', path)" role="note" :aria-label="calloutLabel('tip', path)">
    <slot/>
  </div>
</template>
