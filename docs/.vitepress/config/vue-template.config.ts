/**
 * Vue template compiler options for the site.
 *
 * Writerside pages use many custom tags (`<primary-label>`, `<shortcut>`,
 * `<compare>`, `<warning>`, …). A tag that is neither native HTML nor a
 * registered component is compiled as a component that cannot be resolved:
 * server rendering outputs `<!---->` and drops its content, while the browser
 * renders it as an element, so hydration fails and shifts the rest of the
 * page. Compile such tags as plain elements instead.
 */

/**
 * Components registered globally in theme/index.ts. A test keeps this list in
 * sync; registering a component for a tag there is enough to stop treating
 * the tag as a plain element.
 */
export const GLOBAL_COMPONENTS = [
  'HomeLayout', 'deflist', 'def', 'list', 'tldr', 'tabs', 'tab', 'Tabs', 'TabItem', 'code-block',
  'topic', 'TopicTitle', 'section-starting-page', 'show-structure', 'link-summary', 'card-summary',
  'web-summary', 'snippet', 'description', 'spotlight', 'primary', 'secondary', 'misc', 'cards',
  'card', 'links', 'group', 'Links', 'chapter', 'procedure', 'step', 'control', 'Path', 'ui-path',
  'emphasis', 'note', 'tip', 'YouTubeVideo',
]

const registered = new Set(GLOBAL_COMPONENTS)

// Resolved by Vue itself, never custom elements.
const VUE_BUILT_INS = new Set(['component', 'slot', 'template', 'transition', 'transition-group', 'keep-alive', 'teleport', 'suspense'])

// The compiler only consults isCustomElement for tags that are not native, with
// one exception: v-model on a custom element compiles like on <input>. Never
// claim the form controls, so VitePress's own v-model inputs keep working.
const FORM_CONTROLS = new Set(['input', 'select', 'textarea'])

const camelize = (tag: string) => tag.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)

/** Whether Vue would resolve the tag to a registered component (same lookup as resolveComponent). */
function isRegisteredComponent(tag: string): boolean {
  const camel = camelize(tag)
  return registered.has(tag) || registered.has(camel) || registered.has(capitalize(camel))
}

/** `compilerOptions.isCustomElement`: lower-case tags that no component handles. */
export function isPlainElement(tag: string): boolean {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(tag) &&
    !VUE_BUILT_INS.has(tag) &&
    !FORM_CONTROLS.has(tag) &&
    !isRegisteredComponent(tag)
}

// The parts of Vue's template AST this file touches (@vue/compiler-core).
const ELEMENT_NODE = 1 // NodeTypes.ELEMENT
const ATTRIBUTE_NODE = 6 // NodeTypes.ATTRIBUTE
const TEXT_NODE = 2 // NodeTypes.TEXT
const PLAIN_ELEMENT = 0 // ElementTypes.ELEMENT
interface TemplateNode {
  type: number
  tag?: string
  tagType?: number
  props?: unknown[]
  children?: TemplateNode[]
  loc?: unknown
}

/**
 * Writerside tables are written as `<table><tr>…`. The browser puts the rows
 * in a `<tbody>`, Vue does not, so a table that Vue renders node by node
 * (one with a component in a cell) fails to hydrate. Add the `<tbody>`.
 */
export function wrapTableRows(node: TemplateNode): void {
  if (node.type !== ELEMENT_NODE || node.tag !== 'table' || !node.children) return
  const children: TemplateNode[] = []
  let body: TemplateNode | null = null
  for (const child of node.children) {
    if (child.type === ELEMENT_NODE && child.tag === 'tr') {
      if (!body) {
        body = { type: ELEMENT_NODE, ns: 0, tag: 'tbody', tagType: 0, props: [], children: [], isSelfClosing: false, loc: child.loc, codegenNode: undefined } as TemplateNode
        children.push(body)
      }
      body.children!.push(child)
    } else {
      body = null
      children.push(child)
    }
  }
  node.children = children
}

/**
 * Writerside titles its panels with `<title>` (`<panel><title>Beginner</title>`).
 * Inside the page body that is an invisible, invalid element. Where a plain
 * element contains it, render a `<div class="ws-title">`. Components that read
 * a `<title>` from their slot (cards, link groups) keep it.
 */
export function renameBodyTitles(node: TemplateNode, context: { parent: TemplateNode | null }): void {
  if (node.type !== ELEMENT_NODE || node.tag !== 'title') return
  const parent = context.parent
  if (parent?.type !== ELEMENT_NODE || parent.tagType !== PLAIN_ELEMENT) return
  node.tag = 'div'
  node.props = [
    ...(node.props ?? []),
    { type: ATTRIBUTE_NODE, name: 'class', nameLoc: node.loc, value: { type: TEXT_NODE, content: 'ws-title', loc: node.loc }, loc: node.loc },
  ]
}

export const vueCompilerOptions = {
  isCustomElement: isPlainElement,
  nodeTransforms: [wrapTableRows, renameBodyTitles],
}
