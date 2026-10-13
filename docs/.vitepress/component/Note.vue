<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { calloutClass, calloutLabel } from '../utils/ws-callout'

// Writerside `<note>` tag; renders like a `{style="note"}` blockquote.
const { page } = useData()
const path = computed(() => page.value.relativePath)
</script>

<template>
  <div :class="calloutClass('note', path)" role="note" :aria-label="calloutLabel('note', path)">
    <slot/>
  </div>
</template>
