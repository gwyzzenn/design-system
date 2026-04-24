/**
 * Redline overlay rendered inside the canvas iframe document.
 * Built imperatively (no React) — cheap + no iframe bundling concerns.
 */
const OVERLAY_ID = '__ds_devmode_overlay__'

interface DrawOptions {
  element: Element
  mode: 'live' | 'pin'
  label?: string
}

const ensureRoot = (): HTMLElement => {
  let root = document.getElementById(OVERLAY_ID) as HTMLElement | null
  if (root) return root
  root = document.createElement('div')
  root.id = OVERLAY_ID
  root.style.cssText = `
    position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;
    font: 11px -apple-system, 'SF Pro Text', system-ui, sans-serif;
  `
  document.body.appendChild(root)
  return root
}

const makeDiv = (cssText: string, text?: string) => {
  const d = document.createElement('div')
  d.style.cssText = cssText
  if (text != null) d.textContent = text
  return d
}

const distanceLabel = (value: number, left: string, top: string, transform: string) =>
  makeDiv(
    `position:absolute;left:${left};top:${top};transform:${transform};
     background:#EC4436;color:#fff;padding:1px 6px;border-radius:3px;
     font-weight:600;font-size:11px;line-height:1.4;
     box-shadow:0 0 0 1px rgba(0,0,0,0.1);white-space:nowrap;`,
    String(Math.round(value)),
  )

const redLine = (cssText: string) =>
  makeDiv(
    `position:absolute;background:repeating-linear-gradient(to right,#EC4436 0 4px,transparent 4px 7px);
     ${cssText}`,
  )

const paddingHatch = (left: number, top: number, width: number, height: number) => {
  if (width <= 0 || height <= 0) return null
  return makeDiv(
    `position:absolute;left:${left}px;top:${top}px;width:${width}px;height:${height}px;
     background:repeating-linear-gradient(-45deg,rgba(0,101,234,0.55) 0 4px,rgba(0,101,234,0.2) 4px 8px);
     pointer-events:none;`,
  )
}

const paddingLabel = (val: number, left: number, top: number) =>
  makeDiv(
    `position:absolute;left:${left}px;top:${top}px;transform:translate(-50%,-50%);
     color:#fff;font-weight:500;font-size:11px;text-shadow:0 1px 2px rgba(0,0,0,0.5);
     pointer-events:none;`,
    String(Math.round(val)),
  )

export function clearOverlay() {
  const root = document.getElementById(OVERLAY_ID)
  if (root) root.remove()
}

