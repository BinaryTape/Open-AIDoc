<script lang="ts">
import { defineComponent, h, inject, type Ref, type VNode } from 'vue'

// <deflist type>: these put the title on the left at the given width; any other type
// (none, "full") puts it on top, as kotlinlang.org's .definition-list--type-title-top does
const TITLE_LEFT_WIDTHS = ['wide', 'medium', 'narrow', 'compressed']

// Writerside's collapse icons: a circled cross, turned 45deg to a plus while closed,
// and the chevron of <deflist appearance="clear">
const CIRCLE_CROSS = 'M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9zm-4.235-3.351l-1.414-1.414L12 10.585 8.635 7.222 7.221 8.635 10.586 12l-3.257 3.257 1.414 1.414L12 13.414l3.288 3.289 1.415-1.415L13.414 12z'
const CHEVRON = 'M21.707 9.793a1 1 0 0 0-1.414 0L14 16.086 7.707 9.793a1 1 0 0 0-1.414 1.414l7 7a1 1 0 0 0 1.414 0l7-7a1 1 0 0 0 0-1.414z'

const icon = (clear: boolean) =>
  h('span', { class: 'ws-def-collapse-icon', 'aria-hidden': 'true' }, [
    h('svg', { viewBox: clear ? '0 0 28 28' : '0 0 24 24', focusable: 'false' }, [
      h('path', { d: clear ? CHEVRON : CIRCLE_CROSS })
    ])
  ])

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
    },
    // "expanded" opens a collapsible definition at first; the default is closed
    defaultState: {
      type: String,
      required: false
    }
  },
  setup(props, { slots }) {
    const isExpanded = inject('isExpanded') as Ref<boolean>
    const type = inject<string | undefined>('deflistType', undefined)
    const clear = inject<string | undefined>('deflistAppearance', undefined) === 'clear'
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
        return h('details', {
          class: ['ws-def-collapse', clear ? 'ws-def-collapse--clear' : 'ws-def-collapse--card'],
          id: props.id,
          open: props.defaultState === 'expanded' || undefined
        }, [
          h('summary', { class: 'ws-def-collapse-title' }, [
            icon(clear),
            h('span', { class: 'ws-def-collapse-text' }, renderedTitle)
          ]),
          h('div', { class: 'ws-def-collapse-content' }, contentNodes)
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
/* Writerside's .definition-list__group: square cards 12px apart, with a
   border; the colours are in styles/ws-def.css (P3-19) */
.ws-def {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--ws-def-border);
  color: var(--vp-c-text-1);
  background-color: var(--ws-def-bg);
  /* Holds the floated title when it is taller than the definition. */
  display: flow-root;
}

.ws-def:first-child {
  margin-top: 0;
}

.ws-def-title {
  font-weight: 530;
  font-size: 17px;
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

/* <deflist collapsible="true">: kotlinlang.org's .definition-list__group--expandable,
   a card whose title row toggles it, with a circled plus on its left border (P3-27) */
.ws-def-collapse--card {
  margin-top: 12px;
  border: 1px solid var(--ws-def-collapse-border);
  background-color: var(--ws-def-bg);
  transition: border-color 0.15s ease;
}

.ws-def-collapse--card:first-child {
  margin-top: 0;
}

.ws-def-collapse--card:hover {
  border-color: var(--ws-def-hover);
}

.ws-def-collapse-title {
  position: relative;
  display: flex;
  /* VitePress gives .vp-doc summary 16px above and below */
  margin: 0;
  list-style: none;
  cursor: pointer;
  color: var(--vp-c-text-1);
  font-weight: 530;
}

.ws-def-collapse-title::-webkit-details-marker {
  display: none;
}

.ws-def-collapse-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

.ws-def-collapse-icon {
  position: absolute;
  display: flex;
  transition: transform 0.3s ease-in-out;
}

.ws-def-collapse-icon svg {
  position: relative;
  width: 100%;
  height: 100%;
  fill: var(--ws-def-icon);
  transition: fill 0.3s linear;
}

.ws-def-collapse-title:hover .ws-def-collapse-icon svg {
  fill: var(--ws-def-hover);
}

.ws-def-collapse--card > .ws-def-collapse-title {
  padding: 16px 32px;
  font-size: 17px;
  line-height: 24px;
}

.ws-def-collapse--card .ws-def-collapse-icon {
  top: 16px;
  left: -12px;
  width: 24px;
  height: 24px;
  transform: rotate(-45deg);
}

/* Fills the cross cut out of the circle */
.ws-def-collapse--card .ws-def-collapse-icon::before {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 17px;
  height: 17px;
  border-radius: 100%;
  content: '';
  background-color: var(--vp-c-bg);
}

.ws-def-collapse--card[open] .ws-def-collapse-icon {
  transform: none;
}

.ws-def-collapse--card > .ws-def-collapse-content {
  padding: 0 32px 16px;
}

/* <deflist appearance="clear">: rows between hairlines, a chevron on the left
   (.definition-list__group--appearance-clear) */
.ws-def-collapse--clear {
  border-top: 1px solid var(--ws-def-hairline);
}

.ws-def-collapse--clear:last-child {
  border-bottom: 1px solid var(--ws-def-hairline);
}

.ws-def-collapse--clear > .ws-def-collapse-title {
  padding: 24px 0 24px 40px;
  font-size: 20px;
  line-height: 28px;
}

.ws-def-collapse--clear .ws-def-collapse-icon {
  top: 24px;
  left: 0;
  width: 28px;
  height: 28px;
}

.ws-def-collapse--clear .ws-def-collapse-icon svg {
  fill: var(--vp-c-text-1);
}

.ws-def-collapse--clear[open] .ws-def-collapse-icon {
  transform: rotate(180deg);
}

.ws-def-collapse--clear > .ws-def-collapse-content {
  padding-bottom: 32px;
}

/* <deflist numbered="true">: 1., 2., ... hanging before the title */
.ws-deflist--numbered > .ws-def-collapse--clear > .ws-def-collapse-title {
  counter-increment: ws-deflist-item;
}

.ws-deflist--numbered > .ws-def-collapse--clear > .ws-def-collapse-title > .ws-def-collapse-text {
  padding-left: 30px;
  text-indent: -30px;
}

.ws-deflist--numbered > .ws-def-collapse--clear > .ws-def-collapse-title > .ws-def-collapse-text::before {
  display: inline-block;
  min-width: 30px;
  content: counter(ws-deflist-item) '.';
  text-indent: 0;
}

.ws-def-collapse-content > *:first-child {
  margin: 0;
}

.ws-def-collapse--card > .ws-def-collapse-content > *:not(:first-child):not(:empty) {
  margin: 12px 0 0 !important;
}

.ws-def-collapse--clear > .ws-def-collapse-content > *:not(:first-child):not(:empty) {
  margin: 24px 0 0 !important;
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
