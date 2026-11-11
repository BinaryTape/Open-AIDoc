<script setup lang="ts">

import { provide, ref } from 'vue'
const props = defineProps({
  collapsible: {
    type: String,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  // "clear": Writerside's borderless collapsible rows with a chevron (the Kotlin tour exercises)
  appearance: {
    type: String,
    required: false
  },
  // Numbers the "clear" rows 1., 2., ... as kotlinlang.org does
  numbered: {
    type: String,
    required: false
  }
})

const isExpanded = ref(props.collapsible != null)
provide('isExpanded', isExpanded)
provide('deflistType', props.type)
provide('deflistAppearance', props.appearance)

</script>

<template>
  <div
    class="ws-deflist"
    :class="{ 'ws-deflist--numbered': numbered === 'true' }"
  >
    <slot/>
  </div>
</template>

<style scoped>
.ws-deflist {
  margin: 24px 0;
}

.ws-deflist--numbered {
  counter-reset: ws-deflist-item;
}
</style>
