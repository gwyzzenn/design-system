import type { InspectPayload } from '../constants'

const pxFromStyle = (s: string) => {
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function measureElement(el: Element): InspectPayload {
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const parent = el.parentElement
  const pr = parent ? parent.getBoundingClientRect() : null

  const padding = {
    top: pxFromStyle(cs.paddingTop),
    right: pxFromStyle(cs.paddingRight),
    bottom: pxFromStyle(cs.paddingBottom),
    left: pxFromStyle(cs.paddingLeft),
  }
  const margin = {
    top: pxFromStyle(cs.marginTop),
    right: pxFromStyle(cs.marginRight),
    bottom: pxFromStyle(cs.marginBottom),
    left: pxFromStyle(cs.marginLeft),
  }
  const border = {
    top: pxFromStyle(cs.borderTopWidth),
    right: pxFromStyle(cs.borderRightWidth),
    bottom: pxFromStyle(cs.borderBottomWidth),
    left: pxFromStyle(cs.borderLeftWidth),
  }

  const distancesToParent = pr
    ? {
        top: Math.round(r.top - pr.top),
        right: Math.round(pr.right - r.right),
        bottom: Math.round(pr.bottom - r.bottom),
        left: Math.round(r.left - pr.left),
      }
    : null

  return {
    tag: el.tagName.toLowerCase(),
    className: typeof el.className === 'string' ? el.className : (el as HTMLElement).getAttribute?.('class') ?? '',
    id: el.id || '',
    rect: { x: r.left, y: r.top, width: r.width, height: r.height },
    parentRect: pr ? { x: pr.left, y: pr.top, width: pr.width, height: pr.height } : null,
    distancesToParent,
    padding,
    margin,
    border,
    computed: {}, // filled in Stage 2
    tokenUsage: [], // filled in Stage 2
  }
}
