// ── 消費的 SSOT ──────────────────────────────────────────────────────────────
// components: DataTable(data-table.spec.md)/ Tag(tag.spec.md)/ ProgressBar(progress-bar.spec.md)/
//   Avatar(avatar.spec.md)/ Sheet(sheet.spec.md)/ ChipGroup(chip.spec.md)/ Button / DescriptionList /
//   AppShell + Sidebar(app-shell.spec.md / sidebar.spec.md,經 fcmt-shell.tsx 共用殼)
// patterns: header-canonical(chrome-header,經 fcmt-shell.tsx)
// tokens: layoutSpace(--layout-space-*)/ categorical-color(Tag/Avatar color 對照見 tracking-item-data.ts)
// 產品層 SSOT: PRD v0.1 第 6 章狀態機 + 第 8 章 R1「狀態 chip + 進度條雙編碼」+ Product Master
//   Design Standards P20 狀態語意系統(生命週期 vs 流程雙家族,顏色綁 variable alias)
//
// Candidate:B 為主(全頁 DataTable 總覽表格頁)+ A 輔助混搭(row 快速檢視走 Sheet rightSider peek,
// 不取代 TrackingItemDetail.stories.tsx 的全頁 Master-Detail)。對應 /prototype Phase 2 Checkpoint 2 決議。
//
// @story-baseline: apps/template/src/App.stories.tsx#Default(AppShell + Sidebar + ChromeHeader 完整佈局,經 fcmt-shell.tsx 消費)
// @story-baseline: packages/design-system/src/components/DataTable/data-table.stories.tsx#RowActions(rowActions Button text/xs/iconOnly 用法)
// @story-baseline: packages/design-system/src/components/Sheet/sheet.stories.tsx#EditUserRight(SheetContent/Header/Body/Footer 結構)+ #OpenSnapshot(defaultOpen 稽核截圖 pattern)

import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus, ArrowRight } from 'lucide-react'

import { FcmtShell } from './fcmt-shell'
import {
  TRACKING_ITEMS,
  STATUS_META,
  delayDays,
  type TrackingItem,
  type TrackingStatus,
} from './tracking-item-data'

import { DataTable } from '@/design-system/components/DataTable/data-table'
import { Tag } from '@/design-system/components/Tag/tag'
import { ProgressBar } from '@/design-system/components/ProgressBar/progress-bar'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Button } from '@/design-system/components/Button/button'
import { ChipGroup, Chip } from '@/design-system/components/Chip/chip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/design-system/components/Sheet/sheet'
import { Empty } from '@/design-system/components/Empty/empty'
import { DescriptionList, DescriptionItem } from '@/design-system/components/DescriptionList/description-list'

// ── 篩選(PRD M5-1 共用篩選器;本頁先示範狀態快速篩選 chip)────────────────────

type QuickFilter = 'all' | 'pendingReview' | 'inFlight' | 'delayed' | 'closed'

const QUICK_FILTERS: Array<{ value: QuickFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pendingReview', label: '待審' },
  { value: 'inFlight', label: '進行中' },
  { value: 'delayed', label: '已延遲' },
  { value: 'closed', label: '已結案' },
]

const IN_FLIGHT: TrackingStatus[] = ['ordered', 'inProduction', 'shipped', 'arrived', 'inspected', 'installed']

function applyQuickFilter(items: TrackingItem[], filter: QuickFilter): TrackingItem[] {
  switch (filter) {
    case 'pendingReview':
      return items.filter((i) => i.status === 'submitted')
    case 'inFlight':
      return items.filter((i) => IN_FLIGHT.includes(i.status))
    case 'delayed':
      return items.filter((i) => !['closed', 'cancelled', 'rejected'].includes(i.status) && delayDays(i) > 0)
    case 'closed':
      return items.filter((i) => i.status === 'closed')
    default:
      return items
  }
}

// ── Peek rightSider(candidate A 輔助,baseline = sheet.stories.tsx#EditUserRight)──

