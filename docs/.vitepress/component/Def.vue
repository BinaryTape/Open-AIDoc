<script lang="ts">
import { defineComponent, h, inject, type Ref, type VNode } from 'vue'

// <deflist type>: these put the title on the left at the given width; any other type
// (none, "full") puts it on top, as kotlinlang.org's .definition-list--type-title-top does
const TITLE_LEFT_WIDTHS = ['wide', 'medium', 'narrow', 'compressed']

export default defineComponent({
  name: 'WritersideDefinition',
  props: {
    title: {
      type: String,
      required: false
    },
    id: {
      type: String,
      required: false
    }
  },
  setup(props, { slots }) {
    const isExpanded = inject('isExpanded') as Ref<boolean>
    const type = inject<string | undefined>('deflistType', undefined)
    const layout = type && TITLE_LEFT_WIDTHS.includes(type)
      ? ['ws-def--title-left', `ws-def--width-${type}`]
      : 'ws-def--title-top'

    return () => {
      let titleChildren: VNode['children'] = ''
      const contentNodes = (slots.default?.() ?? []).filter((vnode: VNode) => {
        // <def-title>: the page's <title>, renamed by markdown-it-ws-rename.ts
        // so that the markup in it is parsed.
        if (
          typeof vnode.type === 'string' &&
          ['title', 'def-title'].includes(vnode.type.toLowerCase())
        ) {
          titleChildren = vnode.children
          return false
        }
        return true
      })
      const renderedTitle = props.title || titleChildren

      if (isExpanded.value) {
        return h('div', { id: props.id }, [
          h('details', { class: 'details custom-block' }, [
            h('summary', renderedTitle),
            h('div', { class: 'ws-def-collapse-content' }, contentNodes)
          ])
        ])
      }

      return h('div', { class: ['ws-def', layout], id: props.id }, [
        h('dt', { class: 'ws-def-title' }, renderedTitle),
        h('dd', { class: 'ws-def-content' }, contentNodes)
      ])
    }
  }
})
</script>

<style scoped>
.ws-def {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  border-color: var(--vp-custom-block-details-border);
  color: var(--vp-custom-block-details-text);
  background-color: var(--vp-custom-block-details-bg);
  /* Holds the floated title when it is taller than the definition. */
  display: flow-root;
}

.ws-def-title {
  font-weight: 530;
  font-size: 1em;
  /* Long code names have no break opportunity and ran over the definition. */
  overflow-wrap: anywhere;
}

/* Drops the browser's 40px dd indent: the description lines up with the title, or starts at the column */
.ws-def-content {
  margin: 0;
}

.ws-def--title-top .ws-def-content {
  margin-top: 12px;
}

/* kotlinlang.org's .definition-list__title--width-* and .definition-list__description--width-* */
@media (min-width: 641px) {
  .ws-def--title-left .ws-def-title {
    float: left;
  }

  .ws-def--width-wide .ws-def-title { width: calc(50% - 32px); }
  .ws-def--width-medium .ws-def-title { width: calc(33.3% - 32px); }
  .ws-def--width-narrow .ws-def-title { width: calc(22.2% - 32px); }
  .ws-def--width-compressed .ws-def-title { width: calc(11.1% - 32px); }

  .ws-def--width-wide .ws-def-content { padding-left: 50%; }
  .ws-def--width-medium .ws-def-content { padding-left: 33.3%; }
  .ws-def--width-narrow .ws-def-content { padding-left: 22.2%; }
  .ws-def--width-compressed .ws-def-content { padding-left: 11.1%; }
}

/* Narrow screens stack the title on top, as there */
@media (max-width: 640px) {
  .ws-def--title-left .ws-def-content {
    margin-top: 12px;
  }
}

.ws-def-collapse-content {
  padding: 0 16px;
}

.ws-def-content > *:first-child {
  margin: 0;
}

.ws-def-content > *:not(:first-child) {
  margin: 12px 0 0 !important;
}

.ws-def-collapse-content :deep(i) {
  font-style: normal;
  font-weight: bold;
}
</style>
