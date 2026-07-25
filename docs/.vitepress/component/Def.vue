<script lang="ts">
import { defineComponent, h, inject, type Ref, type VNode } from 'vue'

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

    return () => {
      let titleChildren: VNode['children'] = ''
      const contentNodes = (slots.default?.() ?? []).filter((vnode: VNode) => {
        if (
          typeof vnode.type === 'string' &&
          vnode.type.toLowerCase() === 'title'
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

      return h('div', { class: 'ws-def', id: props.id }, [
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
}

.ws-def-title {
  float: left;
  width: calc(33.3% - 32px);
  font-weight: 700;
  font-size: 1em;
}

.ws-def-collapse-content {
  padding: 0 16px;
}

.ws-def-content {
  padding-left: 33.3%;
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
