// FCMT(建廠計劃與物料追蹤管理系統)prototype — 共用型別 + mock 資料 + 狀態 meta
// 對應 PRD v0.1 附錄 A(Tracking Item)/ 附錄 B(Sub-Item)/ 第 6 章狀態機。
// 純資料檔,無 JSX——被 TrackingItemList / TrackingItemDetail 兩個 exploration story 共用。

import type { CategoricalColor } from '@/design-system/tokens/categorical-color'

// ── 狀態機(PRD 6.1)──────────────────────────────────────────────────────────

export type TrackingStatus =
  | 'draft'
  | 'submitted'
  | 'rejected'
  | 'approved'
  | 'ordered'
  | 'inProduction'
  | 'shipped'
  | 'arrived'
  | 'inspected'
  | 'installed'
  | 'closed'
  | 'onHold'
  | 'cancelled'

export interface StatusMeta {
  label: string
  /** PRD 6.1「設計約束」：狀態必歸「生命週期」或「流程」其中一族 */
  family: 'lifecycle' | 'process'
  /** Tag 消費 categorical-color SSOT——本表是 FCMT 產品層對 hue 的固定語意指派(非 Tag 自身語意) */
  tagColor: CategoricalColor
  tagSolid: boolean
  /** 依 PRD 6.2 roll-up 預設完成百分比 */
  defaultProgressPct: number
  progressBarStatus: 'inProgress' | 'success' | 'error'
  /** 允許轉移至(PRD 6.1 狀態機表,M3-3 非法轉移必須被系統阻擋) */
  allowedNext: TrackingStatus[]
}

export const STATUS_META: Record<TrackingStatus, StatusMeta> = {
  draft: { label: '草稿', family: 'lifecycle', tagColor: 'purple', tagSolid: false, defaultProgressPct: 0, progressBarStatus: 'inProgress', allowedNext: ['submitted'] },
  submitted: { label: '待審', family: 'lifecycle', tagColor: 'turquoise', tagSolid: false, defaultProgressPct: 5, progressBarStatus: 'inProgress', allowedNext: ['approved', 'rejected'] },
  rejected: { label: '退回', family: 'lifecycle', tagColor: 'deep-orange', tagSolid: true, defaultProgressPct: 0, progressBarStatus: 'error', allowedNext: ['draft'] },
  approved: { label: '已核准', family: 'lifecycle', tagColor: 'green', tagSolid: false, defaultProgressPct: 10, progressBarStatus: 'inProgress', allowedNext: ['ordered'] },
  ordered: { label: '已下單', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 20, progressBarStatus: 'inProgress', allowedNext: ['inProduction', 'cancelled'] },
  inProduction: { label: '生產中', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 35, progressBarStatus: 'inProgress', allowedNext: ['shipped', 'onHold'] },
  shipped: { label: '已出貨', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 50, progressBarStatus: 'inProgress', allowedNext: ['arrived'] },
  arrived: { label: '已到廠', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 70, progressBarStatus: 'inProgress', allowedNext: ['inspected'] },
  inspected: { label: '已驗收', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 85, progressBarStatus: 'inProgress', allowedNext: ['installed'] },
  installed: { label: '已安裝', family: 'process', tagColor: 'blue', tagSolid: true, defaultProgressPct: 95, progressBarStatus: 'inProgress', allowedNext: ['closed'] },
  closed: { label: '結案', family: 'lifecycle', tagColor: 'green', tagSolid: true, defaultProgressPct: 100, progressBarStatus: 'success', allowedNext: [] },
  onHold: { label: '暫停', family: 'process', tagColor: 'deep-orange', tagSolid: false, defaultProgressPct: 0, progressBarStatus: 'error', allowedNext: ['cancelled'] },
  cancelled: { label: '取消', family: 'lifecycle', tagColor: 'neutral', tagSolid: false, defaultProgressPct: 0, progressBarStatus: 'error', allowedNext: [] },
}

// PRD 6.1「On Hold 回到暫停前狀態」——暫停前狀態需另存,onHold 的 allowedNext 在 runtime 動態附加

// ── 附錄 A:Tracking Item ──────────────────────────────────────────────────

export interface TrackingItem {
  id: string
  trackingNo: string
  siteId: string
  siteLabel: string
  zoneId: string
  zoneLabel: string
  materialName: string
  specNote?: string
  quantity: number
  unit: string
  supplier?: string
  poNo?: string
  status: TrackingStatus
  progressPct: number
  ownerName: string
  ownerColor: CategoricalColor
  requiredDate: string
  baselineDate: string
  forecastDate: string
  actualDate?: string
  remark?: string
  holdReason?: string
}

