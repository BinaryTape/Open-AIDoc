<script setup lang="ts">
import { Comment, Fragment, Text, useSlots, type VNode } from 'vue'
import Step from './Step.vue'

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

// ktor.io lists the <step>s of a procedure and leaves the rest as it is: a
// paragraph before the steps, an image after them, a procedure written as a
// Markdown list of steps (P2-40). All of it was in one <ol>.
const slots = useSlots()
const flatten = (nodes: VNode[]): VNode[] =>
  nodes.flatMap((node) => (node.type === Fragment && Array.isArray(node.children) ? flatten(node.children as VNode[]) : [node]))
// A comment or a space between two steps does not end the list
const blank = (node: VNode) => node.type === Comment || (node.type === Text && !String(node.children).trim())
/** The content, with each run of steps in an array */
function parts(): (VNode | VNode[])[] {
  const result: (VNode | VNode[])[] = []
  for (const node of flatten(slots.default?.() ?? [])) {
    const steps = result.at(-1)
    if (node.type === Step || (blank(node) && Array.isArray(steps))) {
      if (Array.isArray(steps)) steps.push(node)
      else result.push([node])
    } else {
      result.push(node)
    }
  }
  return result
}
</script>

<template>
  <div class="ws-procedure" :id="props.title && props.inToc ? undefined : props.id">
    <h3 v-if="props.title" :id="props.inToc ? props.id : undefined">
      {{ props.title }}
      <a v-if="props.id" class="header-anchor" :href="`#${props.id}`"></a>
    </h3>
    <template v-for="part in parts()">
      <ol v-if="Array.isArray(part)">
        <component :is="step" v-for="step in part" />
      </ol>
      <component :is="part" v-else />
    </template>
  </div>
</template>

<style scoped>
.header-anchor {
  top: 0;
}

/* As on ktor.io: 16px inside the border all round, the title at the top,
   24px between the title and what follows */
.ws-procedure {
  /* A link to a procedure whose id is here shows its title below the nav bar, as for a heading (vp-doc.css) */
  scroll-margin-top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 24px);
  box-sizing: border-box;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid var(--vp-c-divider);
}

.ws-procedure > :deep(:first-child) {
  margin-top: 0;
}

.ws-procedure > :deep(:last-child) {
  margin-bottom: 0;
}

.ws-procedure > h3 + :deep(*) {
  margin-top: 24px;
}

.ws-procedure :deep(p) {
  padding: 0;
}
</style>
