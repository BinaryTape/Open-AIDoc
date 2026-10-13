import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { compileScript, compileTemplate, parse } from 'vue/compiler-sfc'
import type { Plugin } from 'vitest/config'
import { isPlainElement } from '../../docs/.vitepress/config/vue-template.config'

// Lets tests import the site's .vue components, compiled for server rendering
// with the site's template options. Styles are ignored. A component compiles
// to `<file>.vue?ssr&lang.ts`, so Vite strips its TypeScript like a .ts file.
const QUERY = '?ssr&lang.ts'
const compilerOptions = { isCustomElement: isPlainElement }

export function vueSfcSsr(): Plugin {
  return {
    name: 'test-vue-sfc-ssr',
    enforce: 'pre',
    load(id) {
      if (id.endsWith('.vue')) return `export { default } from ${JSON.stringify(id + QUERY)}`
      if (!id.endsWith('.vue' + QUERY)) return

      const filename = id.slice(0, -QUERY.length)
      const { descriptor } = parse(readFileSync(filename, 'utf8'), { filename })
      const scopeId = createHash('sha256').update(filename).digest('hex').slice(0, 8)

      if (descriptor.scriptSetup) {
        return compileScript(descriptor, {
          id: scopeId,
          inlineTemplate: true,
          templateOptions: { ssr: true, ssrCssVars: [], compilerOptions },
        }).content
      }

      const script = descriptor.script
        ? compileScript(descriptor, { id: scopeId, genDefaultAs: '_sfc_main' }).content
        : 'const _sfc_main = {}'
      const template = descriptor.template
        ? compileTemplate({ source: descriptor.template.content, filename, id: scopeId, ssr: true, ssrCssVars: [], compilerOptions }).code
        : ''
      return `${script}\n${template}\n${template ? '_sfc_main.ssrRender = ssrRender\n' : ''}export default _sfc_main\n`
    },
  }
}
