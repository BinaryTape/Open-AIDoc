<script setup lang="ts">
// Spans only: the link sits inside paragraphs, where a <div> makes the browser
// split the paragraph and Vue hydration fail.
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
</script>

<template>
  <span class="ws-tooltip-wrapper">
    <a :href="props.href" class="ws-link"><slot/></a>
    <span class="ws-tooltip">
      {{ props.summary }}
    </span>
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

.ws-tooltip {
  display: block;
  position: absolute;
  bottom: 100%;
  left: 25%;
  transform: translateX(-25%);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 12px;
  font-size: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  margin-bottom: 6px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 9999;
  min-width: 360px;
  text-align: center;
}

.ws-link-container .ws-tooltip-wrapper {
  margin-bottom: 12px;
}

.ws-tooltip-wrapper:hover .ws-tooltip {
  opacity: 1;
  pointer-events: auto;
}
</style>