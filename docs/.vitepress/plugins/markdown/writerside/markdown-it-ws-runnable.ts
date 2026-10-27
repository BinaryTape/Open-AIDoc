import { codeBlockAttrs } from '../../../utils/code-block-attrs'
import { encodeSampleRanges } from '../../../utils/runnable-code'
import { isWritersideDoc } from '../../../utils/doctype-utils'
import { sampleRanges } from './markdown-it-ws-code-clean'

/**
 * Writerside runnable samples:
 *
 *   ```kotlin
 *   fun main() {
 *   //sampleStart
 *       println("Hello world!")
 *   //sampleEnd
 *   }
 *   ```
 *   {kotlin-runnable="true" kotlin-min-compiler-version="1.3" id="hello"}
 *
 * kotlinlang.org turns them into Kotlin Playground editors that run the code.
 * Here the highlighted block stays as it is (the page shows it before any
 * script runs, and if Playground cannot load) inside a wrapper that tells
 * theme/kotlin-playground.ts what to mount:
 *
 *   <div class="ws-runnable" data-sample="1-2" data-min-compiler-version="1.3" id="hello">(code block)</div>
 *
 * `data-sample` is where the sample markers were (see utils/runnable-code.ts).
 * `validate` and `kotlin-time-deadline` are for Writerside's build; ignored.
 */
export default function markdownItWsRunnable(md) {
  const renderFence = md.renderer.rules.fence

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const html = renderFence(tokens, idx, options, env, self)
    const token = tokens[idx]
    const attrs = codeBlockAttrs(token)
    if (attrs['kotlin-runnable'] !== 'true' || !isWritersideDoc(env)) return html

    const escape = md.utils.escapeHtml
    const data = [
      ['data-sample', encodeSampleRanges(sampleRanges(token))],
      ['data-min-compiler-version', attrs['kotlin-min-compiler-version']],
      // A collapsible block's <details> carries the id.
      ['id', attrs.collapsible === 'true' ? undefined : attrs.id],
    ].filter(([, value]) => value).map(([name, value]) => ` ${name}="${escape(value)}"`).join('')
    return `<div class="ws-runnable"${data}>${html}</div>\n`
  }
}
