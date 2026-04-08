import type { Meta, StoryObj } from '@storybook/react'
import React, { useState } from 'react'
import { Mail, Bell, Settings, Globe, Code, Palette, Zap, User, ChevronDown, Plus } from 'lucide-react'
import { SelectField } from '@/design-system/components/fields/SelectField/select-field'
import { MultiSelectField } from '@/design-system/components/fields/MultiSelectField/multi-select-field'
import { Button } from '@/design-system/components/Button/button'

const meta: Meta = {
  title: 'Design System/Components/SelectMenu/展示',
  parameters: { layout: 'padded' },
}
export default meta

// ── 單選（SelectField 觸發）──

const statusOptions = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'low_stock', label: 'Low stock' },
  { value: 'out_of_stock', label: 'Out of stock' },
]

const SingleSelectDemo = () => {
  const [value, setValue] = useState<string>('in_stock')
  return (
    <div className="flex flex-col gap-4 max-w-xs">
      <p className="text-caption text-fg-muted">SelectField 作為觸發點，點擊開啟 SelectMenu</p>
      <SelectField options={statusOptions} value={value} onChange={setValue} />
    </div>
  )
}

export const SingleSelect: StoryObj = {
  name: '單選',
  render: () => <SingleSelectDemo />,
}

// ── 單選 + 搜尋 ──

const countries = [
  { value: 'tw', label: '台灣' }, { value: 'jp', label: '日本' },
  { value: 'us', label: '美國' }, { value: 'gb', label: '英國' },
  { value: 'de', label: '德國' }, { value: 'fr', label: '法國' },
  { value: 'kr', label: '韓國' }, { value: 'sg', label: '新加坡' },
  { value: 'au', label: '澳洲' }, { value: 'ca', label: '加拿大' },
]

const SearchableDemo = () => {
  const [value, setValue] = useState<string>('')
  return (
    <div className="flex flex-col gap-4 max-w-xs">
      <p className="text-caption text-fg-muted">searchable — 觸發點變 input，打字即篩選</p>
      <SelectField options={countries} value={value} onChange={setValue} searchable clearable placeholder="選擇國家…" />
    </div>
  )
}

export const Searchable: StoryObj = {
  name: '搜尋',
  render: () => <SearchableDemo />,
}

// ── 多選 ──

const categoryOptions = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'food', label: 'Food' },
  { value: 'lifestyle', label: 'Lifestyle' },
]

const MultiSelectDemo = () => {
  const [value, setValue] = useState<string[]>(['electronics'])
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-caption text-fg-muted">MultiSelectField — checkbox 多選，浮層不關閉</p>
      <MultiSelectField options={categoryOptions} value={value} onChange={setValue} />
    </div>
  )
}

export const MultiSelect: StoryObj = {
  name: '多選',
  render: () => <MultiSelectDemo />,
}

// ── 多選 + 搜尋 ──

const MultiSearchDemo = () => {
  const [value, setValue] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-caption text-fg-muted">searchable — 浮層內搜尋框，關鍵字保留可連續勾選</p>
      <MultiSelectField options={countries} value={value} onChange={setValue} searchable />
    </div>
  )
}

export const MultiSearchable: StoryObj = {
  name: '多選 + 搜尋',
  render: () => <MultiSearchDemo />,
}

// ── 可清除 ──

const ClearableDemo = () => {
  const [value, setValue] = useState<string>('in_stock')
  return (
    <div className="flex flex-col gap-4 max-w-xs">
      <p className="text-caption text-fg-muted">clearable — 有值時右側出現清除按鈕</p>
      <SelectField options={statusOptions} value={value} onChange={setValue} clearable />
    </div>
  )
}

export const Clearable: StoryObj = {
  name: '可清除',
  render: () => <ClearableDemo />,
}

// ── 尺寸 ──

const SizesDemo = () => {
  const [sm, setSm] = useState<string>('in_stock')
  const [md, setMd] = useState<string>('in_stock')
  const [lg, setLg] = useState<string>('in_stock')

  return (
    <div className="flex flex-col gap-4">
      {([
        { size: 'sm' as const, value: sm, set: setSm },
        { size: 'md' as const, value: md, set: setMd },
        { size: 'lg' as const, value: lg, set: setLg },
      ]).map(({ size, value, set }) => (
        <div key={size} className="flex items-center gap-3">
          <span className="text-caption text-fg-muted font-mono w-8">{size}</span>
          <SelectField options={statusOptions} value={value} onChange={set} size={size} className="max-w-xs" />
          <Button size={size}>送出</Button>
        </div>
      ))}
    </div>
  )
}

export const Sizes: StoryObj = {
  name: '尺寸',
  render: () => <SizesDemo />,
}

// ── 狀態 ──

export const States: StoryObj = {
  name: '狀態',
  render: () => {
    const [value, setValue] = React.useState('in_stock')
    return (
      <div className="flex flex-col gap-6 max-w-xs">
        <div>
          <span className="text-caption text-fg-muted mb-1 block">edit</span>
          <SelectField options={statusOptions} value={value} onChange={setValue} />
        </div>
        <div>
          <span className="text-caption text-fg-muted mb-1 block">readonly</span>
          <SelectField mode="readonly" options={statusOptions} value={value} />
        </div>
        <div>
          <span className="text-caption text-fg-muted mb-1 block">disabled</span>
          <SelectField mode="disabled" options={statusOptions} value={value} />
        </div>
        <div>
          <span className="text-caption text-fg-muted mb-1 block">error</span>
          <SelectField options={statusOptions} value={value} onChange={setValue} error />
        </div>
      </div>
    )
  },
}
