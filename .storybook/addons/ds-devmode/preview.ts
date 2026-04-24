/**
 * Canvas-side entry. Runs inside the Storybook iframe.
 * Listens for mode changes, binds DOM listeners, emits inspect payload,
 * renders redline overlay.
 */
import { addons } from '@storybook/preview-api'
import { measureElement } from './utils/dom-geometry'
import { extractComputed } from './utils/computed-style'
import { annotateWithTokens } from './utils/token-reverse-lookup'
import { drawOverlay, clearOverlay } from './utils/overlay'
import { EVENTS, type DevmodeMode, type InspectPayload } from './constants'

let mode: DevmodeMode = 'off'
let pinnedEl: Element | null = null
let hoverEl: Element | null = null

const channel = addons.getChannel()

const isInspectableTarget = (t: EventTarget | null): t is Element => {
  if (!(t instanceof Element)) return false
  if (t.closest('#__ds_devmode_overlay__')) return false
  // skip storybook root wrappers
  if (t.id === 'storybook-root') return false
  return true
}

const build = (el: Element): InspectPayload => {
  const geom = measureElement(el)
  const computed = extractComputed(el)
  const merged: Record<string, string> = { ...computed.layout, ...computed.style }
  const tokens = annotateWithTokens(merged)
  return {
    ...geom,
    computed: merged,
    tokenUsage: tokens.map(t => ({
      property: t.property,
      raw: t.raw,
      tokens: t.tokens,
      resolved: t.resolved,
    })),
  }
}

const emit = (el: Element) => {
  const payload = build(el)
  channel.emit(EVENTS.INSPECT, payload)
  drawOverlay({
    element: el,
    mode: mode === 'pin' ? 'pin' : 'live',
    label: payload.id ? `#${payload.id}` : payload.className ? `.${String(payload.className).split(/\s+/)[0]}` : payload.tag,
  })
}

const onMouseOver = (e: MouseEvent) => {
  if (mode !== 'live') return
  if (!isInspectableTarget(e.target)) return
  if (hoverEl === e.target) return
  hoverEl = e.target as Element
  emit(hoverEl)
}

const onClick = (e: MouseEvent) => {
  if (mode === 'off') return
  if (!isInspectableTarget(e.target)) return
  e.preventDefault()
  e.stopPropagation()
  pinnedEl = e.target as Element
  mode = 'pin'
  channel.emit(EVENTS.TOGGLE, mode)
  emit(pinnedEl)
}

const onKey = (e: KeyboardEvent) => {
  // Alt+I toggles inspect
  if (e.altKey && (e.key === 'i' || e.key === 'I')) {
    e.preventDefault()
    const next: DevmodeMode = mode === 'off' ? 'live' : 'off'
    setMode(next)
  }
  // Esc clears pin
  if (e.key === 'Escape' && mode === 'pin') {
    pinnedEl = null
    setMode('live')
  }
}

const bind = () => {
  document.addEventListener('mouseover', onMouseOver, true)
  document.addEventListener('click', onClick, true)
  document.addEventListener('keydown', onKey, true)
}

const unbind = () => {
  document.removeEventListener('mouseover', onMouseOver, true)
  document.removeEventListener('click', onClick, true)
  document.removeEventListener('keydown', onKey, true)
}

const setMode = (next: DevmodeMode) => {
  mode = next
  channel.emit(EVENTS.TOGGLE, next)
  if (next === 'off') {
    clearOverlay()
    pinnedEl = null
    hoverEl = null
    channel.emit(EVENTS.CLEAR)
    unbind()
  } else {
    bind()
    if (next === 'live' && hoverEl) emit(hoverEl)
    if (next === 'pin' && pinnedEl) emit(pinnedEl)
  }
}

// Listen to manager → preview mode changes
channel.on(EVENTS.TOGGLE, (next: DevmodeMode) => {
  if (next !== mode) setMode(next)
})

channel.on(EVENTS.CLEAR, () => {
  pinnedEl = null
  hoverEl = null
  clearOverlay()
})

// Keep overlay accurate on scroll / resize when pinned
window.addEventListener('scroll', () => {
  if (mode === 'pin' && pinnedEl) emit(pinnedEl)
}, true)
window.addEventListener('resize', () => {
  if (mode === 'pin' && pinnedEl) emit(pinnedEl)
  else if (mode === 'live' && hoverEl) emit(hoverEl)
})
