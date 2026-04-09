import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useFieldContext } from "@/design-system/components/Field/field"
import { SelectionItem } from "@/design-system/components/SelectionControl/selection-item"

// ── Variants ────────────────────────────────────────────────────────────────
// 三種尺寸（sm/md=16px, lg=20px），對齊 icon 系統與 SelectionItem。

const checkboxVariants = cva(
  [
    'grid place-content-center shrink-0 rounded-md',
    'border border-border bg-surface',
    'transition-colors duration-150',
    'hover:border-border-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
    'data-[state=checked]:bg-primary data-[state=checked]:text-white data-[state=checked]:border-primary',
    'data-[state=checked]:hover:bg-primary-hover data-[state=checked]:hover:border-primary-hover',
    'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-white data-[state=indeterminate]:border-primary',
    'data-[state=indeterminate]:hover:bg-primary-hover data-[state=indeterminate]:hover:border-primary-hover',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:border-transparent disabled:hover:border-transparent',
    'disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:text-fg-disabled disabled:data-[state=checked]:border-transparent',
    'disabled:data-[state=indeterminate]:bg-disabled disabled:data-[state=indeterminate]:text-fg-disabled disabled:data-[state=indeterminate]:border-transparent',
    // readOnly：鎖定互動但維持 checked/unchecked 視覺
    'data-[readonly=true]:pointer-events-none data-[readonly=true]:cursor-default',
    'data-[readonly=true]:hover:border-border',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

// ── Check Icon Size ─────────────────────────────────────────────────────────
const checkIconSize: Record<string, number> = { sm: 12, md: 12, lg: 16 }

// ── Types ───────────────────────────────────────────────────────────────────

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Inline label。提供時 Checkbox 自動透過 SelectionItem 包裝，
   * 套用 text-body / text-foreground / disabled 色 的 codified 樣式。
   * 在 <Field> context 內時此 prop 會被忽略（由 FieldLabel 接管）。
   */
  label?: React.ReactNode
  /**
   * Inline description（secondary 文字）。須與 label 搭配使用。
   * 套用 text-body / text-fg-secondary 樣式。
   * 在 <Field> context 內時此 prop 會被忽略（由 FieldDescription 接管）。
   */
  description?: React.ReactNode
  /**
   * readonly 模式：鎖定互動但維持 checked/unchecked 視覺正確。
   * 與 disabled 的差異：readonly 不降色（可讀），disabled 降色（弱化）。
   * 用於表單 readonly 呈現、DataTable cell 非編輯態。
   */
  readOnly?: boolean
}

// ── Component ───────────────────────────────────────────────────────────────

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      size,
      label,
      description,
      readOnly = false,
      disabled,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const sizeKey = size ?? 'md'
    const iconPx = checkIconSize[sizeKey]

    // Field context：在 Field 內時忽略自己的 label/description
    const fieldCtx = useFieldContext()
    const insideField = fieldCtx?.hasFieldWrapper === true
    const effectiveLabel = insideField ? undefined : label
    const effectiveDescription = insideField ? undefined : description

    // Id 連結
    const generatedId = React.useId()
    const inputId = idProp ?? fieldCtx?.id ?? generatedId

    const rootEl = (
      <CheckboxPrimitive.Root
        id={inputId}
        ref={ref}
        disabled={disabled}
        aria-readonly={readOnly || undefined}
        data-readonly={readOnly || undefined}
        tabIndex={readOnly ? -1 : undefined}
        aria-describedby={fieldCtx?.descriptionId}
        className={cn(checkboxVariants({ size }), className)}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="grid place-content-center text-current">
          {props.checked === 'indeterminate'
            ? <Minus style={{ width: iconPx, height: iconPx }} />
            : <Check style={{ width: iconPx, height: iconPx }} />
          }
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    )

    // 無 label → 只渲染 checkbox 本體
    if (effectiveLabel == null) return rootEl

    // 有 label → 透過 SelectionItem 包裝（control 在左、label+description 在右）
    return (
      <SelectionItem
        control={rootEl}
        label={effectiveLabel}
        description={effectiveDescription}
        htmlFor={inputId}
        disabled={disabled}
        size={sizeKey}
      />
    )
  }
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox, checkboxVariants }
