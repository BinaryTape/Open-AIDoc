<script lang="ts">
import { defineComponent, h, type VNode } from 'vue'
import Card from './Card.vue'

export default defineComponent({
  name: 'TopicCardSection',
  setup(_, { slots }) {
    return () => {
      let titleContent = ''
      const links: Array<{
        summary?: string
        content: string
        href?: string
      }> = []

      const contentNodes = (slots.default?.() ?? []).filter((vnode: VNode) => {
        if (typeof vnode.type !== 'string') return true

        const elementName = vnode.type.toLowerCase()
        if (elementName === 'title') {
          titleContent = textContent(vnode.children)
          return false
        }

        if (elementName === 'a') {
          links.push({
            summary: vnode.props?.summary,
            href: vnode.props?.href,
            content: textContent(vnode.children)
          })
          return false
        }

        return true
      })

      const cards = links.length > 0
        ? links.map((link) => h(
            Card,
            { href: link.href, summary: link.summary },
            { default: () => link.content }
          ))
        : contentNodes

      return h('div', { class: 'ws-section' }, [
        titleContent
          ? h('h2', { class: 'ws-section-title' }, titleContent)
          : null,
        h('div', { class: 'ws-row' }, cards)
      ])
    }
  }
})

function textContent(children: VNode['children']) {
  if (typeof children === 'string') return children
  if (!Array.isArray(children)) return ''
  return children.map((child) => typeof child === 'string' ? child : '').join('')
}
</script>

<style scoped>
.ws-section {
  margin-top: 16px;
}

.ws-section-title {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 28px;
}

.ws-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
  margin-top: 36px;
}

.ws-row > :nth-of-type(2n+1) {
  margin-right: 16px;
}

.ws-row > :nth-of-type(2n) {
  margin-left: 16px;
}
</style>
