import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseMKSidebar } from '../tools/pipeline/processors/SidebarProcessor.mjs'

async function parse(yaml: string) {
  const file = join(mkdtempSync(join(tmpdir(), 'mkdocs-')), 'mkdocs.yml')
  writeFileSync(file, yaml)
  return parseMKSidebar(file, 'koog', '')
}

describe('parseMKSidebar', () => {
  it('uses an untitled page in a section as the section link (navigation.indexes)', async () => {
    const { sidebarNodes, translateKeys } = await parse(
      [
        'nav:',
        '  - Agents:',
        '      - agents/index.md',
        '      - Basic agents: agents/basic-agents.md',
        '      - Planner agents:',
        '          - agents/planner-agents/index.md',
        '          - LLM-based: agents/planner-agents/llm-based-planners.md',
      ].join('\n')
    )

    expect(sidebarNodes).toEqual([
      {
        text: 'koog.agents',
        link: 'agents/index',
        collapsed: true,
        items: [
          { text: 'koog.basic-agents', link: 'agents/basic-agents' },
          {
            text: 'koog.planner-agents',
            link: 'agents/planner-agents/index',
            collapsed: true,
            items: [{ text: 'koog.llm-based', link: 'agents/planner-agents/llm-based-planners' }],
          },
        ],
      },
    ])
    expect([...translateKeys.keys()]).not.toContain('koog._0')
  })

  it('keeps sections without an index page as plain groups', async () => {
    const { sidebarNodes } = await parse(
      ['nav:', '  - Strategies:', '      - Predefined: predefined-agent-strategies.md'].join('\n')
    )

    expect(sidebarNodes[0]).toEqual({
      text: 'koog.strategies',
      collapsed: true,
      items: [{ text: 'koog.predefined', link: 'predefined-agent-strategies' }],
    })
  })
})
