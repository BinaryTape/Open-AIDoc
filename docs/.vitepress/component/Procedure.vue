<script setup lang="ts">
// A procedure's title is an h3 on ktor.io, whatever the section it is in
// (P2-37). It is in the outline when the page's <show-structure for> names
// "procedure" (`in-toc`, markdown-it-ws-show-structure.ts): the outline takes
// headings with an id, so the id goes on the title then, on the procedure
// otherwise, where links to it still go.
const props = defineProps<{
  title?: string
  id?: string
  inToc?: boolean
}>()
</script>

<template>
  <div class="ws-procedure" :id="props.title && props.inToc ? undefined : props.id">
    <h3 v-if="props.title" :id="props.inToc ? props.id : undefined">
      {{ props.title }}
      <a v-if="props.id" class="header-anchor" :href="`#${props.id}`"></a>
    </h3>
    <ol>
      <slot/>
    </ol>
  </div>
</template>

<style scoped>
.header-anchor {
  top: 0;
}

.ws-procedure {
  box-sizing: border-box;
  padding: 0 16px;
  margin-bottom: 16px;
  border: 1px solid var(--vp-c-divider);
}

.ws-procedure :deep(p) {
  padding: 0;
}
</style>