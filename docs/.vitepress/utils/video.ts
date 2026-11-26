/**
 * YouTube addresses of Writerside videos (P1-12). The sources write a video
 * as `youtube.com/v/<id>`, `youtube.com/watch?v=<id>` or `youtu.be/<id>`;
 * YouTube refuses to show those pages in a frame (X-Frame-Options:
 * SAMEORIGIN), only its embed page, `youtube.com/embed/<id>`.
 */
const YOUTUBE_RE = /^(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:v\/|embed\/|shorts\/|watch\?(?:[^#]*&)?v=)|youtu\.be\/)([\w-]{11})(?![\w-])/i

/** The id of a YouTube video, or undefined for another address. */
export function youtubeId(src: string | undefined): string | undefined {
  return src ? YOUTUBE_RE.exec(src.trim())?.[1] : undefined
}

/** The player, started: it is loaded once the cover is clicked. */
export const youtubeEmbed = (id: string) => `https://www.youtube.com/embed/${id}?autoplay=1`

/** The cover kotlinlang.org shows before the video is played. */
export const youtubeCover = (id: string) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
