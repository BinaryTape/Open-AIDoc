import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import MarkdownIt from 'markdown-it'
import markdownItWsVars from '../docs/.vitepress/plugins/markdown/writerside/markdown-it-ws-vars'

describe('Writerside variables', () => {
  const originalCwd = process.cwd()
  let dir: string
  const vars = (file: string, values: Record<string, string>) =>
    writeFileSync(
      join(dir, 'docs/.vitepress/variables', file),
      `<vars>\n${Object.entries(values).map(([name, value]) => `  <var name="${name}" value="${value}"/>`).join('\n')}\n</vars>\n`
    )

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ws-vars-'))
    mkdirSync(join(dir, 'docs/.vitepress/variables'), { recursive: true })
    process.chdir(dir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    rmSync(dir, { recursive: true, force: true })
  })

  it('reads the Kotlin pages\' variables from kotlin-web-site first, then kotlinx.serialization', () => {
    vars('kotlin.v.list', { kotlinVersion: '2.4.20', serializationVersion: '1.11.0' })
    vars('serialization.v.list', { kotlinVersion: '2.4.0', okioVersion: '3.16.2' })
    const md = new MarkdownIt().use(markdownItWsVars)

    const html = md.render('Kotlin %kotlinVersion%, serialization %serializationVersion%, Okio %okioVersion%.', {
      relativePath: 'ja/kotlin/serialization-json-io-sources.md',
    })

    expect(html).toBe('<p>Kotlin 2.4.20, serialization 1.11.0, Okio 3.16.2.</p>\n')
  })
})
