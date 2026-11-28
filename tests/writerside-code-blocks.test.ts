import { describe, expect, it } from 'vitest'
import { normalizeWritersideCodeBlocks } from '../docs/.vitepress/plugins/markdown/writerside/normalize-writerside-code-blocks'

describe('normalizeWritersideCodeBlocks', () => {
  it('converts CDATA inside code-block tags into an escaped code attribute', () => {
    const input = `
<code-block lang="xml">
                    <![CDATA[
<aptMode>stubsAndApt</aptMode>
                    ]]>
                </code-block>
`.trim()

    const output = normalizeWritersideCodeBlocks(input)

    expect(output).toContain('<code-block lang="xml" code="')
    expect(output).toContain('&lt;aptMode&gt;stubsAndApt&lt;/aptMode&gt;')
    expect(output).not.toContain('<![CDATA[')
    expect(output).not.toContain('</code-block>')
  })

  it('leaves self-closing code-blocks and src-backed blocks unchanged', () => {
    const selfClosing = '<code-block lang="kotlin" code="fun main() {}"/>'
    const withSrc = '<code-block lang="kotlin" src="Foo.kt">ignored</code-block>'

    expect(normalizeWritersideCodeBlocks(selfClosing)).toBe(selfClosing)
    expect(normalizeWritersideCodeBlocks(withSrc)).toBe(withSrc)
  })

  // P3-39: Writerside reads a body outside CDATA as XML text. ktor.io shows
  // rsa-keys-generation's `&gt; ktor.pk8` as `> ktor.pk8`.
  it('decodes the XML entities of a body outside CDATA', () => {
    const input = [
      '<code-block lang="shell">',
      'openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &gt; ktor.pk8',
      'echo &quot;&#36;{ktor_version}&#x22; &apos;&amp;&apos;',
      '</code-block>',
    ].join('\n')

    expect(normalizeWritersideCodeBlocks(input)).toBe(
      '<code-block lang="shell" code="openssl genpkey -algorithm rsa -pkeyopt rsa_keygen_bits:2048 &gt; ktor.pk8' +
        '&#10;echo &quot;${ktor_version}&quot; \'&amp;\'"/>'
    )
  })

  it('keeps a CDATA body as written, entities and all', () => {
    // ktor.io shows server-configuration-code's CDATA `-&gt;` as `-&gt;`
    const input = '<code-block lang="kotlin"><![CDATA[configureServer = { // this: Server -&gt;\n}]]></code-block>'

    expect(normalizeWritersideCodeBlocks(input)).toBe(
      '<code-block lang="kotlin" code="configureServer = { // this: Server -&amp;gt;&#10;}"/>'
    )
  })

  it('keeps an & that starts no XML entity', () => {
    const input = '<code-block lang="shell">\ntest -f a && echo &nbsp; &#xZZ;\n</code-block>'

    expect(normalizeWritersideCodeBlocks(input)).toBe(
      '<code-block lang="shell" code="test -f a &amp;&amp; echo &amp;nbsp; &amp;#xZZ;"/>'
    )
  })
})
