---
description: Scaffold a new design system component following canonical structure (tsx / spec.md / 3 stories). Runs placement + naming checks per CLAUDE.md rules before writing files.
---

# /new-component — 新增元件 scaffold

Usage: `/new-component <ComponentName>` (PascalCase, e.g., `Accordion` / `NumberField`)

This command scaffolds a new design-system component following the canonical structure. It does NOT write random boilerplate — it runs the **pre-creation decision protocol** per CLAUDE.md, then writes files only after design decisions are clear.

## Phase 1 — Pre-scaffold decisions (DO THESE FIRST)

Before writing any file, answer these 5 questions by reading CLAUDE.md + asking user if ambiguous:

### Q1: Layout Family classification (CLAUDE.md 4-Family Model)

Which family does this component belong to? (THIS DETERMINES SPEC STRUCTURE)

- **Family 1 (Menu item layout)** — in-menu scanning rows (MenuItem / TreeItem / etc.)
- **Family 2 (List item layout)** — on-page reading rows (StepItem / FileItem / Notice / SelectionItem)
- **Family 3 (Pill layout)** — single-line clickable pills (Button / SegmentedControl / Chip / Tag)
- **Family 4 (Field control layout)** — single-line editable data (Input / Select / etc.)
- **Self-contained primitive** — no prefix/content/suffix structure (Switch / Avatar / Badge / etc.)
- **Composite / multi-section** — own layout (Dialog / NameCard / Tabs root / etc.)

**If uncertain** → STOP, read `patterns/item-layout/item-layout.spec.md` + `components/Button/button.spec.md`, ask user.

### Q2: Implementation base (CLAUDE.md Spec 規則 定位段落要求)

- `基於 Radix X` — wrap a Radix primitive
- `基於 cmdk / sonner / @tanstack/react-table` — wrap specialized library
- `native HTML element` — e.g., Input wraps native `<input>`
- `自建` — 100% custom (must document why not using existing primitives)

### Q3: Naming 三重 test（CLAUDE.md 命名必過三重 test）

For the component name AND any variant/mode/prop value names you'll introduce:

1. **Existing design language test**: aligned with Button variant / Tag size / Field mode naming patterns?
2. **World-class idiom test**: at least 2 world-class DS (Polaris / Material / Atlassian / Ant / Carbon / HIG) use this term?
3. **Cross-component prop value 認知衝突 test**: `grep -r 'variant\|mode\|size' src/design-system/components/*/} ` for any literal collision with different semantics?

**Any test fails → iterate naming before scaffolding**.

### Q4: Internal vs Components/ classification (CLAUDE.md Story → Internal vs Components 判斷 test)

- **Components/**: has default visual, consumer uses directly
- **Internal/**: behavior primitive, no default visual, always wrapped by another component

Default to `Components/`. Only choose `Internal/` if all 3 tests in CLAUDE.md `## Internal vs Components 判斷 test` point Internal.

### Q5: What sizes + variants?

- Size baseline per Family:
  - Family 1-4 base: `sm / md / lg` (Family 3 可選加 `xs`)
  - Single-size or mode-driven exceptions must be documented in CLAUDE.md `# 系統內部 Layout — 4-Family Model` → 合法偏離 table
- Default size: 如果屬 field-height family,必須 `md` (CLAUDE.md Family 3+4 共享 default)

## Phase 2 — Scaffold files

Only after Phase 1 is resolved, create these 5 files in `src/design-system/components/{ComponentName}/`:

### 1. `{kebab-name}.tsx`

```tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// TODO: fill in cva with your variants / sizes / states
const {camelName}Variants = cva(
  'TODO-base-classes',
  {
    variants: {
      size: {
        sm: 'TODO',
        md: 'TODO',  // ★ default for field-height family
        lg: 'TODO',
      },
    },
    defaultVariants: {
      size: 'md',  // align with Layout Family baseline
    },
  }
)

export interface {ComponentName}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof {camelName}Variants> {
  // TODO: add component-specific props (use "is what" naming, not "is where" per Props 命名原則)
}

export const {ComponentName} = React.forwardRef<HTMLDivElement, {ComponentName}Props>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn({camelName}Variants({ size, className }))}
      {...props}
    />
  )
)
{ComponentName}.displayName = '{ComponentName}'

// Export cva for external composition per shadcn pattern
export { {camelName}Variants }
```

**Checklist**:
- forwardRef ✓
- displayName ✓
- `...props` spread ✓
- cva for variants ✓
- cva exported ✓
- No `shadow-md/lg/etc` (use `shadow-[var(--elevation-200)]` if needed — check_token_hygiene hook will catch)
- No shadcn compat aliases (bg-popover / text-muted-foreground / etc.)
- Tokens via `var(--foo)` in arbitrary values (never `[--foo]` shorthand)

### 2. `{kebab-name}.spec.md`

```markdown
# {ComponentName} 設計原則

## 定位

{一句話說清楚元件是什麼、解決什麼問題}

**實作基礎**:{Radix X / cmdk / native HTML / 自建 + 理由}

**Layout Family**:CLAUDE.md 4-Family Model **Family N（...）** 消費者 / 或「本元件不屬於 4-Family Model,是 self-contained primitive / composite——自己的結構見下」。結構繼承 `{pointer-to-SSOT}`。

---

## 何時用

- TODO

## 何時不用

| 場景 | 改用 | 原因 |
|------|------|------|
| TODO | TODO | TODO |

---

## 與近親元件的分界

{如有,參考 CLAUDE.md Spec 規則 → SSOT 規則決定 own 還是 pointer}

---

## 變體 / Size / State

TODO:描述 variant / size / state 的何時用 / 不用 + 為什麼

---

## 禁止事項

- ❌ TODO(常見誤用)

---

## 相關

- TODO:近親元件 / pattern spec / token spec pointer(reciprocal)
```

### 3. `{kebab-name}.stories.tsx`(showcase)

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { {ComponentName} } from './{kebab-name}'

const meta: Meta<typeof {ComponentName}> = {
  title: 'Design System/Components/{ComponentName}/展示',
  component: {ComponentName},
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof {ComponentName}>

// TODO: showcase examples using real product scenarios (not Option A/B/C)
// Reference CLAUDE.md # Story → 範例選擇原則 for 合法場景來源

export const Default: Story = {
  render: () => <{ComponentName}>TODO 真實業務場景</{ComponentName}>,
}
```

### 4. `{kebab-name}.anatomy.stories.tsx`(spec,5 sections required)

```tsx
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { {ComponentName} } from './{kebab-name}'
import { H3, Desc, Td, Th, TokenCell } from '@/design-system/components/_anatomy/anatomy-utils'

const meta: Meta = {
  title: 'Design System/Components/{ComponentName}/設計規格',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

// Section 1: 元件總覽
export const Overview: Story = {
  name: '元件總覽',
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <H3>Anatomy</H3>
        <Desc>TODO:元件結構描述 + slot 說明</Desc>
        {/* TODO: Anatomy diagram */}
      </div>
      <div>
        <H3>Props 速查</H3>
        <div className="overflow-x-auto">
          <table className="text-caption border-collapse">
            <thead><tr><Th>Prop</Th><Th>Type</Th><Th>Default</Th><Th>說明</Th></tr></thead>
            <tbody>
              {/* TODO: Props rows matching cva + props interface */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
}

