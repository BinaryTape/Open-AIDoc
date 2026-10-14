<script setup lang="ts">
import { inject, provide } from 'vue'

const props = defineProps({
  title : {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
})

// Heading level follows nesting, as on the upstream sites: the topic title is
// the page's only h1, a top-level chapter is h2, a chapter inside it h3, …
const LEVEL_KEY = 'ws-chapter-level'
const level = Math.min(inject<number>(LEVEL_KEY, 1) + 1, 6)
provide(LEVEL_KEY, level)

</script>

<template>
  <div class="ws-chapter">
    <component :is="`h${level}`" :id="props.id">
      {{ props.title }}
      <a class="header-anchor" :href="`#${props.id}`"></a>
    </component>
    <slot/>
  </div>
</template>

<style scoped>
.header-anchor {
  top: 0;
}
</style>