import { describe, expect, it } from 'vitest'
import type { DefaultTheme } from 'vitepress'
import generateSidebar from '../docs/.vitepress/config/sidebar.config'
import { DocsTypeConfig } from '../docs/.vitepress/docs.config'
import { SiteLocaleConfig } from '../docs/.vitepress/locales.config'
import { substituteVariables, writersideVariables } from '../docs/.vitepress/utils/writerside-variables'

describe('substituteVariables', () => {
  it('puts in the value of a variable and leaves any other %…% as it is', () => {
    const variables = { 'org.jetbrains.compose-eap': '1.13.0-beta02' }
    expect(substituteVariables('Compose Multiplatform %org.jetbrains.compose-eap%', variables)).toBe('Compose Multiplatform 1.13.0-beta02')
    expect(substituteVariables('%unknown% and 100%', variables)).toBe('%unknown% and 100%')
  })
})

describe('writersideVariables', () => {
  it('reads the variables files of a doc type', () => {
    expect(writersideVariables('kmp')['org.jetbrains.compose-eap']).toMatch(/^\d+\.\d+/)
    expect(writersideVariables('kotlin')['kotlinVersion']).toMatch(/^\d+\.\d+/)
    expect(writersideVariables('koog')).toEqual({})
  })
})

// A Writerside toc-title can hold a variable, as the page text does: KMP's
// sidebar showed "Compose Multiplatform %org.jetbrains.compose-eap%" (P2-31).
describe('the site sidebars', () => {
  const texts = (items: DefaultTheme.SidebarItem[]): string[] =>
    items.flatMap((item) => [item.text ?? '', ...texts(item.items ?? [])])

  it('show the value of a variable in a label', () => {
    const eap = writersideVariables('kmp')['org.jetbrains.compose-eap']
    for (const lang of Object.keys(SiteLocaleConfig)) {
      expect(texts(generateSidebar(SiteLocaleConfig[lang], DocsTypeConfig.kmp))).toContain(`Compose Multiplatform ${eap}`)
    }
  })

  it('have no label left with a variable', () => {
    const left: string[] = []
    for (const lang of Object.keys(SiteLocaleConfig)) {
      for (const type of Object.keys(DocsTypeConfig)) {
        for (const text of texts(generateSidebar(SiteLocaleConfig[lang], DocsTypeConfig[type]))) {
          if (/%[A-Za-z][\w.-]*%/.test(text)) left.push(`${lang} ${type}: ${text}`)
        }
      }
    }
    expect(left).toEqual([])
  })
})
