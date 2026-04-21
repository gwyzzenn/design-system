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
        // caption h-9 = 36px(同 day cell),讓 arrow buttons fill 整個 caption 高度,
        // 從而 arrow 上緣 = calendar top padding (12px),與最後一排日期距底 (12px) 對稱
        month_caption: 'flex items-center justify-center h-9 relative',
        caption_label: 'text-body font-medium',
        // nav absolute 覆蓋在 caption 上,inset-x-0 + justify-between + button w-9 = 箭頭中心
        // 精準對齊 Su(第 1 欄 w-9)/ Sa(第 7 欄 w-9)中心
        nav: 'flex items-center absolute inset-x-0 inset-y-0 justify-between pointer-events-none',
        button_previous: cn(
          'pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        button_next: cn(
          'pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-md',
          'text-fg-muted hover:text-foreground hover:bg-neutral-hover',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-fg-muted text-caption font-normal w-9 h-8 flex items-center justify-center',
        week: 'flex w-full mt-1',
        // day cell(container)— range-middle 的灰底 track 打在這層(矩形,非 button)
        day: cn(
          'h-9 w-9 p-0 text-center relative',
          // range-middle:灰底矩形 track(端點圓和中間矩形接縫形成一條灰底 bar)
          '[&[data-range-middle]]:bg-neutral-2',
        ),
        day_button: cn(
          'h-9 w-9 p-0 font-normal text-body rounded-full',
          // hover:藍圈 outline,無 fill(避免跟 selected 混淆)
          'hover:ring-1 hover:ring-primary hover:bg-transparent',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'transition-colors',
          // selected / range_start / range_end:藍底白字圓
          'aria-selected:bg-primary aria-selected:text-on-emphasis aria-selected:hover:bg-primary-hover aria-selected:hover:ring-0',
        ),
        // today:文字下方藍色底線(非 ring circle)。text-inherit 讓 selected 狀態下文字色仍 white
        today: 'underline decoration-primary decoration-2 underline-offset-4',
        outside: 'text-fg-disabled',
        // disabled:灰底圓圈 + 淺灰字(對齊 user 附圖)
        disabled: 'bg-neutral-2 text-fg-disabled rounded-full cursor-not-allowed',
        range_start: 'rounded-l-full',
        range_end: 'rounded-r-full',
        // range_middle 的底層 bg 已在 day class 用 data-attr 處理;這裡讓 button 透明顯露底色
        range_middle: 'aria-selected:bg-transparent aria-selected:text-foreground aria-selected:hover:ring-1 aria-selected:hover:ring-primary',
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