// Section 2: 元件檢閱器 (Figma inspect-level)
// TODO: add interactive controls + Inspect panel with live swatches

// Section 3: 色彩對照表
// TODO: Variant × State matrix with TokenCell live swatches

// Section 4: 尺寸對照表
// TODO: Size token table + visual matrix

// Section 5: 狀態行為
// TODO: interaction transitions + disabled for all variants
```

**重要**:使用 `TokenCell` from shared `_anatomy/anatomy-utils`,不要再 local 定義 helper(參考 B5 refactor 的 26 個已遷移檔案)。

### 5. `{kebab-name}.principles.stories.tsx`(usage do/don't)

```tsx
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { {ComponentName} } from './{kebab-name}'

const meta: Meta = {
  title: 'Design System/Components/{ComponentName}/設計原則',
  parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const Rule = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <div className="mb-14">
    <h3 className="text-body font-bold text-foreground mb-1">{title}</h3>
    {note && <p className="text-caption text-fg-muted mb-5 max-w-[720px] leading-relaxed">{note}</p>}
    <div className="flex flex-col gap-3 max-w-md">{children}</div>
  </div>
)

const Label = ({ children, warn }: { children: React.ReactNode; warn?: boolean }) => (
  <p className={`text-footnote leading-normal ${warn ? 'text-error font-medium' : 'text-fg-muted'}`}>{children}</p>
)

// TODO: 3-5 rules,每個是真實產品場景(Jira/Stripe/Notion/Slack 等)
// 參考 CLAUDE.md # Story → 範例選擇原則 + 現有 Button/Select/Checkbox principles 範例

export const WhenToUseRule: Story = {
  name: '規則 1:TODO 命名',
  render: () => (
    <div>
      <Rule title="✅ TODO 推薦用法" note="TODO 解釋為什麼這樣用">
        {/* TODO 真實場景範例 */}
      </Rule>
      <Rule title="❌ TODO 反模式" note="TODO 解釋為什麼不該這樣">
        {/* TODO 反模式範例 */}
        <Label warn>TODO warning 說明</Label>
      </Rule>
    </div>
  ),
}
```

## Phase 3 — Post-scaffold verification

After scaffolding:

1. **Run `npx tsc --noEmit`** — must pass
2. **Open Storybook** — verify all 3 stories render without error
3. **Check 元件完成清單** (CLAUDE.md) — walk through checkbox list
4. **Audit the new component** — invoke `/design-system-audit` (or mental walk through 18 audits) to verify nothing violated
5. **Update memory** if it's a notable architecture decision (layout family classification etc.)

## Phase 4 — Consumer updates (if applicable)

If the new component is consumer of an existing SSOT:
- Add it to the SSOT's consumer table (reciprocal pointer — CLAUDE.md `# Spec 規則` → SSOT rule: reciprocal 必須存在)
- E.g., new Family 1 consumer → add to `item-layout.spec.md`'s Family 1 consumer table

## Commit

```
feat({componentName}): new component — {Family / 用途 一句話}
```

---

## Don'ts

- ❌ 不要跳過 Phase 1 直接 scaffold(會產生跟系統不對齊的元件)
- ❌ 不要用 TODO 命名 prop / variant(必先過三重 test)
- ❌ 不要複製 H3/Desc/Td/Th local helpers(統一 import from `_anatomy/anatomy-utils`)
- ❌ 不要忘記 Layout Family declaration(spec 第一段必含)
- ❌ 不要用 shadcn compat alias `bg-popover` / `text-muted-foreground` 等(direct token)
