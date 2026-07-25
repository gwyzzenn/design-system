// ── 消費的 SSOT ──────────────────────────────────────────────────────────────
// components: TreeView(tree-view.spec.md,Family 1)/ Breadcrumb(breadcrumb.spec.md)/ Tabs(tabs.spec.md)/
//   DescriptionList / DataTable / Tag / ProgressBar / Dialog(dialog.spec.md,G1 編輯入口)/
//   Sheet(rightSider 時間軸)/ Field + FieldLabel + FieldDescription / Input / Textarea / DatePicker / Button
// patterns: header-canonical(經 fcmt-shell.tsx)
// 產品層 SSOT: PRD v0.1 附錄 A/B(Tracking Item / Sub-Item 欄位)+ 第 6 章狀態機(事件觸發轉移,
//   對齊 Phase 1 benchmark SAP Ariba/Oracle Fusion「狀態由系統事件觸發,非自由切換」)+
//   M3-6 變更歷程雙形態(表格 tab + rightSider 時間軸)+ Product Master G1(698px 編輯 modal,
//   唯讀灰底/可編輯白底,footer 破壞性→次要→主要)
//
// Candidate:B 為主候選的全頁 Master-Detail 對應頁(PRD 9.1 已定選型,不是候選比稿對象;
// 左樹 = Zone 階層 + 同 Zone 底下追蹤單清單〔一頁內可切換選中項,不靠跨頁導覽〕,
// 右側 = 選中追蹤單的 tabs 現況/進行中/歷史)。
//
// @story-baseline: apps/template/src/App.stories.tsx#Default(AppShell + Sidebar + ChromeHeader,經 fcmt-shell.tsx 消費)
// @story-baseline: packages/design-system/src/components/TreeView/tree-view.stories.tsx(TreeItem indicator/label 組裝方式)
// @story-baseline: packages/design-system/src/components/Dialog/dialog.stories.tsx#WithForm(Field/FieldLabel/Input 編輯表單 + Footer 按鈕順序)+ #Destructive(danger 按鈕語彙)
// @story-baseline: packages/design-system/src/components/Sheet/sheet.stories.tsx#OpenSnapshot(defaultOpen 稽核截圖 pattern)

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pencil, History, Check } from 'lucide-react'

import { FcmtShell } from './fcmt-shell'
import {
  TRACKING_ITEMS,
  SUB_ITEMS,
  CHANGE_RECORDS,
  STATUS_META,
  SUB_ITEM_STATUS_LABEL,
  ZONE_TREE,
  delayDays,
  type TrackingItem,
  type TrackingStatus,
  type ZoneNode,
} from './tracking-item-data'

import { TreeView, TreeItem } from '@/design-system/components/TreeView/tree-view'
import { Breadcrumb, BreadcrumbList } from '@/design-system/components/Breadcrumb/breadcrumb'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/design-system/components/Tabs/tabs'
import { DescriptionList, DescriptionItem } from '@/design-system/components/DescriptionList/description-list'
import { DataTable } from '@/design-system/components/DataTable/data-table'
import { Tag } from '@/design-system/components/Tag/tag'
import { ProgressBar } from '@/design-system/components/ProgressBar/progress-bar'
import { Button } from '@/design-system/components/Button/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/design-system/components/Dialog/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from '@/design-system/components/Sheet/sheet'
import { Field, FieldLabel, FieldDescription } from '@/design-system/components/Field/field'
import { Input } from '@/design-system/components/Input/input'
import { Textarea } from '@/design-system/components/Textarea/textarea'
import { DatePicker } from '@/design-system/components/DatePicker/date-picker'
import { CAT_SOLID } from '@/design-system/tokens/categorical-color'

