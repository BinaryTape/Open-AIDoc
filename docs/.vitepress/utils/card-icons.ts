/**
 * Icons for Writerside start page cards: `<a type="start">` in a
 * `<spotlight>` shows a picture above its title. Writerside's own 72 px
 * pictures are not openly licensed, so each type maps to a Rescui icon of
 * the same meaning (assets/icons/rescui/, styled in ws-start-page.css).
 *
 * kotlinlang.org draws `install` and `learn` with the same picture; so do we.
 * A type missing here shows no icon: add new upstream types to this table.
 */
const CARD_ICONS: Record<string, string> = {
  start: 'rocket',
  install: 'learn',
  learn: 'learn',
  idea: 'hint',
  'cross-platform': 'computer',
}

export function cardIcon(type: string | undefined): string | undefined {
  return type && Object.hasOwn(CARD_ICONS, type) ? CARD_ICONS[type] : undefined
}