export function delayDays(item: TrackingItem): number {
  const ref = item.actualDate ?? item.forecastDate
  const a = new Date(ref).getTime()
  const b = new Date(item.baselineDate).getTime()
  return Math.round((a - b) / 86400000)
}

// ── 附錄 B:Sub-Item ───────────────────────────────────────────────────────

export type SubItemStatus = 'notStarted' | 'inProgress' | 'pending' | 'completed'

export interface SubItem {
  id: string
  parentTrackingId: string
  subType: '分批交貨' | '工序' | '明細料號'
  seq: number
  name: string
  baselineDate: string
  forecastDate: string
  actualDate?: string
  status: SubItemStatus
  ownerName: string
}

export const SUB_ITEM_STATUS_LABEL: Record<SubItemStatus, string> = {
  notStarted: '未開始',
  inProgress: '進行中',
  pending: '待處理',
  completed: '已完成',
}

// ── 變更歷程(M3-6)──────────────────────────────────────────────────────────

export interface ChangeRecord {
  id: string
  trackingId: string
  at: string
  by: string
  field: string
  from: string
  to: string
}

// ── Zone 主檔(多階,對應 5.2)──────────────────────────────────────────────

export interface ZoneNode {
  id: string
  label: string
  children?: ZoneNode[]
}

export const ZONE_TREE: ZoneNode = {
  id: 'f22-p1',
  label: 'F22 Phase 1',
  children: [
    {
      id: 'cl-3f',
      label: 'CL-3F 無塵室機電',
      children: [
        { id: 'z-hvac', label: '空調系統 HVAC' },
        { id: 'z-cds', label: '化學品供應 CDS' },
        { id: 'z-upw', label: '純水系統 UPW' },
      ],
    },
    {
      id: 'cl-2f',
      label: 'CL-2F 製程區',
      children: [
        { id: 'z-bulkgas', label: '特氣站 Bulk Gas' },
        { id: 'z-scrubber', label: '廢氣處理 Scrubber' },
        { id: 'z-efem', label: 'EFEM 介面模組' },
      ],
    },
    {
      id: 'b1f',
      label: 'B1F 動力站',
      children: [
        { id: 'z-switchgear', label: '電力配電盤 Switchgear' },
        { id: 'z-rfl', label: '高架地板系統' },
      ],
    },
  ],
}

// ── Mock 追蹤單(13 筆,涵蓋全部狀態,真實建廠採購場景)──────────────────────

const owners: Array<{ name: string; color: CategoricalColor }> = [
  { name: '林建宏', color: 'blue' },
  { name: '陳怡君', color: 'magenta' },
  { name: '王振宇', color: 'green' },
  { name: '張雅婷', color: 'amber' },
  { name: '李承翰', color: 'indigo' },
]