export function drawOverlay({ element, mode, label }: DrawOptions) {
  clearOverlay()
  const root = ensureRoot()
  root.dataset.mode = mode

  const rect = element.getBoundingClientRect()
  const parent = element.parentElement?.getBoundingClientRect() ?? null
  const cs = getComputedStyle(element)
  const pad = {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
  }

  // 1. Purple outline around element
  const outline = makeDiv(
    `position:absolute;left:${rect.left - 1}px;top:${rect.top - 1}px;
     width:${rect.width}px;height:${rect.height}px;
     border:1px solid #B668FF;box-shadow:0 0 0 1px rgba(182,104,255,0.3);
     box-sizing:content-box;`,
  )
  root.appendChild(outline)

  // 2. Padding hatching (4 sides, non-overlapping)
  if (pad.top > 0) {
    const n = paddingHatch(rect.left, rect.top, rect.width, pad.top)
    if (n) root.appendChild(n)
  }
  if (pad.bottom > 0) {
    const n = paddingHatch(rect.left, rect.bottom - pad.bottom, rect.width, pad.bottom)
    if (n) root.appendChild(n)
  }
  if (pad.left > 0) {
    const n = paddingHatch(rect.left, rect.top + pad.top, pad.left, rect.height - pad.top - pad.bottom)
    if (n) root.appendChild(n)
  }
  if (pad.right > 0) {
    const n = paddingHatch(
      rect.right - pad.right,
      rect.top + pad.top,
      pad.right,
      rect.height - pad.top - pad.bottom,
    )
    if (n) root.appendChild(n)
  }

  // Padding value labels (center of each hatch)
  if (pad.top >= 10) root.appendChild(paddingLabel(pad.top, rect.left + rect.width / 2, rect.top + pad.top / 2))
  if (pad.bottom >= 10)
    root.appendChild(paddingLabel(pad.bottom, rect.left + rect.width / 2, rect.bottom - pad.bottom / 2))
  if (pad.left >= 10)
    root.appendChild(paddingLabel(pad.left, rect.left + pad.left / 2, rect.top + rect.height / 2))
  if (pad.right >= 10)
    root.appendChild(paddingLabel(pad.right, rect.right - pad.right / 2, rect.top + rect.height / 2))

  // 3. Distance to parent (red lines + labels)
  if (parent) {
    // vertical line through element center to top/bottom
    const cx = rect.left + rect.width / 2
    // top
    if (rect.top > parent.top) {
      root.appendChild(redLine(`left:${cx}px;top:${parent.top}px;width:1px;height:${rect.top - parent.top}px;
        background:repeating-linear-gradient(to bottom,#EC4436 0 4px,transparent 4px 7px);`))
      root.appendChild(
        distanceLabel(rect.top - parent.top, `${cx}px`, `${parent.top + (rect.top - parent.top) / 2}px`, 'translate(-50%,-50%)'),
      )
    }
    // bottom
    if (rect.bottom < parent.bottom) {
      root.appendChild(redLine(`left:${cx}px;top:${rect.bottom}px;width:1px;height:${parent.bottom - rect.bottom}px;
        background:repeating-linear-gradient(to bottom,#EC4436 0 4px,transparent 4px 7px);`))
      root.appendChild(
        distanceLabel(
          parent.bottom - rect.bottom,
          `${cx}px`,
          `${rect.bottom + (parent.bottom - rect.bottom) / 2}px`,
          'translate(-50%,-50%)',
        ),
      )
    }
    const cy = rect.top + rect.height / 2
    // left
    if (rect.left > parent.left) {
      root.appendChild(redLine(`left:${parent.left}px;top:${cy}px;width:${rect.left - parent.left}px;height:1px;`))
      root.appendChild(
        distanceLabel(rect.left - parent.left, `${parent.left + (rect.left - parent.left) / 2}px`, `${cy}px`, 'translate(-50%,-50%)'),
      )
    }
    // right
    if (rect.right < parent.right) {
      root.appendChild(redLine(`left:${rect.right}px;top:${cy}px;width:${parent.right - rect.right}px;height:1px;`))
      root.appendChild(
        distanceLabel(
          parent.right - rect.right,
          `${rect.right + (parent.right - rect.right) / 2}px`,
          `${cy}px`,
          'translate(-50%,-50%)',
        ),
      )
    }
    // parent outline (faint dashed)
    root.appendChild(
      makeDiv(
        `position:absolute;left:${parent.left}px;top:${parent.top}px;width:${parent.width}px;height:${parent.height}px;
         border:1px dashed rgba(182,104,255,0.4);pointer-events:none;box-sizing:border-box;`,
      ),
    )
  }

  // 4. Property badge above element
  if (label) {
    const badge = makeDiv(
      `position:absolute;left:${rect.left}px;top:${rect.top - 24}px;
       background:#B668FF;color:#fff;padding:2px 8px;border-radius:4px;
       font-size:11px;font-weight:500;display:inline-flex;align-items:center;gap:4px;
       box-shadow:0 2px 6px rgba(0,0,0,0.2);pointer-events:none;white-space:nowrap;`,
      label,
    )
    // diamond icon
    const icon = makeDiv(
      `width:8px;height:8px;background:#fff;transform:rotate(45deg);display:inline-block;margin-right:2px;`,
    )
    badge.prepend(icon)
    root.appendChild(badge)
  }
}
