import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import markdownItWsVars from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-vars'
import { extractDescription, extractTitle, seoVariables } from '../docs/.vitepress/config/seo.config'
import { pageVariables, resolveLinkSummaries, writersideVariables } from '../docs/.vitepress/utils/writerside-variables'

// The page text gets its Writerside variables at build time
// (markdown-it-ws-vars.ts); what is built from the page another way did not (P2-32).

describe('the title and description of a page', () => {
  it('show the doc type\'s variables', () => {
    const eap = writersideVariables('kotlin').kotlinEapVersion
    const source = '[//]: # (title: Kotlin %kotlinEapVersion% 的最新变化)\n'
    expect(extractTitle(source, seoVariables(source, 'kotlin/whatsnew-eap.md'))).toBe(`Kotlin ${eap} 的最新变化`)
  })

  it('show the page\'s own variables, underscores and all', () => {
    const source = '[//]: # (title: Ktor Client 中的调用 ID)\n\n<var name="plugin_name" value="CallId"/>\n\n%plugin_name% 客户端插件允许你使用唯一的调用 ID 来跟踪客户端请求。\n'
    expect(extractDescription(source, seoVariables(source, 'ktor/client-call-id.md'))).toBe('CallId 客户端插件允许你使用唯一的调用 ID 来跟踪客户端请求。')
  })

  it('still leave out a start page\'s version line', () => {
    const source = readFileSync('docs/ja/kotlin/home.md', 'utf8')
    expect(source).toMatch(/<description>[^<]*%kotlinVersion%/)
    expect(extractDescription(source, seoVariables(source, 'kotlin/home.md'))).toBe('')
  })
})

describe('a <Links> tooltip', () => {
  const target = '<var name="artifact_name" value="ktor-server-forwarded-header"/>\n<var name="note" value="a &quot;b&quot;"/>\n'
  const read = (asked: string[]) => (path: string) => { asked.push(path); return path.endsWith('server-forward-headers.md') ? target : null }

  it('takes the variables of the page it links to', () => {
    const asked: string[] = []
    const tag = '<Links href="//server-forward-headers" summary="所需依赖项：io.ktor:%artifact_name%">ForwardedHeader</Links>'
    expect(resolveLinkSummaries(tag, 'ja/ktor/FAQ.md', read(asked)))
      .toBe('<Links href="//server-forward-headers" summary="所需依赖项：io.ktor:ktor-server-forwarded-header">ForwardedHeader</Links>')
    expect(asked).toEqual(['ja/ktor/server-forward-headers.md'])
  })

  it('finds the page from each form of link the pages use', () => {
    for (const [page, href, file] of [
      ['ja/ktor/FAQ.md', 'server-forward-headers.md', 'ja/ktor/server-forward-headers.md'],
      ['ja/ktor/FAQ.md', '/ktor/server-forward-headers', 'ja/ktor/server-forward-headers.md'],
      ['ktor/FAQ.md', '/ktor/server-forward-headers#install', 'ktor/server-forward-headers.md'],
    ]) {
      const asked: string[] = []
      resolveLinkSummaries(`<Links href="${href}" summary="%artifact_name%">x</Links>`, page, read(asked))
      expect(asked).toEqual([file])
    }
  })

  it('leaves a tooltip without variables, a variable the page lacks and an external link as they are', () => {
    const asked: string[] = []
    const tags = [
      '<Links href="//server-forward-headers" summary="No variable">x</Links>',
      '<Links href="//server-forward-headers" summary="%other_name%">x</Links>',
      '<Links href="https://ktor.io/docs/x.html" summary="%artifact_name%">x</Links>',
    ].join('\n')
    expect(resolveLinkSummaries(tags, 'ktor/FAQ.md', read(asked))).toBe(tags)
  })

  it('keeps the attribute well-formed', () => {
    expect(resolveLinkSummaries('<Links href="//server-forward-headers" summary="%note%">x</Links>', 'ktor/FAQ.md', read([])))
      .toBe('<Links href="//server-forward-headers" summary="a &quot;b&quot;">x</Links>')
  })

  it('is filled in when the page is rendered', () => {
    const md = new MarkdownIt({ html: true }).use(markdownItWsVars)
    const html = md.render('<Links href="//server-forward-headers" summary="io.ktor:%artifact_name%">ForwardedHeader</Links>', { relativePath: 'ja/ktor/FAQ.md' })
    const artifact = pageVariables(readFileSync('docs/ja/ktor/server-forward-headers.md', 'utf8')).artifact_name
    expect(artifact).toBe('ktor-server-forwarded-header')
    expect(html).toContain(`summary="io.ktor:${artifact}"`)
  })

  it('has the variables of every tooltip of the site', () => {
    const left: string[] = []
    for (const lang of ['', 'zh-Hant/', 'ja/', 'ko/']) {
      for (const file of readdirSync(`docs/${lang}ktor`).filter((f) => f.endsWith('.md'))) {
        const page = `${lang}ktor/${file}`
        const resolved = resolveLinkSummaries(readFileSync(`docs/${page}`, 'utf8'), page)
        const variables = { ...writersideVariables('ktor'), ...pageVariables(resolved) }
        for (const tag of resolved.match(/<Links\b[^>]*>/g) ?? []) {
          const summary = tag.match(/\ssummary="([^"]*)"/)?.[1] ?? ''
          for (const [, name] of summary.matchAll(/%([\w.-]+)%/g)) if (!(name in variables)) left.push(`${page}: %${name}%`)
        }
      }
    }
    expect(left).toEqual([])
  })
})

describe('the collapsed title of a code block', () => {
  const render = async (markdown: string) => {
    const md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (md) => registerMarkdownPlugins(md),
    })
    return md.renderAsync(markdown, { relativePath: 'kmp/compose-navigation.md', cleanUrls: true })
  }

  it('shows the doc type\'s and the page\'s variables', async () => {
    const navigation = writersideVariables('kmp')['org.jetbrains.androidx.navigation']
    const html = await render([
      '<var name="lib_version" value="1.2.3"/>',
      '',
      '```kotlin',
      'implementation("org.jetbrains.androidx.navigation:navigation-compose:%org.jetbrains.androidx.navigation%")',
      'implementation("lib:%lib_version%")',
      '```',
      '{initial-collapse-state="collapsed" collapsible="true" collapsed-title="navigation-compose:%org.jetbrains.androidx.navigation% lib:%lib_version%"}',
      '',
    ].join('\n'))
    expect(html).toContain(`navigation-compose:${navigation} lib:1.2.3`)
    expect(html).not.toMatch(/%(org\.jetbrains\.androidx\.navigation|lib_version)%/)
  })
})
