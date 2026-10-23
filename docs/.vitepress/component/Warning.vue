<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { calloutClass, calloutLabel } from '../utils/ws-callout'

// Writerside `<warning>` tag; renders like a `{style="warning"}` blockquote.
const { page } = useData()
const path = computed(() => page.value.relativePath)
</script>

<template>
  <div :class="calloutClass('warning', path)" role="note" :aria-label="calloutLabel('warning', path)">
    <slot/>
  </div>
</template>
