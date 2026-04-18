import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

/**
 * Popover — Radix Popover + 設計系統 token
 *
 * ── 視覺 ──
 * 與 Dialog 對齊：bg-surface-raised / rounded-lg / border-border / elevation-200。
 * density 永遠鎖 md（Popover 是輕量浮層，不隨頁面 density 變大）。
 *
 * ── 結構 ──
 * PopoverContent：外殼（bg / border / radius / shadow / density），無內距。
 * PopoverHeader / PopoverBody / PopoverFooter：可選結構化 sub-components，
 * 採用 Dialog 同一套 padding token（px=loose / py=tight）。
 * 若僅放單一 body，consumer 包 PopoverBody 即可。
 */

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      data-density="md"
      className={cn(
        "z-50 w-72 rounded-lg border border-border bg-surface-raised text-foreground shadow-[var(--elevation-200)] outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        "origin-[var(--radix-popover-content-transform-origin)]",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

const PopoverHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 shrink-0 border-b border-divider",
      "px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]",
      className,
    )}
    {...props}
  />
))
PopoverHeader.displayName = "PopoverHeader"

const PopoverBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]",
      className,
    )}
    {...props}
  />
))
PopoverBody.displayName = "PopoverBody"

const PopoverFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-end gap-2 shrink-0 border-t border-divider",
      "px-[var(--layout-space-loose)] py-[var(--layout-space-tight)]",
      className,
    )}
    {...props}
  />
))
PopoverFooter.displayName = "PopoverFooter"

const PopoverTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-body font-medium truncate", className)}
    {...props}
  />
))
PopoverTitle.displayName = "PopoverTitle"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverTitle,
}
