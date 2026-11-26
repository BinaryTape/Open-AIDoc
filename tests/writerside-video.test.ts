import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMarkdownRenderer, type MarkdownRenderer } from 'vitepress'
import { registerMarkdownPlugins } from '../docs/.vitepress/config/markdown.config'
import { youtubeCover, youtubeEmbed, youtubeId } from '../docs/.vitepress/utils/video'
import YouTubeVideo from '../docs/.vitepress/component/YouTubeVideo.vue'

const lang = vi.hoisted(() => ({ value: 'zh-Hans' }))
vi.mock('vitepress', async (original) => ({ ...(await original<object>()), useData: () => ({ lang }) }))

// Writerside videos did not play: YouTube refuses to be framed at the
// /v/, watch?v= and youtu.be addresses the sources use, the frame was 150px
// high, and a file of the docs was looked up under the locale (P1-12).
describe('markdown-it-ws-video', () => {
  let md: MarkdownRenderer
  beforeAll(async () => {
    md = await createMarkdownRenderer('docs', {
      attrs: { leftDelimiter: '{', rightDelimiter: '}', allowedAttributes: [] },
      config: (m) => registerMarkdownPlugins(m),
    })
  })
  const render = (src: string, relativePath: string) => md.renderAsync(src, { relativePath, cleanUrls: true })
  const videos = (html: string) => html.match(/<YouTubeVideo\b[^>]*\/>/g) ?? []

  it('gives the player the YouTube id of a /v/ address (kotlin collections-overview)', async () => {
    const html = await render('<video src="https://www.youtube.com/v/F8jj7e-_jFA" title="Kotlin Collections Overview"/>\n', 'kotlin/collections-overview.md')
    expect(videos(html)).toEqual(['<YouTubeVideo youtube="F8jj7e-_jFA" title="Kotlin Collections Overview"/>'])
    expect(html).not.toContain('<video')
  })

  it('reads watch?v= and youtu.be addresses too, and keeps the width (kmp kmp-overview)', async () => {
    const html = await render(
      '<video src="https://www.youtube.com/watch?v=LB5a2FRrT94" width="700"/>\n\n<video src="https://youtu.be/ACmerPEQAWA" width="700"/>\n',
      'ja/kmp/kmp-overview.md',
    )
    expect(videos(html)).toEqual(['<YouTubeVideo youtube="LB5a2FRrT94" width="700"/>', '<YouTubeVideo youtube="ACmerPEQAWA" width="700"/>'])
  })

  it('leaves the height to the player, 16:9 as on kotlinlang.org (kotlin advent-of-code)', async () => {
    const html = await render('<video width="560" height="315" src="https://www.youtube.com/v/6-XSehwRgSY" title="Get Ready for Advent of Code 2021"/>\n', 'kotlin/advent-of-code.md')
    expect(videos(html)).toEqual(['<YouTubeVideo youtube="6-XSehwRgSY" title="Get Ready for Advent of Code 2021" width="560"/>'])
  })

  it('serves a file of the docs, and its cover, from the doc on every locale (kmp compose-previews)', async () => {
    const source = '<video src="compose_preview_interactive_mode.mp4" alt="交互模式" width="350" preview-src="compose_preview_interactive_mode.png"/>\n'
    const expected = '<YouTubeVideo src="/kmp/compose_preview_interactive_mode.mp4" poster="/kmp/compose_preview_interactive_mode.png" title="交互模式" width="350" natural-width="570" natural-height="786"/>'
    expect(videos(await render(source, 'kmp/compose-previews.md'))).toEqual([expected])
    expect(videos(await render(source, 'ko/kmp/compose-previews.md'))).toEqual([expected])
  })

  it('finds a video in a list item and among other HTML (kotlin whatsnew20)', async () => {
    const html = await render('1. 观看视频：\n\n   <video src="https://www.youtube.com/v/Ar73Axsz2YA" title="Kotlin 2.0"/>\n2. 下一步\n', 'kotlin/whatsnew20.md')
    expect(videos(html)).toEqual(['<YouTubeVideo youtube="Ar73Axsz2YA" title="Kotlin 2.0"/>'])
  })

  it('leaves the pages that are not Writerside', async () => {
    const html = await render('<video width="360" height="640" autoplay loop muted playsinline>\n<source src="a.mp4" type="video/mp4">\n</video>\n', 'coil/recipes.md')
    expect(html).toContain('<video width="360"')
    expect(html).not.toContain('YouTubeVideo')
  })
})

describe('youtubeId', () => {
  it('reads the forms of YouTube addresses', () => {
    for (const src of [
      'https://www.youtube.com/v/F8jj7e-_jFA',
      'https://www.youtube.com/watch?v=F8jj7e-_jFA',
      'https://www.youtube.com/watch?feature=share&v=F8jj7e-_jFA',
      'https://youtu.be/F8jj7e-_jFA',
      'https://www.youtube.com/embed/F8jj7e-_jFA?rel=0',
      'https://www.youtube-nocookie.com/embed/F8jj7e-_jFA',
    ]) expect(youtubeId(src), src).toBe('F8jj7e-_jFA')
  })

  it('is undefined for other addresses', () => {
    for (const src of ['compose_preview_interactive_mode.mp4', 'https://vimeo.com/12345678', 'https://www.youtube.com/channel/UCP7uiEZIqci43m22KDl0sNw', undefined]) {
      expect(youtubeId(src), String(src)).toBeUndefined()
    }
  })

  it('embeds the player and shows the cover kotlinlang.org shows', () => {
    expect(youtubeEmbed('F8jj7e-_jFA')).toBe('https://www.youtube.com/embed/F8jj7e-_jFA?autoplay=1')
    expect(youtubeCover('F8jj7e-_jFA')).toBe('https://img.youtube.com/vi/F8jj7e-_jFA/maxresdefault.jpg')
  })
})

describe('YouTubeVideo', () => {
  const ssr = (props: Record<string, unknown>) => renderToString(createSSRApp(() => h(YouTubeVideo, props)))

  it('starts on the cover with a play button, 560px wide and 16:9, without loading YouTube', async () => {
    lang.value = 'zh-Hans'
    const html = await ssr({ youtube: 'F8jj7e-_jFA', title: 'Kotlin Collections Overview' })
    expect(html).toMatch(/^<div class="ws-video" style="width:560px;"><div class="ws-video__frame" style="aspect-ratio:16 \/ 9;">/)
    expect(html).toContain('<button type="button" class="ws-video__cover" aria-label="播放视频: Kotlin Collections Overview">')
    expect(html).toContain('<img class="ws-video__poster" src="https://img.youtube.com/vi/F8jj7e-_jFA/maxresdefault.jpg" alt="" loading="lazy" decoding="async">')
    expect(html).toContain('<span class="ws-video__button" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z"></path></svg></span>')
    expect(html).not.toContain('<iframe')
  })

  it('gives a file its cover\'s shape, and labels the button in the page\'s language', async () => {
    lang.value = 'ja'
    const html = await ssr({ src: '/kmp/a.mp4', poster: '/kmp/a.png', title: 'Interactive mode', width: '350', naturalWidth: '570', naturalHeight: '786' })
    expect(html).toMatch(/^<div class="ws-video" style="width:350px;"><div class="ws-video__frame" style="aspect-ratio:570 \/ 786;">/)
    expect(html).toContain('aria-label="動画を再生: Interactive mode"')
    expect(html).toContain('src="/kmp/a.png"')
    expect(html).not.toContain('<video')
  })
})
