import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Upload } from 'lucide-react'
import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup } from './field'
import { Input } from '@/design-system/components/Input/input'
import { Checkbox } from '@/design-system/components/Checkbox/checkbox'
import { Switch } from '@/design-system/components/Switch/switch'
import { Button } from '@/design-system/components/Button/button'
import { RadioGroup, RadioGroupItem } from '@/design-system/components/RadioGroup/radio-group'

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

// ── Block Control: RadioGroup ───────────────────────────────────────────

export const BlockControlRadioGroup: Story = {
  name: 'Block control — RadioGroup(自動偵測)',
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h3 className="text-body font-bold mb-2">Vertical:RadioGroup 在 control area 內堆疊</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          RadioGroup 的 `fieldLayout = 'block'` static 屬性讓 Field 自動切 block 模式——
          control area 不設 min-h、改用 padding-top 公式,第一個 option 的中線錨在 field-height/2。
          Consumer 不需要傳任何 prop。
        </p>
        <div className="max-w-sm">
          <Field>
            <FieldLabel>性別</FieldLabel>
            <RadioGroup defaultValue="female">
              <RadioGroupItem value="male" label="男性" />
              <RadioGroupItem value="female" label="女性" />
              <RadioGroupItem value="other" label="其他" />
            </RadioGroup>
            <FieldDescription>會用於統計報表,可隨時修改</FieldDescription>
          </Field>
        </div>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">Horizontal:label 第一行對齊第一個 option 中線</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          horizontal 模式下,label 的 padding-top 公式不變,
          control area 的 padding-top 也用同一條公式——兩者「第一行中線」都落在 field-height/2,
          所以 label 文字精確對齊第一個 Radio 的文字中線,後續 option 往下流。
        </p>
        <Field orientation="horizontal" labelWidth="120px">
          <FieldLabel>性別</FieldLabel>
          <RadioGroup defaultValue="female">
            <RadioGroupItem value="male" label="男性" />
            <RadioGroupItem value="female" label="女性" />
            <RadioGroupItem value="other" label="其他" />
          </RadioGroup>
        </Field>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">Inline + Block 並排:FieldGroup 韻律不斷</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          同一個 FieldGroup 內混用 inline(Input)和 block(RadioGroup),每個 Field 的 label
          第一行中線都落在同一條視覺基準上——Input 的中線、Option A 的中線、Email 的中線。
          這就是 field-height 韻律。
        </p>
        <FieldGroup>
          <Field orientation="horizontal" labelWidth="120px" required>
            <FieldLabel>姓名</FieldLabel>
            <Input placeholder="請輸入姓名" />
          </Field>
          <Field orientation="horizontal" labelWidth="120px" required>
            <FieldLabel>性別</FieldLabel>
            <RadioGroup defaultValue="female">
              <RadioGroupItem value="male" label="男性" />
              <RadioGroupItem value="female" label="女性" />
              <RadioGroupItem value="other" label="其他" />
            </RadioGroup>
          </Field>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>Email</FieldLabel>
            <Input placeholder="name@example.com" />
          </Field>
        </FieldGroup>
      </div>
    </div>
  ),
}

// ── Button as Data Input Affordance ─────────────────────────────────────

export const ButtonAsControl: Story = {
  name: 'Button 作為 control(upload / picker)',
  render: () => (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h3 className="text-body font-bold mb-2">Upload Button 作為附件欄位的 control</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          Button 是「承載 file value 的輸入介面」——點擊開檔案選擇器,結果寫回 field。
          Button 高度與 `field-height` 共用同一組 token,放進 inline control area 自然對齊
          Input 中線,horizontal label 公式也直接套用,不需要任何特例。
        </p>
        <FieldGroup>
          <Field orientation="horizontal" labelWidth="120px" required>
            <FieldLabel>專案名稱</FieldLabel>
            <Input placeholder="如:Q2 行銷活動" />
          </Field>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>合約附件</FieldLabel>
            <Button startIcon={Upload} variant="secondary">上傳檔案</Button>
            <FieldDescription>PDF / DOCX,最大 10 MB</FieldDescription>
          </Field>
          <Field orientation="horizontal" labelWidth="120px">
            <FieldLabel>備註</FieldLabel>
            <Input placeholder="選填" />
          </Field>
        </FieldGroup>
      </div>

      <div>
        <h3 className="text-body font-bold mb-2">判斷標準:點擊是否產生此欄位的 value?</h3>
        <p className="text-caption text-fg-muted mb-4 max-w-xl">
          ✅ 上傳檔案、開選人對話框、Connect OAuth——Button 是 control。<br/>
          ❌ 表單 submit / cancel、頁面導覽、刪除整筆資料——這些是 form / page action,
          不是 field control,要放在 form footer 或 page header。
        </p>
      </div>
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
