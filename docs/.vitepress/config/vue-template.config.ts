/**
 * Vue template compiler options for the site.
 *
 * Writerside pages use many custom tags (`<primary-label>`, `<shortcut>`,
 * `<compare>`, `<seealso>`, …). A tag that is neither native HTML nor a
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
  'HomeLayout', 'deflist', 'def', 'list', 'tldr', 'tabs', 'tab', 'Tabs', 'TabItem',
  'topic', 'TopicTitle', 'section-starting-page', 'show-structure', 'link-summary', 'card-summary',
  'web-summary', 'snippet', 'description', 'spotlight', 'primary', 'secondary', 'misc', 'cards',
  'card', 'links', 'group', 'Links', 'chapter', 'procedure', 'step', 'control', 'Path', 'ui-path',
  'emphasis', 'note', 'tip', 'warning', 'YouTubeVideo',
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

const isRow = (node: TemplateNode) => node.type === ELEMENT_NODE && node.tag === 'tr'

// A component that only wraps rows, like `<snippet id="…"><tr>…</tr></snippet>`.
const isRowComponent = (node: TemplateNode) =>
  node.type === ELEMENT_NODE && node.tagType !== PLAIN_ELEMENT &&
  !!node.children?.some(isRow) &&
  node.children.every((child) => child.type !== ELEMENT_NODE || isRow(child))

/**
 * Writerside tables are written as `<table><tr>…`. The browser puts the rows
 * in a `<tbody>`, Vue does not, so a table that Vue renders node by node
 * (one with a component in a cell) fails to hydrate. Add the `<tbody>`, and
 * put components that only wrap rows in it too.
 */
export function wrapTableRows(node: TemplateNode): void {
  if (node.type !== ELEMENT_NODE || node.tag !== 'table' || !node.children) return
  const children: TemplateNode[] = []
  let body: TemplateNode | null = null
  for (const child of node.children) {
    if (isRow(child) || isRowComponent(child)) {
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

const COMMENT_NODE = 3 // NodeTypes.COMMENT
interface AttributeNode { type: number, name?: string }

const isParagraph = (node: TemplateNode) =>
  node.type === ELEMENT_NODE && node.tag === 'p' && node.tagType === PLAIN_ELEMENT

/** Children other than comments and whitespace. */
const contentChildren = (node: TemplateNode) => (node.children ?? []).filter((child) =>
  child.type !== COMMENT_NODE &&
  !(child.type === TEXT_NODE && !(child as { content?: string }).content?.trim()))

/**
 * Writerside wraps an `<include>` of a `<p>` snippet in `<p>`; once the
 * include is expanded, the page has `<p><p>…</p></p>`. The browser closes the
 * outer paragraph at the inner one and turns the last `</p>` into an empty
 * paragraph, so hydration fails and Vue clears the content. Keep one
 * paragraph, with the attributes of both (the inner one's win).
 */
export function unwrapNestedParagraphs(node: TemplateNode): void {
  if (!isParagraph(node)) return
  for (;;) {
    const children = contentChildren(node)
    const inner = children.length === 1 ? children[0] : null
    if (!inner || !isParagraph(inner)) return
    const innerProps = (inner.props ?? []) as AttributeNode[]
    const innerNames = new Set(innerProps.map((prop) => prop.name))
    node.props = [...((node.props ?? []) as AttributeNode[]).filter((prop) => !innerNames.has(prop.name)), ...innerProps]
    node.children = inner.children ?? []
  }
}

// Elements a paragraph can hold; any other element is a block of its own.
const INLINE_TAGS = new Set([
  'a', 'abbr', 'b', 'br', 'code', 'em', 'i', 'img', 'kbd', 'mark', 's', 'small', 'span', 'strong', 'sub', 'sup', 'u',
])

const isPlain = (node: TemplateNode, tag: string) =>
  node.type === ELEMENT_NODE && node.tag === tag && node.tagType === PLAIN_ELEMENT

const isInline = (node: TemplateNode) =>
  node.type === TEXT_NODE || node.type === COMMENT_NODE ||
  (node.type === ELEMENT_NODE && node.tagType === PLAIN_ELEMENT && INLINE_TAGS.has(node.tag!))

const isBlank = (node: TemplateNode) =>
  node.type === COMMENT_NODE || (node.type === TEXT_NODE && !(node as { content?: string }).content?.trim())

const element = (tag: string, props: unknown[], children: TemplateNode[], loc: unknown) =>
  ({ type: ELEMENT_NODE, ns: 0, tag, tagType: PLAIN_ELEMENT, props, children, isSelfClosing: false, loc, codegenNode: undefined }) as TemplateNode

const attribute = (name: string, value: string, loc: unknown) =>
  ({ type: ATTRIBUTE_NODE, name, nameLoc: loc, value: { type: TEXT_NODE, content: value, loc }, loc })

const attributeValue = (node: TemplateNode, name: string) =>
  ((node.props ?? []) as { type: number, name?: string, value?: { content: string } }[])
    .find((prop) => prop.type === ATTRIBUTE_NODE && prop.name === name)?.value?.content

const COLUMN_ATTRIBUTES = ['columns', 'columns-tablet', 'columns-mobile']

/**
 * Writerside lays out `<panels columns="2">` as a grid of bordered `<panel>`s,
 * each a `<title>` over its content. Render the structure kotlinlang.org
 * renders, which styles/ws-panels.css styles:
 *
 *   <div class="ws-panels" data-columns="2" data-columns-tablet="2" data-columns-mobile="1">
 *     <div class="ws-panel"><div class="ws-title">…</div><div class="ws-panel__content">…</div></div>
 *
 * Content written straight into the panel (`<img/> <a>…</a><br/><br/><a as="button">`)
 * goes into a `<p>`, one per run of inline content, as Writerside does: the
 * stylesheet lays out the content's children, and an icon, its link and a
 * button are one line of it, not three.
 */
export function structurePanels(node: TemplateNode): void {
  if (isPlain(node, 'panels')) {
    const columns = attributeValue(node, 'columns') ?? '1'
    const tablet = attributeValue(node, 'columns-tablet') ?? columns
    const mobile = attributeValue(node, 'columns-mobile') ?? '1'
    node.tag = 'div'
    node.props = [
      ...((node.props ?? []) as AttributeNode[]).filter((prop) => !COLUMN_ATTRIBUTES.includes(prop.name!)),
      attribute('class', 'ws-panels', node.loc),
      attribute('data-columns', columns, node.loc),
      attribute('data-columns-tablet', tablet, node.loc),
      attribute('data-columns-mobile', mobile, node.loc),
    ]
    return
  }
  if (!isPlain(node, 'panel')) return

  const titles: TemplateNode[] = []
  const content: TemplateNode[] = []
  let run: TemplateNode[] = []
  const endRun = () => {
    if (!run.every(isBlank)) content.push(element('p', [], run, run[0].loc))
    run = []
  }
  for (const child of node.children ?? []) {
    if (isPlain(child, 'title')) titles.push(child)
    else if (isInline(child)) run.push(child)
    else {
      endRun()
      content.push(child)
    }
  }
  endRun()

  node.tag = 'div'
  node.props = [...(node.props ?? []), attribute('class', 'ws-panel', node.loc)]
  node.children = [...titles, element('div', [attribute('class', 'ws-panel__content', node.loc)], content, node.loc)]
}

export const vueCompilerOptions = {
  isCustomElement: isPlainElement,
  nodeTransforms: [wrapTableRows, structurePanels, renameBodyTitles, unwrapNestedParagraphs],
}
