/**
 * Writerside's <math> holds TeX, not MathML:
 *
 *   The formula for the area is <math>πr^2</math>, where <math>r</math> is the radius.
 *
 * kotlinlang.org renders it with MathJax into an inline SVG at build time.
 * Left as it is, a browser reads it as an empty MathML element and shows
 * nothing (P3-28). Render it the same way here, with MathJax 3 and its TeX
 * font, as there, so the page needs no script for it.
 *
 * The rule runs before inline parsing, so that markdown never sees the TeX
 * (its `\`, `_` and `*`), and on HTML blocks too, as in a <def>.
 */
import { mathjax } from 'mathjax-full/js/mathjax.js'
import { TeX } from 'mathjax-full/js/input/tex.js'
import { SVG } from 'mathjax-full/js/output/svg.js'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js'
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js'

const MATH = /<math>([\s\S]*?)<\/math>/g

let convert: ((tex: string) => string) | undefined

/** TeX to an inline SVG in a <span class="ws-math">, or undefined when MathJax cannot read it. */
export function renderTex(tex: string): string | undefined {
  if (!convert) {
    const adaptor = liteAdaptor()
    RegisterHTMLHandler(adaptor)
    const doc = mathjax.document('', {
      InputJax: new TeX({ packages: AllPackages }),
      // Every formula draws its own glyphs, instead of pointing at ones defined in another
      OutputJax: new SVG({ fontCache: 'none' }),
    })
    convert = (source) => {
      const container = doc.convert(source, { display: false })
      const svg = adaptor.firstChild(container) as any
      // A TeX error comes out as a red message in the SVG, marked so
      if (adaptor.outerHTML(svg).includes('data-mjx-error')) return ''
      // Read out as the TeX it was written in
      adaptor.setAttribute(svg, 'aria-label', source)
      return `<span class="ws-math">${adaptor.outerHTML(svg)}</span>`
    }
  }
  return convert(tex) || undefined
}

const replaceMath = (content: string, path?: string) =>
  content.replace(MATH, (whole, tex: string) => {
    const html = renderTex(tex.trim())
    if (html) return html
    console.warn(`[ws-math] cannot render ${whole}${path ? ` in ${path}` : ''}`)
    return whole
  })

export default function markdownItWsMath(md: any) {
  md.core.ruler.before('inline', 'ws_math', (state: any) => {
    for (const token of state.tokens) {
      if ((token.type === 'inline' || token.type === 'html_block') && token.content.includes('<math>')) {
        token.content = replaceMath(token.content, state.env?.relativePath)
      }
    }
  })
}
