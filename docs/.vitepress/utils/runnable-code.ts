/**
 * Runnable Kotlin samples (`{kotlin-runnable="true"}`) are rendered as a
 * normal highlighted code block, without the `//sampleStart` / `//sampleEnd`
 * lines. Where those lines were travels in `data-sample` on the block's
 * wrapper ("2-5" or "2-5,8-9": the `[start, end)` line ranges they enclosed),
 * and the browser puts them back before handing the code to Kotlin Playground,
 * which folds the code outside them.
 */
export type SampleRange = [number, number]

export function encodeSampleRanges(ranges: SampleRange[]): string {
  return ranges.map(([start, end]) => `${start}-${end}`).join(',')
}

export function decodeSampleRanges(value: string | undefined | null): SampleRange[] {
  return (value ?? '').split(',').flatMap((part) => {
    const match = /^(\d+)-(\d+)$/.exec(part.trim())
    return match ? [[Number(match[1]), Number(match[2])] as SampleRange] : []
  })
}

/** The code with its `//sampleStart` / `//sampleEnd` lines back in place. */
export function withSampleMarkers(code: string, ranges: SampleRange[]): string {
  if (!ranges.length) return code
  const lines = code.split('\n')
  const starts = new Map<number, number>(), ends = new Map<number, number>()
  for (const [start, end] of ranges) {
    starts.set(start, (starts.get(start) ?? 0) + 1)
    ends.set(end, (ends.get(end) ?? 0) + 1)
  }
  const out: string[] = []
  for (let i = 0; i <= lines.length; i++) {
    for (let n = ends.get(i) ?? 0; n > 0; n--) out.push('//sampleEnd')
    for (let n = starts.get(i) ?? 0; n > 0; n--) out.push('//sampleStart')
    if (i < lines.length) out.push(lines[i])
  }
  return out.join('\n')
}