export const TRACKING_ITEMS: TrackingItem[] = [
  {
    id: 't1', trackingNo: 'F22-CL3F-0031', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-hvac', zoneLabel: 'CL-3F / 空調系統 HVAC',
    materialName: 'AHU-03 空調機組採購', specNote: '風量 12,000 CMH,含變頻控制盤',
    quantity: 2, unit: '台', supplier: '台達能源工程', poNo: 'PO-2026-3381',
    status: 'inProduction', progressPct: 35,
    ownerName: owners[0].name, ownerColor: owners[0].color,
    requiredDate: '2026-09-15', baselineDate: '2026-08-20', forecastDate: '2026-08-25',
    remark: '第二批機組交期需對齊 CL-3F 機電進場排程',
  },
  {
    id: 't2', trackingNo: 'F22-CL3F-0018', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-hvac', zoneLabel: 'CL-3F / 空調系統 HVAC',
    materialName: 'AHU-01 空調機組(第一批)', quantity: 3, unit: '台',
    supplier: '台達能源工程', poNo: 'PO-2026-3120',
    status: 'closed', progressPct: 100,
    ownerName: owners[0].name, ownerColor: owners[0].color,
    requiredDate: '2026-06-10', baselineDate: '2026-06-05', forecastDate: '2026-06-05', actualDate: '2026-06-05',
  },
  {
    id: 't3', trackingNo: 'F22-CL3F-0042', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-cds', zoneLabel: 'CL-3F / 化學品供應 CDS',
    materialName: 'CDS-02 化學品供應系統主機', quantity: 1, unit: '套',
    supplier: '中央流體科技', poNo: 'PO-2026-3402',
    status: 'shipped', progressPct: 50,
    ownerName: owners[1].name, ownerColor: owners[1].color,
    requiredDate: '2026-09-01', baselineDate: '2026-08-10', forecastDate: '2026-08-10',
  },
  {
    id: 't4', trackingNo: 'F22-CL3F-0055', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-upw', zoneLabel: 'CL-3F / 純水系統 UPW',
    materialName: 'UPW-01 純水系統(RO+EDI 主機)', quantity: 1, unit: '套',
    supplier: '國瑞水處理', poNo: 'PO-2026-3410',
    status: 'arrived', progressPct: 70,
    ownerName: owners[2].name, ownerColor: owners[2].color,
    requiredDate: '2026-08-01', baselineDate: '2026-07-20', forecastDate: '2026-07-23', actualDate: '2026-07-23',
    remark: '延遲 3 天,原因:海運延誤',
  },
  {
    id: 't5', trackingNo: 'F22-CL3F-0061', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-upw', zoneLabel: 'CL-3F / 純水系統 UPW',
    materialName: 'UPW-02 純水系統(第二套)', quantity: 1, unit: '套',
    supplier: '國瑞水處理',
    status: 'approved', progressPct: 10,
    ownerName: owners[2].name, ownerColor: owners[2].color,
    requiredDate: '2026-10-15', baselineDate: '2026-09-01', forecastDate: '2026-09-01',
  },
  {
    id: 't6', trackingNo: 'F22-CL2F-0073', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-bulkgas', zoneLabel: 'CL-2F / 特氣站 Bulk Gas',
    materialName: 'BGC-05 特氣站氣瓶櫃', quantity: 4, unit: '座',
    supplier: '大宇氣體設備', poNo: 'PO-2026-3455',
    status: 'ordered', progressPct: 20,
    ownerName: owners[3].name, ownerColor: owners[3].color,
    requiredDate: '2026-09-20', baselineDate: '2026-09-05', forecastDate: '2026-09-05',
  },
  {
    id: 't7', trackingNo: 'F22-CL2F-0080', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-bulkgas', zoneLabel: 'CL-2F / 特氣站 Bulk Gas',
    materialName: 'BGC-06 特氣站氣瓶櫃(二期)', quantity: 4, unit: '座',
    supplier: '大宇氣體設備', poNo: 'PO-2026-3390',
    status: 'inspected', progressPct: 85,
    ownerName: owners[3].name, ownerColor: owners[3].color,
    requiredDate: '2026-08-15', baselineDate: '2026-08-01', forecastDate: '2026-08-01', actualDate: '2026-08-01',
  },
  {
    id: 't8', trackingNo: 'F22-CL2F-0091', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-scrubber', zoneLabel: 'CL-2F / 廢氣處理 Scrubber',
    materialName: 'SCB-01 酸性廢氣洗滌塔', quantity: 1, unit: '座',
    supplier: '潔淨環工',
    status: 'submitted', progressPct: 5,
    ownerName: owners[0].name, ownerColor: owners[0].color,
    requiredDate: '2026-10-01', baselineDate: '2026-09-10', forecastDate: '2026-09-10',
  },
  {
    id: 't9', trackingNo: 'B1F-SWG-0012', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-switchgear', zoneLabel: 'B1F / 電力配電盤 Switchgear',
    materialName: 'SWG-02 低壓電力配電盤', quantity: 6, unit: '面',
    status: 'draft', progressPct: 0,
    ownerName: owners[1].name, ownerColor: owners[1].color,
    requiredDate: '2026-11-01', baselineDate: '2026-10-01', forecastDate: '2026-10-01',
  },
  {
    id: 't10', trackingNo: 'F22-CL3F-0038', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-cds', zoneLabel: 'CL-3F / 化學品供應 CDS',
    materialName: 'PCW-04 製程冷卻水幫浦', quantity: 2, unit: '台',
    supplier: '中央流體科技',
    status: 'rejected', progressPct: 0,
    ownerName: owners[4].name, ownerColor: owners[4].color,
    requiredDate: '2026-09-10', baselineDate: '2026-08-15', forecastDate: '2026-08-15',
    remark: '審核意見:規格書版本錯誤,請更新至 Rev.C 後重新送審',
  },
  {
    id: 't11', trackingNo: 'F22-CL2F-0104', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-efem', zoneLabel: 'CL-2F / EFEM 介面模組',
    materialName: 'EFM-01 EFEM 晶圓傳送介面模組', quantity: 1, unit: '套',
    supplier: '精密機電系統', poNo: 'PO-2026-3288',
    status: 'onHold', progressPct: 35,
    ownerName: owners[4].name, ownerColor: owners[4].color,
    requiredDate: '2026-08-30', baselineDate: '2026-08-05', forecastDate: '2026-08-05',
    holdReason: '等待廠務動線變更確認,暫停生產排程',
  },
  {
    id: 't12', trackingNo: 'B1F-RFL-0007', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-rfl', zoneLabel: 'B1F / 高架地板系統',
    materialName: 'RFL-03 高架地板系統', quantity: 800, unit: 'm²',
    status: 'cancelled', progressPct: 0,
    ownerName: owners[3].name, ownerColor: owners[3].color,
    requiredDate: '2026-09-01', baselineDate: '2026-08-01', forecastDate: '2026-08-01',
    holdReason: '改用既有庫存料號,無需新採購',
  },
  {
    id: 't13', trackingNo: 'F22-CL3F-0047', siteId: 'f22-p1', siteLabel: 'F22 Phase 1',
    zoneId: 'z-hvac', zoneLabel: 'CL-3F / 空調系統 HVAC',
    materialName: 'AHU-05 空調機組(第三批)', quantity: 1, unit: '台',
    supplier: '台達能源工程', poNo: 'PO-2026-3512',
    status: 'installed', progressPct: 95,
    ownerName: owners[0].name, ownerColor: owners[0].color,
    requiredDate: '2026-07-20', baselineDate: '2026-07-10', forecastDate: '2026-07-10', actualDate: '2026-07-12',
    remark: '延遲 2 天,已完成安裝待結案',
  },
]

