import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  LayoutDashboard, Users, Settings, Bell,
  ShieldCheck, SlidersHorizontal, FileText,
  MoreHorizontal, Plus,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from './sidebar'
import { TreeView, TreeItem } from '@/design-system/components/TreeView/tree-view'
import { Avatar } from '@/design-system/components/Avatar/avatar'

/**
 * Inline action button for tree items (same as TreeView stories).
 */
const TreeAction = ({ icon: Icon, label }: { icon: React.ComponentType<{ size: number; className?: string }>; label: string }) => (
  <button
    type="button"
    className="relative flex items-center justify-center w-4 h-4 text-fg-muted hover:text-foreground transition-colors before:absolute before:inset-[-1px] before:rounded-sm before:bg-transparent hover:before:bg-neutral-hover before:transition-colors"
    aria-label={label}
    onClick={(e) => e.stopPropagation()}
  >
    <Icon size={16} className="relative" />
  </button>
)

const meta: Meta = {
  title: 'Design System/Components/Sidebar/展示',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

// ── Full Page Layout ───────────────────────────────────────────────────────

export const FullPageLayout: Story = {
  name: '完整頁面佈局',
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen bg-canvas">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between w-full gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-caption font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-body font-semibold truncate">Acme Inc</span>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <TreeView
              aria-label="側邊導覽"
              defaultExpandedIds={['team', 'settings']}
            >
              <TreeItem
                id="dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                actions={<TreeAction icon={MoreHorizontal} label="更多" />}
              />
              <TreeItem
                id="team"
                icon={Users}
                label="Team"
                actions={
                  <>
                    <TreeAction icon={Plus} label="新增" />
                    <TreeAction icon={MoreHorizontal} label="更多" />
                  </>
                }
              >
                <TreeItem
                  id="members"
                  icon={Users}
                  label="Members"
                  actions={<TreeAction icon={MoreHorizontal} label="更多" />}
                />
                <TreeItem
                  id="roles"
                  icon={ShieldCheck}
                  label="Roles"
                  actions={<TreeAction icon={MoreHorizontal} label="更多" />}
                />
              </TreeItem>
              <TreeItem
                id="notifications"
                icon={Bell}
                label="Notifications"
                actions={<TreeAction icon={MoreHorizontal} label="更多" />}
              />
              <TreeItem
                id="settings"
                icon={Settings}
                label="Settings"
                actions={
                  <>
                    <TreeAction icon={Plus} label="新增" />
                    <TreeAction icon={MoreHorizontal} label="更多" />
                  </>
                }
              >
                <TreeItem
                  id="general"
                  icon={SlidersHorizontal}
                  label="General"
                  actions={<TreeAction icon={MoreHorizontal} label="更多" />}
                />
                <TreeItem
                  id="security"
                  icon={ShieldCheck}
                  label="Security"
                  actions={<TreeAction icon={MoreHorizontal} label="更多" />}
                />
                <TreeItem
                  id="billing"
                  icon={FileText}
                  label="Billing"
                  actions={<TreeAction icon={MoreHorizontal} label="更多" />}
                />
              </TreeItem>
            </TreeView>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2 min-w-0">
              <Avatar size={28} alt="Alan Chen" color="blue" />
              <span className="text-body truncate">Alan Chen</span>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content area */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl">
            <h1 className="text-h4 font-semibold mb-4">Dashboard</h1>
            <p className="text-body text-fg-secondary mb-6">
              左側是 Sidebar 元件，包含 TreeView 導覽。點擊左上角的收合按鈕可切換 sidebar 寬度。
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['專案數量', '團隊成員', '本週提交', '待處理'].map((title) => (
                <div key={title} className="rounded-lg border border-divider bg-surface p-4">
                  <p className="text-caption text-fg-muted">{title}</p>
                  <p className="text-h5 font-semibold mt-1">{Math.floor(Math.random() * 100)}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  ),
}

// ── Right Sidebar ──────────────────────────────────────────────────────────

export const RightSidebar: Story = {
  name: '右側 Sidebar',
  render: () => (
    <SidebarProvider>
      <div className="flex h-screen bg-canvas">
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl">
            <h1 className="text-h4 font-semibold mb-4">文件編輯器</h1>
            <p className="text-body text-fg-secondary">
              右側 Sidebar 適合放置屬性面板、inspector 等輔助資訊。
            </p>
          </div>
        </main>

        <Sidebar side="right">
          <SidebarHeader>
            <div className="flex items-center justify-between w-full gap-2">
              <SidebarTrigger side="right" />
              <span className="text-body font-semibold truncate">屬性</span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <div className="px-[var(--layout-space-loose)] py-3 flex flex-col gap-3">
              {['外觀', '佈局', '間距', '字體', '色彩'].map((section) => (
                <div key={section}>
                  <p className="text-caption font-medium text-fg-muted mb-2">{section}</p>
                  <div className="h-8 rounded-md bg-neutral-hover" />
                </div>
              ))}
            </div>
          </SidebarContent>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
}

// ── Default Collapsed ──────────────────────────────────────────────────────

export const DefaultCollapsed: Story = {
  name: '預設收合',
  render: () => (
    <SidebarProvider defaultCollapsed>
      <div className="flex h-[480px] bg-canvas border border-divider rounded-lg overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between w-full gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-caption font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-body font-semibold truncate">Acme Inc</span>
              </div>
              <SidebarTrigger />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <TreeView aria-label="側邊導覽">
              <TreeItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
              <TreeItem id="team" icon={Users} label="Team" />
              <TreeItem id="notifications" icon={Bell} label="Notifications" />
              <TreeItem id="settings" icon={Settings} label="Settings" />
            </TreeView>
          </SidebarContent>

          <SidebarFooter>
            <div className="flex items-center gap-2 min-w-0">
              <Avatar size={28} alt="Alan Chen" color="blue" />
              <span className="text-body truncate">Alan Chen</span>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto">
          <p className="text-body text-fg-secondary">
            Sidebar 預設收合，點擊展開按鈕查看完整導覽。
          </p>
        </main>
      </div>
    </SidebarProvider>
  ),
}
