import * as React from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Sidebar — 佈局外殼元件
 *
 * 提供三個 slot（Header / Content / Footer）的側邊欄容器。
 * 支援展開/收合，收合時寬度縮至 icon-only 模式。
 *
 * 結構：
 *   SidebarProvider → 提供 collapsed 狀態 context
 *     Sidebar → 容器（bg-surface + border）
 *       SidebarHeader → 頂部 slot（logo、workspace）
 *       SidebarContent → 中間可捲動區域（TreeView 放這裡）
 *       SidebarFooter → 底部 slot（user、settings）
 *     SidebarTrigger → 展開/收合按鈕（可放在 sidebar 內或外）
 */

// ═══════════════════════════════════════════════════════════════════════════
// Context
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  width: number
  collapsedWidth: number
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>')
  return ctx
}

// ═══════════════════════════════════════════════════════════════════════════
// SidebarProvider
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarProviderProps {
  children: React.ReactNode
  /** 預設是否收合 */
  defaultCollapsed?: boolean
  /** 展開時的寬度（px） */
  width?: number
  /** 收合時的寬度（px） */
  collapsedWidth?: number
}

const SidebarProvider = ({
  children,
  defaultCollapsed = false,
  width = 260,
  collapsedWidth = 48,
}: SidebarProviderProps) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  const value = React.useMemo(
    () => ({ collapsed, setCollapsed, width, collapsedWidth }),
    [collapsed, width, collapsedWidth],
  )

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}
SidebarProvider.displayName = 'SidebarProvider'

// ═══════════════════════════════════════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 側邊欄位置 */
  side?: 'left' | 'right'
  /** 是否支援收合 */
  collapsible?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, side = 'left', collapsible = true, children, ...props }, ref) => {
    const { collapsed, width, collapsedWidth } = useSidebar()

    const currentWidth = collapsible && collapsed ? collapsedWidth : width

    return (
      <aside
        ref={ref}
        data-collapsed={collapsed}
        data-side={side}
        className={cn(
          'flex flex-col bg-surface shrink-0',
          'transition-[width] duration-200 ease-in-out',
          'overflow-hidden',
          side === 'left' ? 'border-r border-divider' : 'border-l border-divider',
          className,
        )}
        style={{ width: currentWidth }}
        {...props}
      >
        {children}
      </aside>
    )
  },
)
Sidebar.displayName = 'Sidebar'

// ═══════════════════════════════════════════════════════════════════════════
// SidebarHeader
// ═══════════════════════════════════════════════════════════════════════════

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center shrink-0',
      'px-[var(--layout-space-loose)] py-3',
      'border-b border-divider',
      className,
    )}
    {...props}
  />
))
SidebarHeader.displayName = 'SidebarHeader'

// ═══════════════════════════════════════════════════════════════════════════
// SidebarContent
// ═══════════════════════════════════════════════════════════════════════════

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex-1 overflow-y-auto py-2',
      className,
    )}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

// ═══════════════════════════════════════════════════════════════════════════
// SidebarFooter
// ═══════════════════════════════════════════════════════════════════════════

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center shrink-0',
      'px-[var(--layout-space-loose)] py-3',
      'border-t border-divider',
      className,
    )}
    {...props}
  />
))
SidebarFooter.displayName = 'SidebarFooter'

// ═══════════════════════════════════════════════════════════════════════════
// SidebarTrigger
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 對應的 sidebar 位置，決定 icon 方向 */
  side?: 'left' | 'right'
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, side = 'left', ...props }, ref) => {
    const { collapsed, setCollapsed } = useSidebar()

    // left sidebar: collapsed → PanelLeftOpen (expand), expanded → PanelLeftClose (collapse)
    // right sidebar: 反轉
    const Icon = side === 'left'
      ? (collapsed ? PanelLeftOpen : PanelLeftClose)
      : (collapsed ? PanelLeftClose : PanelLeftOpen)

    return (
      <button
        ref={ref}
        type="button"
        aria-label={collapsed ? '展開側邊欄' : '收合側邊欄'}
        className={cn(
          'inline-flex items-center justify-center',
          'h-8 w-8 rounded-md',
          'text-fg-muted hover:text-foreground',
          'hover:bg-neutral-hover active:bg-neutral-active',
          'transition-colors',
          className,
        )}
        onClick={() => setCollapsed((prev) => !prev)}
        {...props}
      >
        <Icon size={16} />
      </button>
    )
  },
)
SidebarTrigger.displayName = 'SidebarTrigger'

// ═══════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
}
