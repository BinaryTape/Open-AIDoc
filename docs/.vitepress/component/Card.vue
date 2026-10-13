<script setup lang="ts">
// Two columns from 640px wide, set in CSS: a class computed from the window
// width differs between server and browser and breaks hydration.
const props = defineProps<{
  href: string
  summary: string
  badge?: string
}>()
</script>

<template>
  <div class="ws-card ws-col-12 ws-col-sm-6">
    <a :href="props.href" class="ws-card-link">
      <h3><slot/></h3>
      <p>{{ props.summary }}</p>
    </a>
  </div>
</template>

<style scoped>
@media (max-width: 639.98px) {
  .ws-card {
    --ws-horizontal-layout-gutter: 0;
    min-width: 100%;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

.ws-card {
  padding: 24px;
  margin-bottom: 32px;
  overflow: hidden;
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  border-color: var(--vp-c-divider);
  transition: color .1s, background-color .1s, border-color .1s;
}

.ws-card:hover {
  border-color: var(--vp-c-text-2);
}

.ws-card-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.ws-card-link :deep(h3) {
  margin: 0;
}

.ws-card-link :deep(p) {
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
  font-size: 16px;
}

.ws-card-link:hover {
  color: var(--vp-c-text-1);
}
</style>
