import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field'
import { Input } from '@/design-system/components/Input/input'
import { Checkbox } from '@/design-system/components/Checkbox/checkbox'
import { Switch } from '@/design-system/components/Switch/switch'

const meta: Meta = {
  title: 'Design System/Components/Field/展示',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

// ── Vertical（預設） ────────────────────────────────────────────────────

export const Vertical: Story = {
  name: 'Vertical（預設）',
  render: () => (
    <div className="max-w-sm">
      <FieldGroup>
        <Field required>
          <FieldLabel>姓名</FieldLabel>
          <Input placeholder="請輸入姓名" />
          <FieldDescription>中英文皆可</FieldDescription>
        </Field>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input placeholder="name@example.com" />
        </Field>

        <Field required invalid>
          <FieldLabel>密碼</FieldLabel>
          <Input placeholder="至少 8 碼" />
          <FieldError>密碼長度不足</FieldError>
        </Field>

        <Field>
          <FieldLabel>備註</FieldLabel>
          <Input placeholder="選填" />
          <FieldDescription>其他專案相關說明</FieldDescription>
        </Field>
      </FieldGroup>
    </div>
  ),
}

// ── Horizontal ──────────────────────────────────────────────────────────

export const Horizontal: Story = {
  name: 'Horizontal（label 在左）',
  render: () => (
    <div className="max-w-2xl">
      <FieldGroup>
        <Field orientation="horizontal" labelWidth="120px" required>
          <FieldLabel>姓名</FieldLabel>
          <Input placeholder="請輸入姓名" />
          <FieldDescription>中英文皆可</FieldDescription>
        </Field>

        <Field orientation="horizontal" labelWidth="120px">
          <FieldLabel>Email</FieldLabel>
          <Input placeholder="name@example.com" />
        </Field>

        <Field orientation="horizontal" labelWidth="120px" required invalid>
          <FieldLabel>密碼</FieldLabel>
          <Input placeholder="至少 8 碼" />
          <FieldError>密碼長度不足</FieldError>
        </Field>
      </FieldGroup>
    </div>
  ),
}

// ── Horizontal 垂直對齊公式驗證 ─────────────────────────────────────────

export const HorizontalLabelAlignment: Story = {
  name: 'Horizontal — label 垂直對齊公式驗證',
  render: () => (
    <div className="max-w-3xl flex flex-col gap-8">
      <div>
        <h3 className="text-body font-bold mb-2">驗證：單行 label 與 input 中線對齊</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          Label 是單行時，文字應與 input 的文字中線完全對齊。
          這是 padding-top: calc((field-height - 1lh) / 2) 的基本情境。
        </p>
        <Field orientation="horizontal" labelWidth="160px">
          <FieldLabel>短 label</FieldLabel>
          <Input placeholder="input 中線應與 label 對齊" />
        </Field>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">驗證：多行 label 第一行對齊 input 中線</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          Label 換行時，第一行仍然與 input 中線對齊，後續行往下流。
          視覺上 label 從 input 中線往下延伸，而不是從 input 頂部開始。
        </p>
        <Field orientation="horizontal" labelWidth="160px">
          <FieldLabel>這是一個會換行的很長的 label 用來驗證多行情境</FieldLabel>
          <Input placeholder="input 中線應與 label 第一行對齊" />
        </Field>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">驗證：size 切換時 label 自動跟隨</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          公式用 `var(--field-height-{size})`，size 切換時 padding-top 自動重算，
          無需 JS 測量。
        </p>
        <div className="flex flex-col gap-3">
          <Field orientation="horizontal" labelWidth="100px" size="sm">
            <FieldLabel>sm size</FieldLabel>
            <Input size="sm" placeholder="28px high" />
          </Field>
          <Field orientation="horizontal" labelWidth="100px" size="md">
            <FieldLabel>md size</FieldLabel>
            <Input size="md" placeholder="32px high" />
          </Field>
          <Field orientation="horizontal" labelWidth="100px" size="lg">
            <FieldLabel>lg size</FieldLabel>
            <Input size="lg" placeholder="36px high" />
          </Field>
        </div>
      </div>
    </div>
  ),
}

// ── Checkbox / Switch 在 Field 內的高度對齊 ─────────────────────────────

export const MixedControlAlignment: Story = {
  name: '混合 Control 的 field 高度對齊',
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h3 className="text-body font-bold mb-2">垂直 Field：Input / Checkbox / Switch 高度節奏一致</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          每個 Field 的 control area 都是 `min-h-field-md` + items-center。
          Input 填滿 32px，Checkbox / Switch 維持 primitive 原生尺寸並垂直置中。
        </p>
        <FieldGroup>
          <Field>
            <FieldLabel>姓名</FieldLabel>
            <Input placeholder="text input" />
          </Field>
          <Field>
            <FieldLabel>訂閱電子報</FieldLabel>
            <Checkbox />
          </Field>
          <Field>
            <FieldLabel>開啟通知</FieldLabel>
            <Switch />
          </Field>
        </FieldGroup>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">水平並排：Input / Checkbox / Switch 中線對齊</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          多個 Field 橫向並排時，每個 Field 的 control 中線都在同一水平線上。
        </p>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel>姓名</FieldLabel>
            <Input placeholder="input" />
          </Field>
          <Field>
            <FieldLabel>訂閱</FieldLabel>
            <Checkbox />
          </Field>
          <Field>
            <FieldLabel>通知</FieldLabel>
            <Switch />
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">Horizontal Field：label 與任何 control 都對齊中線</h3>
        <FieldGroup>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>姓名</FieldLabel>
            <Input placeholder="text input" />
          </Field>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>訂閱電子報</FieldLabel>
            <Checkbox />
          </Field>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>開啟通知</FieldLabel>
            <Switch />
          </Field>
        </FieldGroup>
      </div>
    </div>
  ),
}

