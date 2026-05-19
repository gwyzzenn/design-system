// @benchmark-cited: 2026-05-19 — Mantine AppShell / Ant Layout / Material 3 Drawer / Atlassian Navigation System cite in app-shell.spec.md frontmatter.
/**
 * AppShell — web service page-level layout primitive。
 *
 * 組合 Sidebar + ChromeHeader + Aside + main 成完整 page shell。SSOT 邊界:本 pattern only
 * own slot composition + layout mode + Aside responsive mode;不 own sidebar / header /
 * sheet 視覺(各自 spec own)。
 *
 * 對齊 Mantine AppShell compound API + Ant Layout slot 模式 + Material 3 standard/modal
 * drawer canonical(per spec.md frontmatter cite)。
 *
 * Spec SSOT:`patterns/app-shell/app-shell.spec.md`
 */

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from '@/design-system/components/Sheet/sheet'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

type AppShellLayout = 'primary-sidebar' | 'primary-header'

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** primary-sidebar (Linear/Notion 派) | primary-header (GitHub/Slack 派);預設 primary-sidebar */
  layout?: AppShellLayout
  /** Sidebar 元素(必傳 Sidebar primitive,per Consumer 紀律)*/
  sidebar?: React.ReactNode
  /** Header 元素(必傳 ChromeHeader 或 header-canonical-derived,per Consumer 紀律)*/
  header?: React.ReactNode
  /** Aside 元素(`<AppShellAside>` sub-component);可選 */
  aside?: React.ReactNode
  /** Aside open state(modal mode 必須)*/
  asideOpen?: boolean
  onAsideOpenChange?: (open: boolean) => void
  /** Main content;`<main>` landmark + padding=0 */
  children: React.ReactNode
}

export interface AppShellAsideProps {
  /** Required:modal mode 走 Sheet → aria-labelledby 強制,per sheet.spec.md:98 */
  title: string
  /** Width(number 或 breakpoint-keyed object);clamp min:240 max:640 */
  width?: number | { md?: number; xl?: number }
  /** Children content */
  children: React.ReactNode
  className?: string
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AppShellContextValue {
  layout: AppShellLayout
  asideOpen: boolean
  setAsideOpen: (open: boolean) => void
  isMobile: boolean
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null)

function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext)
  if (!ctx) throw new Error('AppShellAside must be used within <AppShell>')
  return ctx
}

// ── Mobile breakpoint hook(對齊 Sidebar 768px SSOT)──────────────────────────

