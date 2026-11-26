/**
 * Where kotlinlang.org and ktor.io (tippy.js, placement "top") show a link's
 * tooltip, measured there (P2-54): 8px above the line of the link, centred on
 * it; below the line, 8px away, when it does not fit above the window's top;
 * moved sideways to keep 5px inside the window.
 */
export const TOOLTIP_GAP = 8
export const TOOLTIP_EDGE = 5

export interface Line {
  left: number
  right: number
  top: number
  bottom: number
}

/** The tooltip's top-left corner in the window, for a tooltip of this size over this line of the link. */
export function tooltipPosition(line: Line, size: { width: number; height: number }, windowWidth: number) {
  const centred = (line.left + line.right) / 2 - size.width / 2
  const x = Math.max(TOOLTIP_EDGE, Math.min(centred, windowWidth - TOOLTIP_EDGE - size.width))
  const below = line.top - TOOLTIP_GAP - size.height < 0
  const y = below ? line.bottom + TOOLTIP_GAP : line.top - TOOLTIP_GAP - size.height
  return { x, y, below }
}
