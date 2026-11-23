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
// Markdown list of steps (P2-40). All of it was in one <ol>. A single step is
// in a bullet list there (P2-41).
const slots = useSlots()
const flatten = (nodes: VNode[]): VNode[] =>
  nodes.flatMap((node) => (node.type === Fragment && Array.isArray(node.children) ? flatten(node.children as VNode[]) : [node]))
// A comment or a space between two steps does not end the list
const blank = (node: VNode) => node.type === Comment || (node.type === Text && !String(node.children).trim())
/** A run of steps, with what is blank between them */
interface Steps {
  list: 'ol' | 'ul'
  nodes: VNode[]
}
/** The content, with each run of steps together */
function parts(): (VNode | Steps)[] {
  const result: (VNode | Steps)[] = []
  let count = 0
  for (const node of flatten(slots.default?.() ?? [])) {
    const last = result.at(-1)
    const steps = last && 'nodes' in last ? last : undefined
    if (node.type === Step || (blank(node) && steps)) {
      if (node.type === Step) count++
      if (steps) steps.nodes.push(node)
      else result.push({ list: 'ol', nodes: [node] })
    } else {
      result.push(node)
    }
  }
  if (count === 1) for (const part of result) if ('nodes' in part) part.list = 'ul'
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
      <component :is="part" v-if="!('nodes' in part)" />
      <ul v-else-if="part.list === 'ul'">
        <component :is="node" v-for="node in part.nodes" />
      </ul>
      <ol v-else>
        <component :is="node" v-for="node in part.nodes" />
      </ol>
    </template>
  </div>
</template>

<style scoped>
.header-anchor {
  top: 0;
}

.ws-procedure {
  /* A link to a procedure whose id is here shows its title below the nav bar, as for a heading (vp-doc.css) */
  scroll-margin-top: calc(var(--vp-nav-height) + var(--vp-layout-top-height, 0px) + 24px);
  box-sizing: border-box;
  /* Above and below, the 16px margins of the content, of the paragraphs in
     its first and last steps too, keep it off the border, as ktor.io's 16px padding does */
  padding: 0 16px;
  margin-bottom: 16px;
  border: 1px solid var(--vp-c-divider);
}

/* As on ktor.io: the title 16px below the border, 24px above what follows */
.ws-procedure > h3 {
  margin-top: 16px;
}

.ws-procedure > h3 + :deep(*) {
  margin-top: 24px;
}

.ws-procedure :deep(p) {
  padding: 0;
}
</style>
