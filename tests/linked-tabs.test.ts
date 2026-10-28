import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Tabs from '../docs/.vitepress/component/Tabs.vue'
import Tab from '../docs/.vitepress/component/Tab.vue'
import { choose, emptyChoices, parseChoices, preferredTab } from '../docs/.vitepress/utils/linked-tabs'

describe('Tabs.vue marks what links its tabs', () => {
  it('puts the group on the set and the group key on each tab', async () => {
    // The group was only an unused attribute, the keys nowhere on the page.
    const html = await renderToString(createSSRApp({
      render: () => h(Tabs, { group: 'build-script' }, () => [
        h(Tab, { title: 'Kotlin', 'group-key': 'kotlin' }, () => 'k'),
        h(Tab, { title: 'Groovy', 'group-key': 'groovy' }, () => 'g'),
      ]),
    }))
    expect(html).toMatch(/^<div class="ws-tabs-container" data-group="build-script">/)
    expect(html).toContain('<label class="ws-tab" data-title="Kotlin" data-key="kotlin"')
    expect(html).toContain('<label class="ws-tab" data-title="Groovy" data-key="groovy"')
  })

  it('leaves both out for a set without a group', async () => {
    const html = await renderToString(createSSRApp({
      render: () => h(Tabs, null, () => [h(Tab, { title: 'A' }, () => 'a'), h(Tab, { title: 'B' }, () => 'b')]),
    }))
    expect(html).toMatch(/^<div class="ws-tabs-container">/)
    expect(html).not.toContain('data-key')
  })
})

describe('linked tab choices', () => {
  const kotlinGroovy = [{ key: 'kotlin', title: 'Kotlin' }, { key: 'groovy', title: 'Groovy' }]

  it('picks the tab of the latest choice, by key or by title', () => {
    let choices = choose(emptyChoices(), { key: 'groovy', title: 'Groovy' })
    expect(preferredTab(choices, kotlinGroovy)).toBe(1)
    // An MkDocs set has titles only: the Writerside choice still applies.
    expect(preferredTab(choices, [{ title: 'Kotlin' }, { title: 'Groovy' }])).toBe(1)
    choices = choose(choices, { title: 'Kotlin' })
    expect(preferredTab(choices, kotlinGroovy)).toBe(0)
  })

  it('falls back to older choices, and leaves a set with none of them', () => {
    const choices = choose(choose(emptyChoices(), { key: 'maven', title: 'Maven' }), { title: 'Java' })
    expect(preferredTab(choices, [{ key: 'gradle', title: 'Gradle' }, { key: 'maven', title: 'Maven' }])).toBe(1)
    expect(preferredTab(choices, [{ title: 'OpenAI' }, { title: 'Ollama' }])).toBe(-1)
  })

  it('keeps the list short and without repeats', () => {
    let choices = emptyChoices()
    for (let i = 0; i < 30; i++) choices = choose(choices, { title: `T${i}` })
    choices = choose(choices, { title: 'T29' })
    expect(choices.recent).toHaveLength(20)
    expect(choices.recent[0]).toBe('t29')
    expect(new Set(choices.recent).size).toBe(20)
  })

  it('reads back what it stored, and nothing from a broken value', () => {
    const choices = choose(emptyChoices(), { key: 'groovy', title: 'Groovy' })
    expect(parseChoices(JSON.stringify(choices))).toEqual(choices)
    expect(parseChoices('not json')).toEqual(emptyChoices())
    expect(parseChoices(null)).toEqual(emptyChoices())
    expect(parseChoices('{"recent":[1,"x"]}')).toEqual({ recent: ['x'] })
  })
})
