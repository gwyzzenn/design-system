import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * DescriptionList — 唯讀 label + value 展示
 *
 * HTML 語義：dl + dt + dd（跟 Atlassian、Shopify Polaris 對齊）。
 * 跟 Field（表單 input）不同——DescriptionList 是純展示，無互動。
 *
 * ── 元件 ──
 * DescriptionList: 容器（dl），管 layout（grid cols、gap）
 * DescriptionItem: 單個 label + value（dt + dd）
 *
 * ── Typography ──
 * label (dt): text-caption text-fg-muted (12px)
 * value (dd): text-body (14px)
 * label → value: mt-0.5 (2px)
 */

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** grid 欄數，預設 1 */
  cols?: 1 | 2 | 3
}

const colsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
}

const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ cols = 1, className, ...props }, ref) => (
    <dl
      ref={ref}
      className={cn('grid gap-x-4 gap-y-2', colsClass[cols], className)}
      {...props}
    />
  ),
)
DescriptionList.displayName = 'DescriptionList'

export interface DescriptionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  children: React.ReactNode
}

const DescriptionItem = React.forwardRef<HTMLDivElement, DescriptionItemProps>(
  ({ label, children, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col', className)} {...props}>
      <dt className="text-caption text-fg-muted">{label}</dt>
      <dd className="text-body mt-0.5">{children}</dd>
    </div>
  ),
)
DescriptionItem.displayName = 'DescriptionItem'

export { DescriptionList, DescriptionItem }
