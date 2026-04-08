import * as React from 'react'
import { cn } from '@/lib/utils'
import type { FieldMode } from '@/design-system/components/fields/field-types'
import { fieldWrapperStyles, EMPTY_DISPLAY } from '@/design-system/components/fields/field-wrapper'
import { Switch } from '@/design-system/components/Switch/switch'

/**
 * SwitchField — 布林值的輸入與顯示元件（Switch 版）
 *
 * 與 CheckboxField 的差異：
 * - Edit/disabled 用 Switch 而非 Checkbox
 * - Readonly 用文字（✓ / —），跟 CheckboxField 相同
 * - Switch 視覺上更適合「開關」語意（啟用/停用功能）
 *
 * 何時用 SwitchField vs CheckboxField：
 * - SwitchField：「開啟/關閉某個功能」（即時生效）
 * - CheckboxField：「勾選/取消勾選」（表單送出後生效）
 */

// ── Display ─────────────────────────────────────────────────────────────────

function SwitchFieldDisplay({ value }: { value?: boolean | null }) {
  if (value) return <span>✓</span>
  return <span className="text-fg-muted">{EMPTY_DISPLAY}</span>
}
SwitchFieldDisplay.displayName = 'SwitchFieldDisplay'

// ── Types ───────────────────────────────────────────────────────────────────

export interface SwitchFieldProps {
  mode?: FieldMode
  value?: boolean | null
  onChange?: (value: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  readOnly?: boolean
}

// ── Component ───────────────────────────────────────────────────────────────

const SwitchField = React.forwardRef<HTMLDivElement, SwitchFieldProps>(
  ({ mode = 'edit', value, onChange, size = 'md', className, disabled, readOnly, ...props }, ref) => {
    const resolvedMode = disabled ? 'disabled' : readOnly ? 'readonly' : mode

    // readonly → 文字
    if (resolvedMode === 'readonly') {
      return (
        <div
          ref={ref}
          className={cn(
            fieldWrapperStyles({ mode: 'readonly', size }),
            'items-center',
            className,
          )}
          data-field-mode="readonly"
          {...props}
        >
          <SwitchFieldDisplay value={value} />
        </div>
      )
    }

    // edit / disabled → Switch
    const isDisabled = resolvedMode === 'disabled'

    return (
      <div ref={ref} className={className} {...props}>
        <Switch
          size={size}
          checked={!!value}
          onCheckedChange={onChange}
          disabled={isDisabled}
        />
      </div>
    )
  }
)
SwitchField.displayName = 'SwitchField'

export { SwitchField, SwitchFieldDisplay }