// 樹葉節點的狀態圓點——消費 CAT_SOLID SSOT(1:1 hue,零 offset),不把 Tag 塞進窄樹列
// (280px 樹寬扣 indent 後容不下「編號 + Tag 文字」,indicator 是 TreeItem 文件明示的
// stepper status dot 用法,詳 item-anatomy.spec.md / tree-view.tsx TreeItemProps.indicator)
const STATUS_DOT_CLASS: Record<TrackingStatus, string> = Object.fromEntries(
  (Object.keys(STATUS_META) as TrackingStatus[]).map((s) => [
    s,
    STATUS_META[s].tagColor === 'neutral' ? 'bg-[var(--color-neutral-9)]' : CAT_SOLID[STATUS_META[s].tagColor as keyof typeof CAT_SOLID],
  ]),
) as Record<TrackingStatus, string>

// ── 狀態轉移動作表(PRD 6.1,事件觸發,對齊 M3-3 系統阻擋非法轉移)────────────

interface TransitionAction {
  key: string
  label: string
  target: TrackingStatus
  variant: 'primary' | 'secondary' | 'tertiary'
  danger?: boolean
  needsReason?: boolean
}

function getActions(status: TrackingStatus): TransitionAction[] {
  switch (status) {
    case 'draft':
      return [{ key: 'submit', label: '送審', target: 'submitted', variant: 'primary' }]
    case 'submitted':
      return [
        { key: 'reject', label: '退回', target: 'rejected', variant: 'secondary', danger: true, needsReason: true },
        { key: 'approve', label: '核准', target: 'approved', variant: 'primary' },
      ]
    case 'rejected':
      return [{ key: 'redraft', label: '重新編輯並送審', target: 'draft', variant: 'primary' }]
    case 'approved':
      return [{ key: 'order', label: '登錄 PO 並下單', target: 'ordered', variant: 'primary' }]
    case 'ordered':
      return [
        { key: 'hold', label: '暫停', target: 'onHold', variant: 'secondary', danger: true, needsReason: true },
        { key: 'cancel', label: '取消', target: 'cancelled', variant: 'secondary', danger: true, needsReason: true },
        { key: 'produce', label: '確認生產中', target: 'inProduction', variant: 'primary' },
      ]
    case 'inProduction':
      return [
        { key: 'hold', label: '暫停', target: 'onHold', variant: 'secondary', danger: true, needsReason: true },
        { key: 'ship', label: '確認出貨', target: 'shipped', variant: 'primary' },
      ]
    case 'shipped':
      return [{ key: 'arrive', label: '確認到廠', target: 'arrived', variant: 'primary' }]
    case 'arrived':
      return [{ key: 'inspect', label: '確認驗收', target: 'inspected', variant: 'primary' }]
    case 'inspected':
      return [{ key: 'install', label: '確認安裝完成', target: 'installed', variant: 'primary' }]
    case 'installed':
      return [{ key: 'close', label: '結案', target: 'closed', variant: 'primary' }]
    case 'onHold':
      return [{ key: 'cancel', label: '取消', target: 'cancelled', variant: 'secondary', danger: true, needsReason: true }]
    default:
      return []
  }
}

// ── 左側 Zone 樹(Program → WorkPackage → Zone → TrackingItem leaf)────────────

function collectZoneNodeIds(node: ZoneNode): string[] {
  return [node.id, ...(node.children?.flatMap(collectZoneNodeIds) ?? [])]
}
const ALL_ZONE_NODE_IDS = collectZoneNodeIds(ZONE_TREE)

