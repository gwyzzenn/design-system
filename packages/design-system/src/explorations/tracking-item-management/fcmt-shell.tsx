// FCMT prototype 共用 App Shell——兩個 candidate story(清單 / 詳情)共用同一個殼,
// 對齊 M17 SSOT(不重複刻兩份 shell)。結構抄 `apps/template/src/App.tsx`
// canonical archetype(M23(d) nearest-same-purpose canonical wins)。
import * as React from 'react'
import type { ReactElement } from 'react'
import { AppShell } from '@/design-system/components/AppShell/app-shell'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/design-system/components/Sidebar/sidebar'
import { ChromeHeader } from '@/design-system/patterns/header-canonical/chrome-header'
import { TooltipProvider } from '@/design-system/components/Tooltip/tooltip'
import { Avatar } from '@/design-system/components/Avatar/avatar'
import { Input } from '@/design-system/components/Input/input'
import { LayoutDashboard, HardHat, ClipboardList, BarChart3, Database, Upload, Search } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: '儀表板', icon: LayoutDashboard },
  { id: 'program', label: '建廠專案', icon: HardHat },
  { id: 'tracking', label: '追蹤單', icon: ClipboardList },
  { id: 'reports', label: '報表', icon: BarChart3 },
  { id: 'master', label: '主檔管理', icon: Database },
  { id: 'import', label: '匯入', icon: Upload },
] as const

export type FcmtNavId = (typeof NAV)[number]['id']

function FcmtSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 min-w-0 group-data-[collapsible=icon]:justify-center">
          <Avatar alt="FCMT" size={24} shape="square" color="blue" solid />
          <span className="text-body-lg font-medium truncate group-data-[collapsible=icon]:hidden">
            建廠物料追蹤 FCMT
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ id, label, icon }) => (
                <SidebarMenuItem key={id}>
                  {/* active 視覺由 SidebarProvider activeId 自動計算(id prop),不手動標 data-active */}
                  <SidebarMenuButton id={id} startIcon={icon} tooltip={label}>
                    {label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div role="group" aria-label="當前使用者">
                <Avatar alt="林建宏" size={24} color="blue" />
                <span data-sidebar="menu-label" className="min-w-0 flex-1 truncate">林建宏・區塊工程師</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

// PRD 9.3「全域搜尋 placeholder 須寫明可搜尋物件類型」——禁泛用 Search…
function FcmtHeader({ title, rightSlot }: { title: string; rightSlot?: ReactElement<any, any> }) {
  return (
    <ChromeHeader className="bg-surface gap-3">
      <SidebarTrigger />
      <h1 className="text-body-lg font-medium truncate">{title}</h1>
      <div className="flex-1 min-w-0 max-w-sm">
        <Input
          size="sm"
          startIcon={Search}
          placeholder="用追蹤單號或物料搜尋"
          aria-label="全域搜尋"
        />
      </div>
      <div className="flex-1" />
      {rightSlot}
    </ChromeHeader>
  )
}

export function FcmtShell({
  activeId,
  title,
  headerRightSlot,
  children,
}: {
  activeId: FcmtNavId
  title: string
  headerRightSlot?: ReactElement<any, any>
  children: React.ReactNode
}) {
  const [active, setActive] = React.useState<string>(activeId)
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={300}>
      <SidebarProvider activeId={active} onActiveChange={setActive}>
        <AppShell
          layout="primary-sidebar"
          sidebar={<FcmtSidebar />}
          header={<FcmtHeader title={title} rightSlot={headerRightSlot} />}
        >
          {children}
        </AppShell>
      </SidebarProvider>
    </TooltipProvider>
  )
}
