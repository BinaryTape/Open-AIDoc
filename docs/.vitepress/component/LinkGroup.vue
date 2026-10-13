<script setup lang="ts">
import { useSlots, type VNode, ref, computed } from 'vue'
import Link from "./Link.vue";

export interface SectionLink {
  summary?: string
  content?: string
  href?: string
}

const slots = useSlots()

const titleContent = ref('')

const links = ref<SectionLink[]>([])

slots.default?.().forEach((vnode: VNode) => {
  const props = (vnode.props ?? {}) as Record<string, any>
  const children = vnode.children

  if (typeof vnode.type === 'string' && vnode.type.toLowerCase() === 'title') {
    titleContent.value =
        typeof children === 'string' ? children : ''
  }

  if (typeof vnode.type === 'string' && vnode.type.toLowerCase() === 'a') {
    links.value.push({
      href: props.href,
      summary: props.summary ?? '',
      content:
          typeof children === 'string'
              ? children
              : Array.isArray(children)
                  ? children.map(c => typeof c === 'string' ? c : '').join('')
                  : ''
    })
  }
})

// 判断插槽里是否有 title
const hasTitleSlot = computed(() => !!titleContent.value)
// Three columns from 640px wide, set in CSS (see Card.vue).
</script>

<template>
  <div class="ws-link-group ws-col-12 ws-col-sm-4">
    <h3 v-if="hasTitleSlot">{{ titleContent }}</h3>
    <div class="ws-link-container">
      <template v-if="links.length > 0" v-for="(link, index) in links">
        <Link :href="link.href" :summary="link.summary">{{ link.content }}</Link>
      </template>
      <slot v-else/>
    </div>
  </div>
</template>

<style scoped>
@media (max-width: 639.98px) {
  .ws-link-group {
    --ws-horizontal-layout-gutter: 0;
    min-width: 100%;
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}

.ws-link-container {
  display: flex;
  flex-direction: column;
  margin: 24px 0;
}

h3 {
  margin: 0;
}
</style>
