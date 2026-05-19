// @benchmark-cited: anatomy 6-canonical 對齊 Polaris / Material anatomy spec
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { AppShell, AppShellAside } from './app-shell'
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/design-system/components/Sidebar/sidebar'
// SidebarProvider used in story wrappers above
import { ChromeHeader } from '@/design-system/patterns/header-canonical/chrome-header'
import { Button } from '@/design-system/components/Button/button'
import { Inbox, Calendar, Settings } from 'lucide-react'

const meta: Meta<typeof AppShell> = {
  title: 'Design System/Patterns/AppShell/設計規格',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AppShell>

function MockSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="text-body font-medium px-2">Acme Inc.</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton><Inbox className="size-4" /> Inbox</SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton><Calendar className="size-4" /> Calendar</SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton><Settings className="size-4" /> Settings</SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function MockHeader() {
  return (
    <ChromeHeader>
      <SidebarTrigger />
      <span className="text-body font-medium flex-1 ml-2">當前頁 Header</span>
    </ChromeHeader>
  )
}

function MockAside() {
  return (
    <AppShellAside title="Detail panel" width={320}>
      <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)]">
        <p className="text-body">Aside 內容</p>
      </div>
    </AppShellAside>
  )
}

/** Slot 結構 + landmark role 對照 */
export const Overview: Story = {
  name: 'Overview — slot 結構',
  render: () => {
    const [asideOpen, setAsideOpen] = React.useState(true)
    return (
      <SidebarProvider>
        <AppShell
          layout="primary-sidebar"
          sidebar={<MockSidebar />}
          header={<MockHeader />}
          aside={<MockAside />}
          asideOpen={asideOpen}
          onAsideOpenChange={setAsideOpen}
        >
          <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)]">
            <h2 className="text-h4 mb-3">Main &lt;main&gt; landmark + padding=0</h2>
            <p className="text-body text-fg-secondary">
              內容自管 padding,遵循 layoutSpace.spec.md 6 條規則。
            </p>
          </div>
        </AppShell>
      </SidebarProvider>
    )
  },
}

/** Layout mode matrix:primary-sidebar vs primary-header 並列對照 */
export const LayoutModeMatrix: Story = {
  name: 'LayoutModeMatrix — 兩 mode 對照',
  render: () => (
    <div className="grid grid-cols-2 gap-2 h-svh">
      <div className="border-r border-divider overflow-hidden">
        <div className="text-caption px-2 py-1 bg-surface-strong">primary-sidebar(Linear 派)</div>
        <div className="h-[calc(100%-32px)]">
          <SidebarProvider>
            <AppShell layout="primary-sidebar" sidebar={<MockSidebar />} header={<MockHeader />}>
              <div className="p-4 text-caption">main content</div>
            </AppShell>
          </SidebarProvider>
        </div>
      </div>
      <div className="overflow-hidden">
        <div className="text-caption px-2 py-1 bg-surface-strong">primary-header(GitHub 派)</div>
        <div className="h-[calc(100%-32px)]">
          <SidebarProvider>
            <AppShell layout="primary-header" sidebar={<MockSidebar />} header={<MockHeader />}>
              <div className="p-4 text-caption">main content</div>
            </AppShell>
          </SidebarProvider>
        </div>
      </div>
    </div>
  ),
}

/** Aside 2-mode behavior(state-driven)*/
export const StateBehavior: Story = {
  name: 'StateBehavior — Aside open/close + 2-mode',
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <SidebarProvider>
        <AppShell
          layout="primary-sidebar"
          sidebar={<MockSidebar />}
          header={
            <ChromeHeader>
              <SidebarTrigger />
              <span className="text-body flex-1 ml-2">Toggle Aside demo</span>
              <Button size="sm" variant="primary" onClick={() => setOpen(!open)}>
                {open ? 'Close' : 'Open'} Aside (cmd+.)
              </Button>
            </ChromeHeader>
          }
          aside={<MockAside />}
          asideOpen={open}
          onAsideOpenChange={setOpen}
        >
          <div className="p-4 text-body">
            <p>Aside open:{String(open)}</p>
            <p>Desktop ≥ 768px → inline standard mode(右側 panel,不蓋 mask)</p>
            <p>Mobile &lt; 768px → modal mode(Sheet from right,蓋 mask)</p>
          </div>
        </AppShell>
      </SidebarProvider>
    )
  },
}

/** A11y landmark 對照 */
export const Accessibility: Story = {
  name: 'Accessibility — landmark + skip-link + keyboard',
  render: () => (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)]">
      <h2 className="text-h4 mb-3">A11y 機制</h2>
      <ul className="text-body space-y-2 list-disc pl-5">
        <li>
          <strong>Landmark</strong>:`&lt;header&gt;` / `&lt;nav&gt;` / `&lt;aside&gt;` / `&lt;main&gt;`
          各自 implicit role。primary-header mode 的 `&lt;header&gt;` 是 banner role;primary-sidebar mode 的 header
          因為在 `&lt;main&gt;` descendant 不是 banner(per W3C ARIA in HTML)。
        </li>
        <li><strong>Skip to main</strong>:`Tab` 第一站 focus skip-link → jump 到 `#app-shell-main`(WCAG 2.4.1)</li>
        <li><strong>Keyboard shortcuts</strong>:`⌘B` / `Ctrl+B` toggle sidebar(消費 Sidebar SSOT)/ `⌘.` / `Ctrl+.` toggle aside</li>
        <li><strong>Modal Aside title</strong>:required prop → `aria-labelledby` 強制(per `sheet.spec.md:98`)</li>
        <li><strong>Focus trap</strong>:Sheet open 時 focus 在 Aside 內,Esc 關回 trigger(Radix Dialog 內建)</li>
      </ul>
    </div>
  ),
}

/** Size matrix:Aside width clamp 對照(描述式,非 DataTable consumer scenario)*/
export const SizeMatrix: Story = {
  name: 'SizeMatrix — Aside width clamp(240-640)',
  render: () => (
    <div className="px-[var(--layout-space-loose)] py-[var(--layout-space-loose)] space-y-3 text-body">
      <h2 className="text-h4">Aside width clamp</h2>
      <ul className="space-y-2 list-disc pl-5">
        <li>不傳 width → 320px(default)</li>
        <li>width={'{'}200{'}'} → 240px(clamp 下限,避免過窄無法閱讀)</li>
        <li>width={'{'}400{'}'} → 400px(自訂值落在 [240, 640] 內)</li>
        <li>width={'{'}800{'}'} → 640px(clamp 上限,避免過寬擠 main)</li>
        <li>width={'{{'} md: 320, xl: 480 {'}}'} → desktop=320 / wide=480 breakpoint-keyed</li>
      </ul>
      <p className="text-caption text-fg-muted">DS 不發明 width token,consumer 自決 + clamp 保護。</p>
    </div>
  ),
}
