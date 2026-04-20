import * as React from 'react'
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch'
import type { FileRendererProps } from './file-viewer-types'

/**
 * ImageRenderer — FileViewer 的圖片 renderer。
 *
 * 世界級對照:Google Photos / Dropbox / Figma(file preview)/ macOS Preview.app
 * 共同行為:scroll-wheel zoom / drag-to-pan when zoomed / 預設 fit-to-page /
 * double-click to toggle 100%。
 *
 * ── 為什麼消費 react-zoom-pan-pinch ──
 * Zoom + pan 是行為 primitive,視覺 chrome(toolbar / zoom input)由 shell 提供。
 * 自己寫 pinch / wheel event 正確處理會踩大量 edge case(trackpad vs mouse /
 * momentum / bounds 邊界 / CLS),react-zoom-pan-pinch 是 canonical 解法
 * (世界級產品 Figma Community / Miro embed / PhotoSwipe 同類流派)。
 *
 * ── Capability 宣告 ──
 * 透過 onCapabilitiesChange 告訴 shell:本 renderer 支援 zoom,toolbar 顯示
 * zoom input。未來 PDF renderer 會額外回報 pageNumber,shell 根據 capability
 * 動態決定 toolbar 內容。
 */

const MIN_SCALE = 0.1 // 10%
const MAX_SCALE = 4.0 // 400%

export const ImageRenderer: React.FC<FileRendererProps> = ({
  file,
  zoom,
  onZoomChange,
  onCapabilitiesChange,
}) => {
  const apiRef = React.useRef<ReactZoomPanPinchRef | null>(null)

  // 宣告 capability — shell 用此決定 toolbar 內容。
  // 只 emit 一次(mount),後續 capability 不變。
  React.useEffect(() => {
    onCapabilitiesChange({ zoom: true })
  }, [onCapabilitiesChange])

  // 外部 zoom 變動(user 打字 / 按 preset)→ 同步到 TransformWrapper。
  // react-zoom-pan-pinch v3 的 state 由 `state` (ReactZoomPanPinchRef['state']) 讀取,
  // 不再是 `instance.transformState`。
  React.useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const currentScale = api.state.scale
    const targetScale = zoom / 100
    if (Math.abs(currentScale - targetScale) > 0.01) {
      api.setTransform(api.state.positionX, api.state.positionY, targetScale, 200)
    }
  }, [zoom])

  // TransformWrapper 內部 zoom 變動(wheel / pinch)→ 同步回 shell
  const handleTransformed = React.useCallback(
    (_ref: ReactZoomPanPinchRef, state: { scale: number }) => {
      const nextZoom = Math.round(state.scale * 100)
      if (nextZoom !== zoom) {
        onZoomChange(nextZoom)
      }
    },
    [zoom, onZoomChange],
  )

  return (
    <TransformWrapper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={apiRef as any}
      initialScale={zoom / 100}
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      centerOnInit
      centerZoomedOut
      limitToBounds={false}
      wheel={{ step: 0.15 }}
      doubleClick={{ mode: 'reset' }}
      onTransform={handleTransformed}
    >
      <TransformComponent
        wrapperClass="!w-full !h-full"
        contentClass="!w-full !h-full flex items-center justify-center"
      >
        <img
          src={file.url}
          alt={file.name}
          draggable={false}
          className="max-w-full max-h-full object-contain select-none"
          style={{ pointerEvents: 'none' }}
        />
      </TransformComponent>
    </TransformWrapper>
  )
}
ImageRenderer.displayName = 'ImageRenderer'

const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp', 'ico'])

/** 判斷檔案是否可用 ImageRenderer 渲染。 */
export function canRenderImage(file: { mimeType: string; name: string }): boolean {
  if (file.mimeType.startsWith('image/')) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext ? IMAGE_EXTS.has(ext) : false
}