// ── Mock 子項(以 t1 AHU-03 為例,3 種情境示範)────────────────────────────

export const SUB_ITEMS: SubItem[] = [
  { id: 's1', parentTrackingId: 't1', subType: '分批交貨', seq: 1, name: '第 1 批到料(1 台)', baselineDate: '2026-08-20', forecastDate: '2026-08-20', actualDate: '2026-08-20', status: 'completed', ownerName: '林建宏' },
  { id: 's2', parentTrackingId: 't1', subType: '分批交貨', seq: 2, name: '第 2 批到料(1 台)', baselineDate: '2026-08-25', forecastDate: '2026-08-28', status: 'inProgress', ownerName: '林建宏' },
  { id: 's3', parentTrackingId: 't1', subType: '工序', seq: 3, name: '現場安裝', baselineDate: '2026-09-05', forecastDate: '2026-09-08', status: 'notStarted', ownerName: '林建宏' },
  { id: 's4', parentTrackingId: 't1', subType: '工序', seq: 4, name: '測試驗收', baselineDate: '2026-09-12', forecastDate: '2026-09-15', status: 'notStarted', ownerName: '林建宏' },
]

// ── Mock 變更歷程(以 t1 為例)──────────────────────────────────────────────

export const CHANGE_RECORDS: ChangeRecord[] = [
  { id: 'c1', trackingId: 't1', at: '2026-07-02 09:12', by: '林建宏', field: '狀態', from: 'Draft', to: 'Submitted' },
  { id: 'c2', trackingId: 't1', at: '2026-07-03 14:05', by: '陳怡君', field: '狀態', from: 'Submitted', to: 'Approved' },
  { id: 'c3', trackingId: 't1', at: '2026-07-03 14:06', by: '陳怡君', field: 'Baseline 計劃日', from: '—', to: '2026-08-20' },
  { id: 'c4', trackingId: 't1', at: '2026-07-10 11:20', by: '林建宏', field: 'PO 號', from: '—', to: 'PO-2026-3381' },
  { id: 'c5', trackingId: 't1', at: '2026-07-10 11:21', by: '林建宏', field: '狀態', from: 'Approved', to: 'Ordered' },
  { id: 'c6', trackingId: 't1', at: '2026-07-18 16:40', by: '台達能源工程(供應商回報)', field: '狀態', from: 'Ordered', to: 'In Production' },
  { id: 'c7', trackingId: 't1', at: '2026-07-22 10:03', by: '林建宏', field: 'Forecast 預計日', from: '2026-08-20', to: '2026-08-25' },
]
