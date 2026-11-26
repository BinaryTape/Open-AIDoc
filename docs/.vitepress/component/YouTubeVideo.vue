<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useData } from 'vitepress'
import { youtubeCover, youtubeEmbed } from '../utils/video'

/**
 * A Writerside video, as kotlinlang.org shows it (P1-12): its cover with a
 * play button, in a 1px border, as wide as `width` (560px when not written)
 * and never wider than the text. A YouTube video is 16:9; a file of the docs
 * has its cover's shape. The video is loaded once the cover is clicked: a
 * YouTube player in a frame, a file in the browser's own player.
 *
 * Props come from markdown-it-ws-video.
 */
const props = defineProps<{
  youtube?: string
  src?: string
  poster?: string
  title?: string
  width?: string
  naturalWidth?: string
  naturalHeight?: string
}>()

const { lang } = useData()
const playing = ref(false)
const media = ref<HTMLElement | null>(null)

const width = computed(() => Number(props.width) || 560)
const ratio = computed(() => props.naturalWidth && props.naturalHeight ? `${props.naturalWidth} / ${props.naturalHeight}` : '16 / 9')
const cover = computed(() => props.youtube ? youtubeCover(props.youtube) : props.poster)

const LABELS: Record<string, string> = {
  'zh-Hans': '播放视频',
  'zh-Hant': '播放影片',
  ja: '動画を再生',
  ko: '동영상 재생',
}
const label = computed(() => {
  const play = LABELS[lang.value] ?? 'Play video'
  return props.title ? `${play}: ${props.title}` : play
})

function play() {
  playing.value = true
  // The button is gone: keep the keyboard on the video.
  nextTick(() => media.value?.focus())
}
</script>

<template>
  <div class="ws-video" :style="{ width: `${width}px` }">
    <div class="ws-video__frame" :style="{ aspectRatio: ratio }">
      <iframe
        v-if="playing && youtube"
        ref="media"
        :src="youtubeEmbed(youtube)"
        :title="title"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
      <video
        v-else-if="playing"
        ref="media"
        :src="src"
        :poster="poster"
        :aria-label="title"
        controls
        autoplay
        playsinline
      ></video>
      <button v-else type="button" class="ws-video__cover" :aria-label="label" @click="play">
        <img v-if="cover" class="ws-video__poster" :src="cover" alt="" loading="lazy" decoding="async">
        <span class="ws-video__button" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7L8 5z" /></svg>
        </span>
      </button>
    </div>
  </div>
</template>

<style>
/* Measured on kotlinlang.org (.video-player): a 1px border, dark grey behind
   the cover, a 48px play button in the site's purple with a dark triangle,
   80% opaque under the pointer. */
.ws-video {
  --ws-video-border: #d1d1d2;
  --ws-video-primary: #7f52ff;
  --ws-video-primary-dim: rgba(127, 82, 255, 0.8);
  position: relative;
  box-sizing: border-box;
  max-width: 100%;
  margin: 16px 0;
  overflow: hidden;
  border: 1px solid var(--ws-video-border);
  background-color: #252528;
  background-clip: padding-box;
}

.dark .ws-video {
  --ws-video-border: #474749;
}

.ws-video__frame {
  position: relative;
  width: 100%;
}

.vp-doc .ws-video__frame > iframe,
.vp-doc .ws-video__frame > video,
.ws-video__cover {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
}

.ws-video__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: none;
  cursor: pointer;
}

.vp-doc .ws-video__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  margin: 0;
  object-fit: cover;
}

.ws-video__button {
  position: relative;
  display: block;
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  padding: 12px;
  border-radius: 25px;
  background-color: var(--ws-video-primary);
  transition: background-color 0.1s;
}

.ws-video__button svg {
  display: block;
  width: 24px;
  height: 24px;
  fill: #19191c;
}

.ws-video__cover:hover .ws-video__button {
  background-color: var(--ws-video-primary-dim);
}

.ws-video__cover:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: -2px;
}
</style>
