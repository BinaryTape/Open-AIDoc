import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import TopicTitle from '../docs/.vitepress/component/TopicTitle.vue'
import { findLabel, labelColorClass, labelsDocType } from '../docs/.vitepress/utils/writerside-labels'

// TopicTitle reads the page path from VitePress to pick the doc type's labels.
const page = vi.hoisted(() => ({ relativePath: '' }))
vi.mock('vitepress', () => ({ useData: () => ({ page: { value: page } }) }))

async function render(relativePath: string, labelRef: string) {
  page.relativePath = relativePath
  return renderToString(createSSRApp({ render: () => h(TopicTitle, { id: 'x', level: 2, title: '新功能', labelRef }) }))
}

const labelOf = (html: string) => {
  const box = /<div class="([^"]*\bws-topic-label\b[^"]*)"/.exec(html)
  const span = /<span class="ws-topic-label-text"([^>]*)>([^<]*)<\/span>/.exec(html)
  if (!box || !span) return null
  return {
    color: box[1].split(' ').find((c) => c.startsWith('ws-label--')),
    title: /title="([^"]*)"/.exec(span[1])?.[1] ?? null,
    text: span[2],
  }
}

describe('primary labels', () => {
  it('take name and colour from the labels.list of the doc type', async () => {
    // Showed as an empty purple bar: not in the hand-written mapping (P2-24)
    expect(labelOf(await render('kotlin/whatsnew24.md', 'stable'))).toEqual({ color: 'ws-label--green', title: null, text: 'Stable' })
    expect(labelOf(await render('ja/kmp/compose-test.md', 'Experimental'))?.text).toBe('Experimental')
    // Colours as on kotlinlang.org and ktor.io
    expect(labelOf(await render('kotlin/whatsnew2320.md', 'alpha'))?.color).toBe('ws-label--strawberry')
    expect(labelOf(await render('ktor/client-webrtc.md', 'experimental'))?.color).toBe('ws-label--tangerine')
  })

  it('carry the description as a tooltip', async () => {
    expect(labelOf(await render('kotlin/x.md', 'experimental-opt-in'))?.title).toMatch(/^The feature is Experimental\./)
  })

  it('show an id labels.list does not have as itself, in grey', async () => {
    expect(labelOf(await render('kotlin/x.md', 'no-such-label'))).toEqual({ color: 'ws-label--default', title: null, text: 'no-such-label' })
  })

  it('are looked up per doc type', () => {
    expect(findLabel('primary', 'ktor', 'experimental')?.color).toBe('tangerine')
    expect(findLabel('primary', 'kotlin', 'experimental-general')?.color).toBe('red')
    expect(findLabel('primary', null, 'alpha')).toBeNull()
    expect(labelColorClass(findLabel('secondary', 'kotlin', 'maven'))).toBe('ws-label--red')
    expect(labelsDocType('ja/kmp/compose-test.md')).toBe('kmp')
    expect(labelsDocType('koin/setup.md')).toBeNull()
  })
})
