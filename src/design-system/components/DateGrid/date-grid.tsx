import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import 'react-day-picker/style.css'

import { cn } from '@/lib/utils'

/**
 * Calendar — DayPicker 包裝,用本 DS token 覆寫預設視覺。
 *
 * ── 五種 cell state canonical(2026-04-21,對齊 DatePicker spec)──
 *
 * | State | 視覺 | Token | 備註 |
 * |-------|------|-------|------|
 * | today | 文字下方藍色底線(underscore) | `underline decoration-primary decoration-2 underline-offset-4` | 不 fill bg,純 affordance |
 * | disabled | 灰底圓圈,淺灰字 | `bg-neutral-2 text-fg-disabled rounded-full` | user-disabled 和 outside 略有區隔 |
 * | selected(range 端點 / single) | 藍底白字圓 | `bg-primary text-on-emphasis rounded-full` | range_start / range_end 共用此視覺 |
 * | range track(中間日期) | 灰底矩形橫條 | `bg-neutral-2 rounded-none` | 與端點圓形視覺接縫 |
 * | hover(未選中) | 藍圈 outline(無 fill) | `hover:ring-1 hover:ring-primary hover:bg-transparent` | 非 filled,避免跟 selected 混淆 |
 *
 * ── 組合狀態(state stacking order)──
 * today + selected → selected 勝出(藍底白字圓)
 * range-start / range-end → selected 規則
 * range-middle → track 規則(灰底矩形)
 * today + range-middle → track(灰底)+ underline(藍色底線仍可見)
 *
 * ── Spacing canonical ──
 * - 整個 popover padding `p-3`(12px,對齊 `--layout-space-tight` @ md density)
 * - 四邊對稱:左右 chevron 按鈕到邊距 = 最左最右日期 cell 到邊距(12px)
 * - 上下對稱:caption 到頂 = 最後一排日期到底(均 12px,從 `p-3` 繼承)
 * - day cell 固定 `h-9 w-9`(36×36),week header 固定 `h-8 w-9`
 *
 * ── 為什麼 today 改 underline 不 ring-circle ──
 * Ant Design / Google Calendar / macOS Calendar 皆用 underline 或藍色 dot 標 today,
 * 而非 ring circle(ring 容易跟 hover ring 混淆)。Material 3 也廢除了 today-ring,
 * 改用 text 色差或 indicator dot。
 *
 * 覆寫 react-day-picker v9 class names 為本 DS utility class,避免引入原生 .rdp-* 樣式漂移。
 */

export type DateGridProps = React.ComponentProps<typeof DayPicker>

export function DateGrid({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DateGridProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // p-3 = 12px 四邊對稱(user 附圖要求);整個 popover padding 對齊 layout-space-tight
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-3',
        // caption **h-field-sm**(28px)統一尺寸 — 跟 day cell / nav button 一致;nav 放頂部
        // caption + chevron 垂直置中(user AR9:prev/next 頂部,年月垂直置中)
        month_caption: 'flex items-center justify-center h-field-sm relative',
        caption_label: 'text-body font-medium',
        // nav absolute 覆蓋在 caption 上,inset-x-0 + justify-between + button w-field-sm = 箭頭中心對齊欄位
        nav: 'flex items-center absolute inset-x-0 inset-y-0 justify-between pointer-events-none',
        button_previous: cn(
          'pointer-events-auto inline-flex items-center justify-center h-field-sm w-[var(--field-height-sm)] rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        button_next: cn(
          'pointer-events-auto inline-flex items-center justify-center h-field-sm w-[var(--field-height-sm)] rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-fg-muted text-caption font-normal w-[var(--field-height-sm)] h-field-sm flex items-center justify-center',
        week: 'flex w-full mt-1',
        // day cell(容器)— range-middle 的灰底 track 打在這層(矩形,非 button)。
        // day-button 尺寸統一 h-field-sm w-[var(--field-height-sm)] = 28px(md)/ 32px(lg)。
        day: cn(
          'h-field-sm w-[var(--field-height-sm)] p-0 text-center relative',
          // range-middle 灰底 track:只在 day 容器(矩形)上
          '[&[data-range-middle=true]]:bg-neutral-2',
        ),
        day_button: cn(
          'h-full w-full p-0 font-normal text-body rounded-full transition-colors',
          // hover:藍圈 outline 圓形 — 只在 non-selected / non-range-middle 狀態下啟用
          'hover:ring-1 hover:ring-primary hover:bg-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          // 用 react-day-picker v9 的 data-* attribute,不用 aria-selected(後者 v9 不保證附在 button)
          // selected / range_start / range_end:藍底白字圓
          'data-[selected=true]:bg-primary data-[selected=true]:text-on-emphasis',
          'data-[selected=true]:hover:bg-primary-hover data-[selected=true]:hover:ring-0',
          // range-middle:button 透明(讓 day 容器的 bg-neutral-2 track 顯露);
          // 壓制 range-middle 的 hover ring(避免 range 二次 hover 時出現方框 bug — AR12)
          'data-[range-middle=true]:!bg-transparent data-[range-middle=true]:!text-foreground',
          'data-[range-middle=true]:hover:ring-0 data-[range-middle=true]:hover:bg-transparent',
        ),
        // today:文字下方藍色底線(非 ring circle)
        today: 'underline decoration-primary decoration-2 underline-offset-4',
        outside: 'text-fg-disabled',
        // disabled:灰底圓圈 + 淺灰字
        disabled: 'bg-neutral-2 text-fg-disabled rounded-full cursor-not-allowed',
        range_start: 'rounded-l-full',
        range_end: 'rounded-r-full',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon size={16} />
        },
      }}
      {...props}
    />
  )
}
DateGrid.displayName = 'DateGrid'
