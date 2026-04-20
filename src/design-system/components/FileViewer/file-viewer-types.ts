import * as React from 'react'

/**
 * FileViewer — shared types
 *
 * 單獨檔避免 file-viewer.tsx 跟 renderer 檔之間的 circular import
 * (renderer 檔需要 FileInfo / FileRendererProps,shell 也需要 FileRenderer
 * interface 做 registry iteration)。
 */

export interface FileInfo {
  id: string
  url: string
  name: string
  mimeType: string
  /** Bytes。consumer 負責格式化,shell 只呈現 formatted 字串。 */
  size?: number
  /** 描述文字,顯示於 InfoPanel(consumer 透過 onDescriptionChange 持久化)。 */
  description?: string
  /** 自由 metadata 欄位,InfoPanel 逐行呈現 key: value。 */
  metadata?: Record<string, string | number>
}

/**
 * Renderer 能力宣告 — 告訴 shell 目前 renderer 支援哪些 toolbar affordances。
 * Shell 根據這個 object 動態決定 toolbar 顯示(zoom controls / page nav 等)。
 */
export interface FileRendererCapabilities {
  /** 是否支援 zoom(shell 據此顯示 ZoomInput)。 */
  zoom: boolean
  /** 是否支援旋轉(預留給未來 PDF / Image rotate)。 */
  rotate?: boolean
  /** PDF 專用:當前頁 / 總頁數。預留。 */
  pageNumber?: { current: number; total: number }
}

export interface FileRendererProps {
  file: FileInfo
  /** 當前 zoom(%);shell own state,passed down 給 renderer。 */
  zoom: number
  /** Renderer 內部 zoom 變化時呼叫(wheel / pinch)。 */
  onZoomChange: (next: number) => void
  /**
   * Renderer 在 mount 或 file/capability 改變時呼叫,告訴 shell 目前支援哪些
   * capability。不 emit 代表 shell 維持上一個 renderer 的 capability(第一個
   * renderer mount 時必須 emit)。
   */
  onCapabilitiesChange: (caps: FileRendererCapabilities) => void
}

export interface FileRenderer {
  /** unique id(registry debug 用)。 */
  id: string
  canRender: (file: FileInfo) => boolean
  component: React.ComponentType<FileRendererProps>
}
