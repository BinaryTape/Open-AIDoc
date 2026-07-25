<script lang="ts">
import { defineComponent, h, type VNode } from 'vue'

export default defineComponent({
  name: 'SectionStartingPage',
  setup(_, { slots }) {
    return () => {
      let titleContent = ''
      const contentNodes = (slots.default?.() ?? []).filter((vnode: VNode) => {
        if (typeof vnode.type !== 'string' || vnode.type.toLowerCase() !== 'title') {
          return true
        }

        titleContent = typeof vnode.children === 'string' ? vnode.children : ''
        return false
      })

      return h('div', { class: 'page' }, [
        titleContent ? h('h1', { class: 'page-title' }, titleContent) : null,
        ...contentNodes
      ])
    }
  }
})
</script>
