<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  type: {
    type: String,
    required: false
  },
  columns: {
    type: String,
    required: false
  }
})

const columnCount = computed(() => Math.max(1, parseInt(props.columns ?? '', 10) || 1))
</script>

<template>
  <ol v-if="props.type">
    <slot/>
  </ol>

  <ul
      v-else-if="columns"
      class="ws-flex-list"
      :class="`ws-flex-list--${columnCount}`"
      :style="{'--ws-list-columns': columnCount}"
  >
    <slot/>
  </ul>

  <ul v-else>
    <slot/>
  </ul>
</template>

<style scoped>
/* As on kotlinlang.org: .list[data-columns] — items share the row equally, the first row has no top margin,
   and an item wider than its column (a long code block) wraps onto its own row, as there */
.ws-flex-list {
  display: flex;
  flex-flow: wrap;
  padding: 0;
  list-style: none;
}

.ws-flex-list > :deep(li) {
  box-sizing: border-box;
  flex: 0 0 calc(100% / var(--ws-list-columns));
  padding-right: 16px;
  margin-top: 24px;
}

.ws-flex-list--1 > :deep(li:nth-child(-n + 1)),
.ws-flex-list--2 > :deep(li:nth-child(-n + 2)),
.ws-flex-list--3 > :deep(li:nth-child(-n + 3)),
.ws-flex-list--4 > :deep(li:nth-child(-n + 4)) {
  margin-top: 0;
}

.ws-flex-list :deep(img) {
  height: revert-layer;
}
</style>