function ZoneTreeNodes({
  node,
  items,
}: {
  node: ZoneNode
  items: TrackingItem[]
}) {
  const leafItems = items.filter((i) => i.zoneId === node.id)
  return (
    <TreeItem id={node.id} label={node.label}>
      {node.children?.map((child) => (
        <ZoneTreeNodes key={child.id} node={child} items={items} />
      ))}
      {leafItems.map((item) => (
        <TreeItem
          key={item.id}
          id={item.id}
          label={item.trackingNo}
          indicator={
            <span
              className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT_CLASS[item.status]}`}
              aria-label={STATUS_META[item.status].label}
            />
          }
        />
      ))}
    </TreeItem>
  )
}

// ── 編輯 Modal(G1,698px)──────────────────────────────────────────────────

function EditDialog({
  item,
  open,
  onOpenChange,
  onSave,
}: {
  item: TrackingItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (patch: Partial<TrackingItem>) => void
}) {
  const [draft, setDraft] = React.useState(item)
  React.useEffect(() => { if (open) setDraft(item) }, [open, item])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth={698}>
        <DialogHeader>
          <DialogTitle>編輯追蹤單</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-[var(--layout-space-loose)]">
            <div className="grid grid-cols-2 gap-[var(--layout-space-loose)]">
              <Field>
                <FieldLabel>追蹤單編號</FieldLabel>
                <Input value={draft.trackingNo} disabled />
              </Field>
              <Field>
                <FieldLabel>廠區/區塊</FieldLabel>
                <Input value={draft.zoneLabel} disabled />
              </Field>
            </div>
            <Field>
              <FieldLabel>物料</FieldLabel>
              <Input value={draft.materialName} disabled />
              <FieldDescription>物料主檔欄位,如需變更請至主檔管理</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>規格補述</FieldLabel>
              <Textarea
                value={draft.specNote ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, specNote: e.target.value }))}
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-[var(--layout-space-loose)]">
              <Field>
                <FieldLabel>供應商</FieldLabel>
                <Input
                  value={draft.supplier ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, supplier: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel>PO 號</FieldLabel>
                <Input
                  value={draft.poNo ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, poNo: e.target.value }))}
                  placeholder="填入後可推進下單狀態"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-[var(--layout-space-loose)]">
              <Field>
                <FieldLabel>Forecast 預計日</FieldLabel>
                <DatePicker
                  value={draft.forecastDate}
                  onChange={(v) => setDraft((d) => ({ ...d, forecastDate: v }))}
                />
                <FieldDescription>變更會寫入歷程,Baseline 不受影響</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>需求日</FieldLabel>
                <DatePicker
                  value={draft.requiredDate}
                  onChange={(v) => setDraft((d) => ({ ...d, requiredDate: v }))}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>備註</FieldLabel>
              <Textarea
                value={draft.remark ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, remark: e.target.value }))}
                rows={2}
              />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="tertiary" onClick={() => onOpenChange(false)}>取消</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── 原因 Dialog(暫停 / 取消 / 退回,PRD 6.1「必填原因」)────────────────────

function ReasonDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: TransitionAction | null
  onCancel: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = React.useState('')
  React.useEffect(() => { setReason('') }, [action])

  return (
    <Dialog open={action != null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action?.label}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Field>
            <FieldLabel>原因</FieldLabel>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請說明原因,將寫入變更歷程"
              rows={3}
              autoFocus
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          <Button variant="tertiary" onClick={onCancel}>取消</Button>
          <Button variant="primary" danger={action?.danger} disabled={!reason.trim()} onClick={() => onConfirm(reason)}>
            確認{action?.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── 時間軸 rightSider(M3-6 雙形態之一,表格形態在 歷史 tab)───────────────────

function TimelineSheet({
  item,
  open,
  onOpenChange,
}: {
  item: TrackingItem
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const records = CHANGE_RECORDS.filter((r) => r.trackingId === item.id)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{item.trackingNo} 變更時間軸</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <div className="flex flex-col">
            {records.map((r, i) => (
              <div key={r.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  {i < records.length - 1 && <span className="w-px flex-1 bg-divider" />}
                </div>
                <div className="pb-4 min-w-0">
                  <div className="text-caption text-fg-secondary">{r.at} · {r.by}</div>
                  <div className="text-body text-foreground mt-0.5">
                    {r.field}:{r.from} → {r.to}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}

// ── 主頁 ─────────────────────────────────────────────────────────────────────

function TrackingItemDetailPage({ initialItemId }: { initialItemId: string }) {
  const [items, setItems] = React.useState(TRACKING_ITEMS)
  const [selectedId, setSelectedId] = React.useState(initialItemId)
  const [tab, setTab] = React.useState('current')
  const [editOpen, setEditOpen] = React.useState(false)
  const [timelineOpen, setTimelineOpen] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<TransitionAction | null>(null)
  const preHoldRef = React.useRef<Record<string, TrackingStatus>>({})

  const item = items.find((i) => i.id === selectedId) ?? items[0]
  const meta = STATUS_META[item.status]
  const delay = delayDays(item)
  const showDelay = !['closed', 'cancelled', 'rejected'].includes(item.status) && delay > 0

  const applyTransition = React.useCallback((target: TrackingStatus, reason?: string) => {
    setItems((prev) => prev.map((i) => {
      if (i.id !== item.id) return i
      if (target === 'onHold') preHoldRef.current[i.id] = i.status
      return {
        ...i,
        status: target,
        progressPct: STATUS_META[target].defaultProgressPct,
        holdReason: reason ?? i.holdReason,
      }
    }))
  }, [item.id])

  const actions = getActions(item.status).map((a) =>
    a.key === 'hold' ? a : a, // resume 特例另外處理(下方)
  )
  const resumeTarget = item.status === 'onHold' ? (preHoldRef.current[item.id] ?? 'ordered') : null

  const subItems = SUB_ITEMS.filter((s) => s.parentTrackingId === item.id)
  const history = CHANGE_RECORDS.filter((r) => r.trackingId === item.id)

  return (
    <FcmtShell activeId="tracking" title={`追蹤單詳情 · ${item.trackingNo}`}>
      <div className="flex h-full min-h-0">
        <div className="w-[280px] shrink-0 border-r border-divider min-h-0 overflow-y-auto py-2">
          <TreeView
            size="md"
            selectionMode="single"
            selectedIds={new Set([selectedId])}
            defaultExpandedIds={ALL_ZONE_NODE_IDS}
            onSelectedChange={(ids) => {
              const id = [...ids][0]
              if (id && items.some((i) => i.id === id)) setSelectedId(id)
            }}
            aria-label="廠區區塊與追蹤單"
          >
            <ZoneTreeNodes node={ZONE_TREE} items={items} />
          </TreeView>
        </div>

        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]">
          <Breadcrumb>
            <BreadcrumbList
              items={[
                { label: '建廠專案' },
                { label: item.siteLabel },
                { label: item.zoneLabel },
                { label: item.trackingNo },
              ]}
            />
          </Breadcrumb>

          <div className="flex items-start justify-between gap-4 mt-3">
            <div className="min-w-0">
              <h2 className="text-h3 font-medium truncate">{item.materialName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Tag color={meta.tagColor} solid={meta.tagSolid}>{meta.label}</Tag>
                {showDelay && <Tag color="deep-orange">延遲 {delay} 天</Tag>}
                {item.status === 'onHold' && item.holdReason && (
                  <span className="text-caption text-fg-secondary">原因:{item.holdReason}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="tertiary" size="md" startIcon={History} onClick={() => setTimelineOpen(true)}>
                時間軸
              </Button>
              <Button variant="tertiary" size="md" startIcon={Pencil} onClick={() => setEditOpen(true)}>
                編輯
              </Button>
              {actions.map((a) => (
                <Button
                  key={a.key}
                  variant={a.variant}
                  danger={a.danger}
                  size="md"
                  onClick={() => (a.needsReason ? setPendingAction(a) : applyTransition(a.target))}
                >
                  {a.label}
                </Button>
              ))}
              {resumeTarget && (
                <Button variant="primary" size="md" startIcon={Check} onClick={() => applyTransition(resumeTarget)}>
                  恢復
                </Button>
              )}
            </div>
          </div>

          <ProgressBar
            value={item.progressPct}
            status={meta.progressBarStatus}
            affix="value"
            className="mt-4 max-w-md"
          />

          <Tabs value={tab} onValueChange={setTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="current">現況</TabsTrigger>
              <TabsTrigger value="subitems">進行中</TabsTrigger>
              <TabsTrigger value="history">歷史</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <DescriptionList direction="horizontal" divided cols={1} className="max-w-2xl">
                <DescriptionItem label="數量">{item.quantity} {item.unit}</DescriptionItem>
                <DescriptionItem label="供應商">{item.supplier ?? '—'}</DescriptionItem>
                <DescriptionItem label="PO 號">{item.poNo ?? '—'}</DescriptionItem>
                <DescriptionItem label="需求日">{item.requiredDate}</DescriptionItem>
                <DescriptionItem label="Baseline 計劃日">{item.baselineDate}</DescriptionItem>
                <DescriptionItem label="Forecast 預計日">{item.forecastDate}</DescriptionItem>
                <DescriptionItem label="Actual 實際日">{item.actualDate ?? '—'}</DescriptionItem>
                <DescriptionItem label="負責人">{item.ownerName}</DescriptionItem>
                {item.remark && <DescriptionItem label="備註">{item.remark}</DescriptionItem>}
              </DescriptionList>
            </TabsContent>

            <TabsContent value="subitems">
              <DataTable
                height="auto"
                getRowId={(row) => row.id}
                data={subItems}
                columns={[
                  { accessorKey: 'name', header: '子項', size: 220 },
                  { accessorKey: 'subType', header: '型態', size: 100 },
                  { accessorKey: 'baselineDate', header: 'Baseline', size: 110 },
                  { accessorKey: 'forecastDate', header: 'Forecast', size: 110 },
                  { accessorKey: 'actualDate', header: 'Actual', size: 110, cell: ({ row }) => row.original.actualDate ?? '—' },
                  { accessorKey: 'status', header: '狀態', size: 100, cell: ({ row }) => SUB_ITEM_STATUS_LABEL[row.original.status] },
                  { accessorKey: 'ownerName', header: '負責人', size: 100 },
                ]}
                emptyState={<div className="py-8 text-center text-body text-fg-secondary">尚無子項</div>}
              />
            </TabsContent>

            <TabsContent value="history">
              <DataTable
                height="auto"
                getRowId={(row) => row.id}
                data={history}
                columns={[
                  { accessorKey: 'at', header: '時間', size: 160 },
                  { accessorKey: 'by', header: '操作人', size: 160 },
                  { accessorKey: 'field', header: '欄位', size: 140 },
                  { accessorKey: 'from', header: '舊值', size: 140 },
                  { accessorKey: 'to', header: '新值', size: 140 },
                ]}
                emptyState={<div className="py-8 text-center text-body text-fg-secondary">尚無變更紀錄</div>}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditDialog
        item={item}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={(patch) => setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i)))}
      />
      <ReasonDialog
        action={pendingAction}
        onCancel={() => setPendingAction(null)}
        onConfirm={(reason) => {
          if (pendingAction) applyTransition(pendingAction.target, reason)
          setPendingAction(null)
        }}
      />
      <TimelineSheet item={item} open={timelineOpen} onOpenChange={setTimelineOpen} />
    </FcmtShell>
  )
}

// ── Stories ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrackingItemDetailPage> = {
  title: 'Explorations/建廠物料追蹤 FCMT/追蹤單詳情（A 型 Master-Detail）',
  component: TrackingItemDetailPage,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof TrackingItemDetailPage>

// M15:Flow snapshot——AHU-03(生產中,含延遲旗標,示範最豐富的 state 組合)
export const InProductionWithDelay: Story = {
  name: '生產中 + 延遲旗標',
  render: () => <TrackingItemDetailPage initialItemId="t1" />,
}

// M15:OpenSnapshot——待審項目(核准/退回雙動作 + 未生效態三件套)
export const PendingApproval: Story = {
  name: '待審核（未生效態三件套）',
  render: () => <TrackingItemDetailPage initialItemId="t8" />,
}

// M15:OpenSnapshot——暫停項目(顯示 holdReason + 恢復動作)
export const OnHoldWithReason: Story = {
  name: '暫停中（含原因）',
  render: () => <TrackingItemDetailPage initialItemId="t11" />,
}
