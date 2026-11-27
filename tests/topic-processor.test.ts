import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { processFullMarkdownContent } from '../tools/pipeline/processors/MarkdownProcessor.mjs'
import { extractTopicContent } from '../tools/pipeline/processors/TopicProcessor.mjs'

// Every case here once came out as the word "undefined" on the site.
describe('Writerside Markdown processing', () => {
  let dir: string
  const page = (name: string, content: string) => writeFileSync(join(dir, name), content)
  // As in the pipeline, the page being processed is on disk too
  const process = (content: string) => {
    page('page.md', content)
    return processFullMarkdownContent(join(dir, 'page.md'), content)
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'topics-'))
    page('other.md', '[//]: # (title: Other page)\n\n## Back gesture\n\nText.\n\n## Setup {id="custom-setup"}\n')
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('leaves tags that only start with "a" alone', async () => {
    const manifest = [
      '```xml',
      '<intent-filter>',
      '    <action android:name="android.intent.action.MAIN" />',
      '</intent-filter>',
      '```',
    ].join('\n')
    expect(await process(manifest)).toContain('<action android:name="android.intent.action.MAIN" />')
  })

  it('links a section of another page to that page', async () => {
    // Ktor: <a href="server-plugins.md" anchor="install"> came out as href="#install".
    expect(await process('See <a href="other.md" anchor="custom-setup">setup</a>.')).toContain(
      '<a href="other.md#custom-setup">setup</a>'
    )
    expect(await process('See <a anchor="custom-setup">here</a>.')).toContain('<a href="#custom-setup">here</a>')
  })

  it('turns <anchor> into a link target', async () => {
    expect(await process('<anchor name="android-target-rename"/>\n### Migrate')).toContain(
      '<a id="android-target-rename"></a>\n### Migrate'
    )
  })

  it('fills an empty link with the title of the heading it points at', async () => {
    const out = await process(
      '## Touch and mouse support\n\nSee [](#touch-and-mouse-support), [](other.md#back-gesture) and [](other.md#custom-setup).'
    )
    expect(out).toContain('[Touch and mouse support](#touch-and-mouse-support)')
    expect(out).toContain('[Back gesture](other.md#back-gesture)')
    expect(out).toContain('[Setup](other.md#custom-setup)')
  })

  it('falls back to the page title, then the link, when no heading matches', async () => {
    const out = await process('See [](other.md#gone) and [](#gone).')
    expect(out).toContain('[Other page](other.md#gone)')
    expect(out).toContain('[#gone](#gone)')
  })

  it('writes an empty summary for a page that has none', async () => {
    page('whats-new.md', '[//]: # (title: What\'s new)\n\nText.\n')
    const out = await process('<a href="whats-new.md"/>')
    expect(out).not.toContain('undefined')
    expect(out).toContain('summary=""')
  })

  // The page is at an absolute path here, as in CI. The site resolves the
  // target per page and language (docs/.vitepress/link-rewrites).
  it('keeps the target of a <Links> as written, not //<topic>', async () => {
    const out = await process('See <a href="other.topic">the other page</a>.')
    expect(out).toContain('<Links href="other.topic" summary="')
    expect(out).not.toContain('href="//')
  })

  it('keeps the target of a card as written', async () => {
    const out = await process('<a href="other.topic" summary="About it.">Other</a>')
    expect(out).toContain('<card href="other.topic" summary="About it.">Other</card>')
  })
})

// P3-39: Writerside reads a <code-block> body outside CDATA as XML text and a
// CDATA body as written. Escaping the body's `&` again showed `&lt;dependency&gt;`.
describe('Writerside code-block bodies', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'topics-'))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('decodes the entities of a body in a Markdown page (ktor server-jwt)', async () => {
    const maven = [
      '<code-block lang="XML" title="Sample">',
      '&lt;dependency&gt;',
      '&lt;groupId&gt;io.ktor&lt;/groupId&gt;',
      '&lt;/dependency&gt;',
      '</code-block>',
    ].join('\n')
    writeFileSync(join(dir, 'server-jwt.md'), maven)

    expect(await processFullMarkdownContent(join(dir, 'server-jwt.md'), maven)).toContain(
      '<code-block lang="XML" title="Sample" code="&lt;dependency&gt;&#10;&lt;groupId&gt;io.ktor&lt;/groupId&gt;&#10;&lt;/dependency&gt;"/>'
    )
  })

  it('decodes the entities of a body in a .topic page (ktor client-server-sent-events)', async () => {
    const topic = [
      '<topic id="client-server-sent-events" title="Server-Sent Events">',
      '<code-block lang="kotlin">',
      '    client.sse(host = &quot;127.0.0.1&quot;, port = 8080) {',
      '    }',
      '</code-block>',
      '</topic>',
    ].join('\n')

    expect(await extractTopicContent(topic, true, join(dir, 'client-server-sent-events.topic'), dir)).toContain(
      'code="    client.sse(host = &quot;127.0.0.1&quot;, port = 8080) {&#10;    }"'
    )
  })

  it('keeps a CDATA body as written (ktor server-configuration-code)', async () => {
    const block = [
      '<code-block lang="kotlin">',
      '<![CDATA[',
      'configureServer = { // this: Server -&gt;',
      '}',
      ']]>',
      '</code-block>',
    ].join('\n')
    writeFileSync(join(dir, 'page.md'), block)

    expect(await processFullMarkdownContent(join(dir, 'page.md'), block)).toContain(
      'code="configureServer = { // this: Server -&amp;gt;&#10;}"'
    )
  })

  it('keeps an & that starts no XML entity', async () => {
    const block = '<code-block lang="shell">\ntest -f a && echo &nbsp;\n</code-block>'
    writeFileSync(join(dir, 'page.md'), block)

    expect(await processFullMarkdownContent(join(dir, 'page.md'), block)).toContain(
      'code="test -f a &amp;&amp; echo &amp;nbsp;"'
    )
  })
})