function TrackingItemPeek({
  item,
  open,
  onOpenChange,
}: {
  item: TrackingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* rightSider 寬 360px(Product Master G3:320/360;伴隨資訊窄版面,非 DS Sheet 預設 max-w-md 448) */}
      <SheetContent className="flex flex-col sm:max-w-[360px]">
        {item && (
          <>
            <SheetHeader>
              <SheetTitle>{item.trackingNo}</SheetTitle>
            </SheetHeader>
            <SheetBody>
              <div className="flex items-center gap-2 mb-4">
                <Tag color={STATUS_META[item.status].tagColor} solid={STATUS_META[item.status].tagSolid}>
                  {STATUS_META[item.status].label}
                </Tag>
                {!['closed', 'cancelled', 'rejected'].includes(item.status) && delayDays(item) > 0 && (
                  <Tag color="deep-orange">延遲 {delayDays(item)} 天</Tag>
                )}
              </div>
              <ProgressBar
                value={item.progressPct}
                status={STATUS_META[item.status].progressBarStatus}
                affix="value"
                className="mb-4"
              />
              <DescriptionList direction="horizontal" divided>
                <DescriptionItem label="物料">{item.materialName}</DescriptionItem>
                <DescriptionItem label="廠區/區塊">{item.zoneLabel}</DescriptionItem>
                <DescriptionItem label="數量">{item.quantity} {item.unit}</DescriptionItem>
                <DescriptionItem label="供應商">{item.supplier ?? '—'}</DescriptionItem>
                <DescriptionItem label="PO 號">{item.poNo ?? '—'}</DescriptionItem>
                <DescriptionItem label="需求日">{item.requiredDate}</DescriptionItem>
                <DescriptionItem label="Baseline 計劃日">{item.baselineDate}</DescriptionItem>
                <DescriptionItem label="Forecast 預計日">{item.forecastDate}</DescriptionItem>
                <DescriptionItem label="負責人">
                  <span className="inline-flex items-center gap-2">
                    <Avatar alt={item.ownerName} size={20} color={item.ownerColor} />
                    {item.ownerName}
                  </span>
                </DescriptionItem>
              </DescriptionList>
              {item.remark && (
                <p className="text-body text-fg-secondary mt-4">{item.remark}</p>
              )}
            </SheetBody>
            <SheetFooter>
              <Button variant="tertiary" size="md" onClick={() => onOpenChange(false)}>關閉</Button>
              <Button variant="primary" size="md" endIcon={ArrowRight}>
                前往完整頁面
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── 主頁 ─────────────────────────────────────────────────────────────────────

function TrackingItemListPage({ initialPeekId }: { initialPeekId?: string }) {
  const [filter, setFilter] = React.useState<QuickFilter>('all')
  const [peekItem, setPeekItem] = React.useState<TrackingItem | null>(
    initialPeekId ? TRACKING_ITEMS.find((i) => i.id === initialPeekId) ?? null : null,
  )
  const [peekOpen, setPeekOpen] = React.useState(Boolean(initialPeekId))

  const rows = React.useMemo(() => applyQuickFilter(TRACKING_ITEMS, filter), [filter])

  const openPeek = React.useCallback((item: TrackingItem) => {
    setPeekItem(item)
    setPeekOpen(true)
  }, [])

  const columns = React.useMemo<ColumnDef<TrackingItem, any>[]>(() => [
    {
      accessorKey: 'trackingNo',
      header: '追蹤單',
      size: 260,
      cell: ({ row }) => (
        <div className="flex flex-col min-w-0">
          <span className="text-body font-medium text-foreground truncate">{row.original.trackingNo}</span>
          <span className="text-caption text-fg-secondary truncate">{row.original.materialName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'zoneLabel',
      header: '廠區/區塊',
      size: 200,
      cell: ({ row }) => <span className="text-body text-fg-secondary truncate">{row.original.zoneLabel}</span>,
    },
    {
      accessorKey: 'status',
      header: '狀態',
      size: 110,
      cell: ({ row }) => {
        const meta = STATUS_META[row.original.status]
        return <Tag color={meta.tagColor} solid={meta.tagSolid}>{meta.label}</Tag>
      },
    },
    {
      accessorKey: 'progressPct',
      header: '進度',
      size: 160,
      cell: ({ row }) => (
        <ProgressBar
          value={row.original.progressPct}
          status={STATUS_META[row.original.status].progressBarStatus}
          affix="value"
        />
      ),
    },
    {
      accessorKey: 'ownerName',
      header: '負責人',
      size: 140,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 min-w-0">
          <Avatar alt={row.original.ownerName} size={20} color={row.original.ownerColor} />
          <span className="truncate text-body">{row.original.ownerName}</span>
        </span>
      ),
    },
    {
      accessorKey: 'requiredDate',
      header: '需求日',
      size: 160,
      cell: ({ row }) => {
        const item = row.original
        const d = delayDays(item)
        const showDelay = !['closed', 'cancelled', 'rejected'].includes(item.status) && d > 0
        return (
          <span className="inline-flex items-center gap-2">
            <span className="text-body tabular-nums">{item.requiredDate}</span>
            {showDelay && <Tag size="sm" color="deep-orange">延遲 {d} 天</Tag>}
          </span>
        )
      },
    },
  ], [])

  return (
    <FcmtShell
      activeId="tracking"
      title="追蹤單"
      headerRightSlot={<Button variant="primary" size="md" startIcon={Plus}>新增追蹤單</Button>}
    >
      <div className="flex flex-col h-full min-h-0 px-[var(--layout-space-loose)] py-[var(--layout-space-tight)] gap-3">
        <ChipGroup
          type="single"
          value={filter}
          onValueChange={(v) => v && setFilter(v as QuickFilter)}
        >
          {QUICK_FILTERS.map((f) => (
            <Chip key={f.value} value={f.value}>{f.label}</Chip>
          ))}
        </ChipGroup>

        <div className="flex-1 min-h-0">
          <DataTable
            columns={columns}
            data={rows}
            height="100%"
            emptyState={<div className="py-12"><Empty description="沒有符合篩選條件的追蹤單" /></div>}
            getRowId={(row) => row.id}
            rowActions={(row) => (
              <Button
                iconOnly
                variant="text"
                size="xs"
                startIcon={Eye}
                aria-label={`快速檢視 ${row.trackingNo}`}
                onClick={() => openPeek(row)}
              />
            )}
          />
        </div>
      </div>

      <TrackingItemPeek item={peekItem} open={peekOpen} onOpenChange={setPeekOpen} />
    </FcmtShell>
  )
}

// ── Stories ──────────────────────────────────────────────────────────────────

const meta: Meta<typeof TrackingItemListPage> = {
  title: 'Explorations/建廠物料追蹤 FCMT/追蹤單清單（B 型 + Peek）',
  component: TrackingItemListPage,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof TrackingItemListPage>

// M15:Flow snapshot——預設清單總覽,供 visual-audit 截圖覆蓋
export const Overview: Story = {
  name: '清單總覽',
  render: () => <TrackingItemListPage />,
}

// M15:OpenSnapshot——Peek rightSider 預設開啟(F22-CL3F-0031 AHU-03),讓 stakeholder 稽核不需真人點擊
export const PeekOpenSnapshot: Story = {
  name: '快速檢視（Peek 開啟）',
  render: () => <TrackingItemListPage initialPeekId="t1" />,
}
