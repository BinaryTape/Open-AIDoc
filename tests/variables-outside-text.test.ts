import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import MarkdownIt from 'markdown-it'
import { createMarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import markdownItWsVars from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-vars'
import { extractDescription, extractTitle, seoVariables } from '../docs/.vitepress/config/seo.config'
import { linkSummaryOf, pageVariables, resolveLinkSummaries, writersideVariables } from '../docs/.vitepress/utils/writerside-variables'

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

  it('takes the value the page opens with, not one it sets again for a later section', () => {
    // server-compression sets artifact_name again for its zstd section; ktor.io
    // shows "Required dependencies: io.ktor:ktor-server-compression"
    const source = readFileSync('docs/ktor/server-compression.md', 'utf8')
    expect(source.match(/<var name="artifact_name"/g)?.length).toBeGreaterThan(1)
    const tag = resolveLinkSummaries('<Links href="server-compression.md" summary="io.ktor:%artifact_name%">x</Links>', 'ktor/server-server-sent-events.md')
    expect(tag).toContain('io.ktor:ktor-server-compression"')
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
    expect(html).toContain(`io.ktor:${artifact}"`)
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

// ktor.io shows a page's <link-summary>, else the first paragraph of its
// <tldr>, else its first paragraph; the pipeline took the whole <tldr>, or
// nothing (P2-33)
describe('the tooltip of a link to a page', () => {
  const lines = (...text: string[]) => text.join('\n')

  it('is its link summary first, with its variables', () => {
    const page = lines(
      '<var name="plugin_name" value="CachingHeaders"/>',
      '<tldr>',
      '<p><b>Required dependencies</b>: <code>io.ktor:x</code></p>',
      '</tldr>',
      '',
      '<link-summary>The %plugin_name% plugin adds the "Cache-Control" header.</link-summary>',
    )
    expect(linkSummaryOf(page)).toBe('The CachingHeaders plugin adds the &quot;Cache-Control&quot; header.')
  })

  it('is else the first paragraph of its tldr, not the rest of it', () => {
    const page = lines(
      '<var name="artifact_name" value="ktor-server-caching-headers"/>',
      '<tldr>',
      '<p>',
      '<b>所需依赖项</b>：<code>io.ktor:%artifact_name%</code>',
      '</p>',
      '<p><b>代码示例</b>：<a href="https://github.com/x">caching-headers</a></p>',
      '<p><b>原生服务器</b>支持：✅</p>',
      '</tldr>',
    )
    expect(linkSummaryOf(page)).toBe('所需依赖项：io.ktor:ktor-server-caching-headers')
  })

  it('is else the first paragraph of a Markdown page, up to a list', () => {
    const page = lines(
      '[//]: # (title: User agent)',
      '',
      '<show-structure for="chapter" depth="2"/>',
      '<primary-label ref="client-plugin"/>',
      '',
      'The [UserAgent](https://x) plugin adds a **User-Agent** header to all requests:',
      '- one',
      '- two',
      '',
      '## Add dependencies',
    )
    expect(linkSummaryOf(page)).toBe('The UserAgent plugin adds a User-Agent header to all requests:')
  })

  it('is else the first <p> of a topic page', () => {
    const page = lines(
      '<topic xmlns="" id="server-development-mode"',
      '       title="开发模式">',
      '<show-structure for="chapter" depth="2"/>',
      '<p>',
      '    Ktor 提供了一种专门针对开发的特殊模式。',
      '</p>',
      '<list>',
      '    <li>自动重载</li>',
      '</list>',
    )
    expect(linkSummaryOf(page)).toBe('Ktor 提供了一种专门针对开发的特殊模式。')
  })

  it('is nothing for a page without text for one', () => {
    expect(linkSummaryOf(lines('[//]: # (title: X)', '', '## Heading', '', '<note>A note</note>'))).toBeNull()
  })

  it('replaces what the pipeline wrote, and fills an empty one', () => {
    const page = lines('[//]: # (title: What is new)', '', 'Released: _September 17, 2026_')
    const tags = '<Links href="whats-new-360.md" summary="">3.6.0</Links> <Links href="whats-new-360.md" summary="Old text">3.6.0</Links>'
    expect(resolveLinkSummaries(tags, 'ktor/releases.md', () => page)).toBe(
      '<Links href="whats-new-360.md" summary="Released: September 17, 2026">3.6.0</Links> ' +
      '<Links href="whats-new-360.md" summary="Released: September 17, 2026">3.6.0</Links>',
    )
  })

  it('leaves out the rest of the tldr on the site', () => {
    const long: string[] = []
    for (const file of readdirSync('docs/ktor').filter((f) => f.endsWith('.md'))) {
      const resolved = resolveLinkSummaries(readFileSync(`docs/ktor/${file}`, 'utf8'), `ktor/${file}`)
      for (const [, summary] of resolved.matchAll(/<Links\b[^>]*\ssummary="([^"]*)"/g)) {
        if (/依赖项/.test(summary) && /代码示例|原生服务器/.test(summary)) long.push(`${file}: ${summary}`)
      }
    }
    expect(long).toEqual([])
  })
})

// A variable neither the page nor its doc type defines shows as it is:
// client-opentelemetry showed "%artifact_name%", which an included section
// takes from the page it comes from (P3-34)
describe('the Writerside pages of the site', () => {
  it('use no variable neither they nor their doc type define', () => {
    // Not variables: Logback's %msg% pattern; URL-encoded text (%E3%81…)
    const notVariables = new Set(['msg'])
    const left: string[] = []
    for (const docType of ['kotlin', 'ktor', 'kmp']) {
      const global = writersideVariables(docType)
      for (const lang of ['', 'zh-Hant/', 'ja/', 'ko/']) {
        for (const file of readdirSync(`docs/${lang}${docType}`).filter((f) => f.endsWith('.md'))) {
          const text = readFileSync(`docs/${lang}${docType}/${file}`, 'utf8')
            .replace(/<Links\b[^>]*>/g, '') // filled in from the page they link to
            .replace(/```[\s\S]*?```/g, '')
          const own = new Set([...text.matchAll(/<var\s+name="([^"]+)"/g)].map((m) => m[1]))
          for (const [, name] of text.matchAll(/%([A-Za-z][\w.-]*)%/g)) {
            if (!(name in global) && !own.has(name) && !notVariables.has(name) && !/^[0-9A-F]{2}/.test(name)) left.push(`${lang}${docType}/${file}: %${name}%`)
          }
        }
      }
    }
    expect([...new Set(left)]).toEqual([])
  })
})
