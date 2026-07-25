/**
 * Theme UI translations for each language
 * Includes: lastUpdated, editLink, pagination
 */
export const THEME_TRANSLATIONS: Record<string, {
  lastUpdated: string
  editLink: string
  prev: string
  next: string
}> = {
  'zh-Hans': {
    lastUpdated: '上次更新',
    editLink: '编辑此页',
    prev: '上一页',
    next: '下一页',
  },
  'zh-Hant': {
    lastUpdated: '最後更新',
    editLink: '編輯此頁',
    prev: '上一頁',
    next: '下一頁',
  },
  'ja': {
    lastUpdated: '最終更新日',
    editLink: 'このページを編集',
    prev: '前のページ',
    next: '次のページ',
  },
  'ko': {
    lastUpdated: '마지막 업데이트',
    editLink: '이 페이지 편집',
    prev: '이전 페이지',
    next: '다음 페이지',
  }
}

/**
 * Generate editLink pattern URL
 * Note: VitePress :path already includes locale prefix for non-root locales,
 * so we use the same pattern for all locales
 * @returns GitHub edit link pattern
 */
export function getEditLinkPattern(): string {
  return 'https://github.com/BinaryTape/Open-AIDoc/blob/main/docs/:path'
}
