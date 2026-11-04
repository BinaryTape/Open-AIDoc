<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'

// VitePress's VPDocOutlineItem (config.mts aliases it here), with the primary
// label of a heading before its title, as in the outline on kotlinlang.org.
// TopicTitle.vue leaves the label on the heading element the outline is read from.
type Header = DefaultTheme.OutlineItem & { element?: HTMLElement }

defineProps<{
  headers: Header[]
  root?: boolean
}>()
</script>

<template>
  <ul class="VPDocOutlineItem" :class="root ? 'root' : 'nested'">
    <li v-for="{ children, link, title, element } in headers">
      <a class="outline-link" :href="link" :title>
        <span
          v-if="element?.dataset.wsLabel"
          class="ws-outline-label"
          :class="element.dataset.wsLabelClass"
          :title="element.dataset.wsLabelDescription"
        >{{ element.dataset.wsLabel }}</span>{{ title }}
      </a>
      <template v-if="children?.length">
        <OutlineItem :headers="children" />
      </template>
    </li>
  </ul>
</template>

<style scoped>
.root {
  position: relative;
  z-index: 1;
}

.nested {
  padding-right: 16px;
  padding-left: 16px;
}

.outline-link {
  display: block;
  line-height: 32px;
  font-size: 14px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.5s;
}

.outline-link:hover,
.outline-link.active {
  color: var(--vp-c-text-1);
  transition: color 0.25s;
}

.outline-link.nested {
  padding-left: 13px;
}
</style>
