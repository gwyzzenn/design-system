import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SwitchField } from './switch-field'
import { SelectionItem } from '@/design-system/components/SelectionControl/selection-item'
import { Switch } from '@/design-system/components/Switch/switch'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/design-system/components/Tooltip/tooltip'

const meta: Meta<typeof SwitchField> = {
  title: 'Design System/Components/Fields/SwitchField/展示',
  component: SwitchField,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof SwitchField>

/* ── 三種模式 ── */
export const Modes: Story = {
  name: '三種模式',
  render: () => {
    const [value, setValue] = React.useState(true)
    return (
      <div className="flex flex-col gap-6 max-w-xs">
        <div>
          <h3 className="text-body font-bold text-foreground mb-2">edit</h3>
          <SwitchField value={value} onChange={setValue} />
        </div>
        <div>
          <h3 className="text-body font-bold text-foreground mb-2">readonly</h3>
          <div className="flex gap-4">
            <SwitchField mode="readonly" value={true} />
            <SwitchField mode="readonly" value={false} />
          </div>
        </div>
        <div>
          <h3 className="text-body font-bold text-foreground mb-2">disabled</h3>
          <div className="flex gap-4">
            <SwitchField disabled value={true} />
            <SwitchField disabled value={false} />
          </div>
        </div>
      </div>
    )
  },
}

/* ── 搭配 SelectionItem ── */
export const WithSelectionItem: Story = {
  name: '搭配 Label（SelectionItem）',
  render: () => {
    const [notif, setNotif] = React.useState(true)
    const [autoUpdate, setAutoUpdate] = React.useState(false)
    return (
      <div className="flex flex-col gap-4 max-w-sm">
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div key={size}>
            <p className="text-caption text-fg-muted mb-1">size="{size}"</p>
            <div className="grid">
              <SelectionItem
                size={size}
                control={<Switch id={`notif-${size}`} size={size} checked={notif} onCheckedChange={setNotif} />}
                label="啟用通知"
                description="接收電子郵件和推播通知"
                htmlFor={`notif-${size}`}
              />
              <SelectionItem
                size={size}
                control={<Switch id={`auto-${size}`} size={size} checked={autoUpdate} onCheckedChange={setAutoUpdate} />}
                label="自動更新"
                htmlFor={`auto-${size}`}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <SelectionItem
                      size={size}
                      control={<Switch id={`maint-${size}`} size={size} disabled />}
                      label="維護模式（管理員限定）"
                      htmlFor={`maint-${size}`}
                      disabled
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>需要管理員權限才能切換</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    )
  },
}

/* ── Disabled 原因 Tooltip ── */
export const DisabledTooltip: Story = {
  name: 'Disabled 原因（Tooltip）',
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-caption text-fg-muted">Hover disabled 元件可看到停用原因（Tooltip 包在外層 div）</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <SelectionItem
              control={<Switch disabled defaultChecked />}
              label="雙重驗證"
              description="組織政策要求啟用，無法關閉"
              disabled
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>組織安全政策要求所有成員啟用雙重驗證</TooltipContent>
      </Tooltip>
    </div>
  ),
}
