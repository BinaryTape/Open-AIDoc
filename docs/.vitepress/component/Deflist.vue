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
  }
})

const isExpanded = ref(props.collapsible != null)
provide('isExpanded', isExpanded)
provide('deflistType', props.type)

</script>

<template>
  <div class="ws-deflist">
    <slot/>
  </div>
</template>

<style scoped>
.ws-deflist {
  margin: 24px 0;
}
</style>