// ── Required / Disabled / Invalid ───────────────────────────────────────

export const States: Story = {
  name: '狀態',
  render: () => (
    <div className="max-w-sm">
      <FieldGroup>
        <Field>
          <FieldLabel>一般</FieldLabel>
          <Input placeholder="預設狀態" />
          <FieldDescription>輔助說明文字</FieldDescription>
        </Field>

        <Field required>
          <FieldLabel>必填</FieldLabel>
          <Input placeholder="label 前有 *" />
          <FieldDescription>required prop 自動在 label 前加 *</FieldDescription>
        </Field>

        <Field disabled>
          <FieldLabel>Disabled</FieldLabel>
          <Input placeholder="disabled" disabled />
          <FieldDescription>label 與 description 都變灰</FieldDescription>
        </Field>

        <Field required disabled>
          <FieldLabel>Required + Disabled</FieldLabel>
          <Input placeholder="disabled" disabled />
          <FieldDescription>required 星號也會降成 disabled 色</FieldDescription>
        </Field>

        <Field invalid>
          <FieldLabel>Invalid</FieldLabel>
          <Input placeholder="with error" />
          <FieldError>此欄位必填</FieldError>
        </Field>

        <Field required invalid>
          <FieldLabel>必填 + Invalid</FieldLabel>
          <Input placeholder="with error" />
          <FieldError>格式不正確，請重新輸入</FieldError>
        </Field>
      </FieldGroup>
    </div>
  ),
}

// ── Label Width 變化 ────────────────────────────────────────────────────

export const LabelWidth: Story = {
  name: 'labelWidth 變化',
  render: () => (
    <div className="max-w-2xl flex flex-col gap-4">
      <p className="text-caption text-fg-muted">labelWidth 支援任何 CSS length 值</p>
      <Field orientation="horizontal" labelWidth="80px">
        <FieldLabel>80px</FieldLabel>
        <Input placeholder="short label column" />
      </Field>
      <Field orientation="horizontal" labelWidth="160px">
        <FieldLabel>160px（預設常用）</FieldLabel>
        <Input placeholder="typical settings form" />
      </Field>
      <Field orientation="horizontal" labelWidth="240px">
        <FieldLabel>240px（寬 label 欄）</FieldLabel>
        <Input placeholder="wide label column" />
      </Field>
      <Field orientation="horizontal" labelWidth="30%">
        <FieldLabel>30%（比例）</FieldLabel>
        <Input placeholder="percentage" />
      </Field>
    </div>
  ),
}
