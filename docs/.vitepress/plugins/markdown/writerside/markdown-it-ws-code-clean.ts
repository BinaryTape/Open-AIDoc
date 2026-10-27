/**
 * Removes the `//sampleStart` and `//sampleEnd` lines from code blocks: they
 * mark the part of a runnable sample that Kotlin Playground shows unfolded,
 * and are not part of the code a reader sees.
 *
 * Where they were is kept on the fence (`token.meta.wsSample`: for each pair,
 * the `[start, end)` line range it enclosed in the cleaned code), so a
 * runnable block can hand them back to Playground (markdown-it-ws-runnable.ts).
 */
export default function markdownItWsCodeClean(md) {
  md.core.ruler.push('sample_tag_remover', (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'fence') continue
      const kept: string[] = []
      const ranges: [number, number][] = []
      let start: number | null = null
      for (const line of token.content.split('\n')) {
        const marker = line.trim()
        if (marker === '//sampleStart') start = kept.length
        else if (marker === '//sampleEnd') {
          if (start !== null) ranges.push([start, kept.length])
          start = null
        } else kept.push(line)
      }
      token.content = kept.join('\n')
      if (ranges.length) token.meta = { ...token.meta, wsSample: ranges }
    }
  })
}

/** The sample ranges markdown-it-ws-code-clean kept on a fence token. */
export function sampleRanges(token: { meta?: { wsSample?: [number, number][] } | null }): [number, number][] {
  return token.meta?.wsSample ?? []
}
