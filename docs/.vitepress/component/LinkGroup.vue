<script setup lang="ts">
import { useSlots, type VNode, ref, computed, Text } from 'vue'
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

const isTitle = (vnode: VNode) => typeof vnode.type === 'string' && vnode.type.toLowerCase() === 'title'
// Text between two links, such as the " / " of ktor/welcome's "Swagger UI / OpenAPI":
// ktor.io shows the links only, one under the other (P2-29).
const isSeparator = (vnode: VNode) => vnode.type === Text && /^[\s/|,·•-]*$/.test(String(vnode.children ?? ''))
// The slot as written (e.g. <Links> components), without the <title> shown above as the <h3>:
// a <title> element is not valid in the page body (P2-27).
const SlotWithoutTitle = () => slots.default?.().filter((vnode) => !isTitle(vnode) && !isSeparator(vnode))
// Three columns from 640px wide, set in CSS (see Card.vue).
</script>

<template>
  <div class="ws-link-group ws-col-12 ws-col-sm-4">
    <h3 v-if="hasTitleSlot">{{ titleContent }}</h3>
    <div class="ws-link-container">
      <template v-if="links.length > 0" v-for="(link, index) in links">
        <Link :href="link.href" :summary="link.summary">{{ link.content }}</Link>
      </template>
      <SlotWithoutTitle v-else/>
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
