<script lang="ts">
import { defineComponent, h, type VNode } from 'vue'
import TopicTitle from './TopicTitle.vue'

export default defineComponent({
  name: 'WritersideTopic',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => {
      let isStartingPage = false
      let labelRef = ''
      const contentNodes = (slots.default?.() ?? []).filter((vnode: VNode) => {
        if (isComponentNamed(vnode, 'Page', 'SectionStartingPage')) {
          isStartingPage = true
        }
        if (isHtmlElement(vnode, 'primary-label')) {
          labelRef = vnode.props?.ref?.toString() ?? ''
        }

        // Writerside sometimes emits a direct <title> child in addition to the
        // topic title attribute. It is metadata, not valid page-body HTML.
        return !isHtmlElement(vnode, 'title')
      })

      return [
        isStartingPage
          ? null
          : h(TopicTitle, { labelRef, title: props.title }),
        ...contentNodes
      ]
    }
  }
})

function isHtmlElement(vnode: VNode, name: string) {
  return typeof vnode.type === 'string' &&
    vnode.type.toLowerCase() === name.toLowerCase()
}

function isComponentNamed(vnode: VNode, ...names: string[]) {
  if (typeof vnode.type !== 'object' && typeof vnode.type !== 'function') {
    return false
  }

  const component = vnode.type as { name?: string; __name?: string }
  return names.includes(component.name ?? '') || names.includes(component.__name ?? '')
}
</script>