const MOBILE_BREAKPOINT_PX = 768

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`).matches
  })

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}

// ── Width resolve(consumer 自傳 + clamp 240-640)──────────────────────────────

const ASIDE_WIDTH_MIN = 240
const ASIDE_WIDTH_MAX = 640
const ASIDE_WIDTH_DEFAULT = 320

function resolveAsideWidth(width: AppShellAsideProps['width']): number {
  if (typeof width === 'number') {
    return Math.max(ASIDE_WIDTH_MIN, Math.min(ASIDE_WIDTH_MAX, width))
  }
  if (width && typeof width === 'object') {
    // 簡化:先取 md,後續可加 ResizeObserver-driven xl 切換
    const v = width.md ?? ASIDE_WIDTH_DEFAULT
    return Math.max(ASIDE_WIDTH_MIN, Math.min(ASIDE_WIDTH_MAX, v))
  }
  return ASIDE_WIDTH_DEFAULT
}

// ── Skip-to-main link(a11y WCAG 2.4.1)───────────────────────────────────────

function SkipToMain() {
  return (
    <a
      href="#app-shell-main"
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-2 focus:left-2 focus:z-50',
        'focus:px-3 focus:py-2 focus:rounded-md',
        'focus:bg-surface focus:text-foreground focus:shadow-[var(--elevation-200)]',
        'focus:outline-none focus:ring-2 focus:ring-primary'
      )}
    >
      Skip to main content
    </a>
  )
}

// ── AppShell root ────────────────────────────────────────────────────────────

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      layout = 'primary-sidebar',
      sidebar,
      header,
      aside,
      asideOpen: asideOpenProp,
      onAsideOpenChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [asideOpenInternal, setAsideOpenInternal] = React.useState(false)
    const isControlled = asideOpenProp !== undefined
    const asideOpen = isControlled ? asideOpenProp : asideOpenInternal

    const setAsideOpen = React.useCallback(
      (open: boolean) => {
        if (!isControlled) setAsideOpenInternal(open)
        onAsideOpenChange?.(open)
      },
      [isControlled, onAsideOpenChange]
    )

    const isMobile = useIsMobile()

    // ── Keyboard: cmd+. toggle aside ──
    // ⌘B sidebar toggle by Sidebar SSOT(本 component 不重覆 register)
    React.useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === '.' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setAsideOpen(!asideOpen)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [asideOpen, setAsideOpen])

    const ctxValue = React.useMemo<AppShellContextValue>(
      () => ({ layout, asideOpen, setAsideOpen, isMobile }),
      [layout, asideOpen, setAsideOpen, isMobile]
    )

    // ── Layout grid(2 mode)──
    // primary-sidebar:
    //   row1: [sidebar (頂天)][main col (header + main)][aside (頂天)]
    // primary-header:
    //   row1: [header (橫跨整 viewport, banner role)]
    //   row2: [sidebar][main][aside]

    // AppShellAside 自決 inline vs modal mode(via AppShellContext.isMobile)。
    // AppShell 一律只 render `{aside}` 一次,AppShellAside 內部根據 isMobile 決定 render 形式。

    if (layout === 'primary-header') {
      return (
        <AppShellContext.Provider value={ctxValue}>
          <div
            ref={ref}
            className={cn('flex h-svh w-full flex-col overflow-hidden bg-canvas', className)}
            {...props}
          >
            <SkipToMain />
            {/* Header row — banner role (global) */}
            {header && <header className="flex-shrink-0">{header}</header>}
            {/* Body row */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Sidebar — 不頂天(在 header 下) */}
              {sidebar}
              {/* Main */}
              <main id="app-shell-main" className="flex-1 min-w-0 min-h-0 overflow-y-auto">
                {children}
              </main>
              {/* Aside slot — desktop inline OR mobile Sheet,內部自決 */}
              {aside}
            </div>
          </div>
        </AppShellContext.Provider>
      )
    }

    // primary-sidebar layout
    return (
      <AppShellContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={cn('flex h-svh w-full overflow-hidden bg-canvas', className)}
          {...props}
        >
          <SkipToMain />
          {/* Sidebar — 頂天 */}
          {sidebar}
          {/* Main column(header + main 垂直堆)*/}
          <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
            {header && (
              // Header 在 main 內 → NOT a banner(W3C ARIA in HTML rule);wrap div not <header>
              <div className="flex-shrink-0">{header}</div>
            )}
            <main id="app-shell-main" className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </main>
          </div>
          {/* Aside slot — desktop inline OR mobile Sheet,內部自決 */}
          {aside}
        </div>
      </AppShellContext.Provider>
    )
  }
)
AppShell.displayName = 'AppShell'

// ── AppShellAside sub-component ──────────────────────────────────────────────

/**
 * AppShellAside — right panel:standard inline(desktop) vs modal overlay(mobile)。
 *
 * Desktop(viewport ≥ 768px):
 *   - Render 直接放 layout grid 右側(asideOpen=true 才 mount,close hide via parent)
 *   - 不蓋 mask / background 可操作 / 佔 layout 寬
 *   - Vertical extent:primary-sidebar → 頂天立地 / primary-header → header 下方
 *
 * Mobile(viewport < 768px):
 *   - Render 走 Sheet primitive(side="right",per sheet.spec.md)
 *   - Mask 蓋 / background 不可操作 / 不佔 layout 寬
 *   - title 強制(aria-labelledby per sheet.spec.md:98)
 */
const AppShellAside = React.forwardRef<HTMLElement, AppShellAsideProps>(
  ({ title, width, children, className }, ref) => {
    const { asideOpen, setAsideOpen, isMobile } = useAppShell()
    const resolvedWidth = resolveAsideWidth(width)

    // Modal mode(mobile)— Sheet from right
    if (isMobile) {
      return (
        <Sheet open={asideOpen} onOpenChange={setAsideOpen}>
          <SheetContent side="right" className="w-[min(90vw,var(--app-shell-aside-modal-width))]" style={{ ['--app-shell-aside-modal-width' as string]: `${resolvedWidth}px` }}>
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <SheetBody>{children}</SheetBody>
          </SheetContent>
        </Sheet>
      )
    }

    // Standard inline mode(desktop)
    if (!asideOpen) return null

    return (
      <aside
        ref={ref}
        aria-label={title}
        className={cn(
          'flex flex-col h-full min-h-0 overflow-hidden',
          'bg-surface border-l border-divider',
          className
        )}
        style={{ width: resolvedWidth }}
      >
        {children}
      </aside>
    )
  }
)
AppShellAside.displayName = 'AppShellAside'

// ── Exports ──────────────────────────────────────────────────────────────────

export { AppShell, AppShellAside, useAppShell }
