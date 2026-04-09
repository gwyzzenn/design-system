# Field 設計原則

## 定位

Field 是**表單欄位的佈局容器**。只負責排版（label / control / description / error 的空間關係）與**狀態 context**（把 mode / disabled / required / invalid / id 傳給子元件），**不擁有任何資料型別邏輯**。

與資料相關的一切（格式化、驗證、readonly 呈現、DataTable cell 顯示）住在各個資料型別的 Control 元件本身（Input、NumberInput、Checkbox、Switch 等）。Field 不 wrap、不代理、不轉換它們的行為。

---

## 與現有 fields/XxxField 的關係

本專案原本的 `fields/TextField` / `NumberField` / `CheckboxField` 等是**型別感知 + Field 佈局合一**的單一元件。新架構把這兩個職責拆開：

- **Field**（本元件）：只管佈局 + 狀態 context
- **Control 元件**（Input、Checkbox、Switch 等）：只管自己的資料型別 + edit/readonly/disabled 三態 + 格式化（XxxDisplay 供 DataTable 共用）

這麼拆的理由：**Checkbox 在 table cell 和 form field 裡應該是同一個 primitive**，不該為了進到 form 就被包一層 CheckboxField；form 的高度對齊由 Field 的 control area 負責，不由 primitive 本身負責。

---

## 結構

```tsx
<Field orientation="vertical | horizontal" labelWidth="120px">
  <FieldLabel>姓名</FieldLabel>
  <Input value={name} onChange={setName} />
  <FieldDescription>會顯示在專案列表標題</FieldDescription>
  <FieldError>{errors.name}</FieldError>
</Field>
```

子元件有四種 slot：

| Slot | 元件 | 職責 |
|---|---|---|
| label | `<FieldLabel>` | 欄位名稱，handles required 星號、disabled 灰化、htmlFor 連結 |
| control | 任何非 label/desc/error 的 child | 輸入元件本體（Input、Checkbox、Switch...） |
| description | `<FieldDescription>` | 次要說明文字，fg-secondary |
| error | `<FieldError>` | 錯誤訊息，error-text 色，`role="alert"`，無內容時不渲染 |

子元件寫法採**扁平結構**（直接作為 Field children），Field 內部用 `displayName` 判別 slot 類型並自動組合。consumer 不需要包 wrapper。

---

## 樣式規範（全部 codify 在 field.tsx，不依賴 consumer）

| 元素 | Token / 值 |
|---|---|
| FieldLabel（一般） | `text-body`（14px）/ `text-foreground`（neutral-9） |
| FieldLabel（disabled） | `text-body` / `text-fg-disabled`（neutral-6） |
| FieldLabel 的 required `*` | `text-fg-muted`（neutral-7），**貼齊 label 文字無 gap**，disabled 時 `text-fg-disabled` |
| FieldDescription（一般） | `text-body`（14px）/ `text-fg-secondary`（neutral-8） |
| FieldDescription（disabled） | `text-body` / `text-fg-disabled` |
| FieldError | `text-body`（14px）/ `text-error-text` / `role="alert"` |
| Field 內部 gap（vertical） | `gap-1`（4px） |
| Field 內部 gap（horizontal，content 欄） | `gap-1`（4px） |
| Horizontal 模式 label 與 control 的 gap | `gap-x-3`（12px） |
| Control area（任何 size） | `min-h-field-{size}` + `flex items-center` |

**lg size 的字體**：`FieldLabel` / `FieldDescription` / `FieldError` 會自動切換為 `text-body-lg`，對齊 Input 的 lg 字體。

---

## Orientation

### vertical（預設）

Label 在上、control 在下、description 和 error 往下堆疊。垂直節奏 `gap-1`（4px）。

```
[Label]
[Control]       ← min-h-field-md，control 垂直置中於此 box
[Description]
[Error]
```

適用：標準表單、密集欄位。

### horizontal

Label 在左、control + description + error 在右欄垂直堆疊。Label 與 control **垂直對齊於第一行中線**（見下一段）。

```
[Label]   [Control       ]
          [Description]
          [Error]
```

適用：settings 面板、寬螢幕 form、iOS-style 欄位。

Horizontal 模式下 label 的欄寬由 `labelWidth` prop 控制（任何 CSS length 值），預設 `auto` 由 label 內容撐開。內部用 CSS variable `--field-label-width` 傳給 grid template column。

---

## Horizontal 模式的 label 垂直對齊（重要）

### 規則

Label 文字的**第一行**永遠與 control 的文字中線對齊。單行 label 視覺上置中於 control；多行 label 的第一行仍對齊 control 中線，其餘行往下流。

### 實作公式

```css
padding-top: calc((var(--field-height-{size}) - 1lh) / 2);
```

- `--field-height-{size}` 跟隨 Field 的 size prop（sm / md / lg）
- `1lh` 是 CSS line-height unit，取當前元素的 line-height
- 整個公式等於「控制容器高度與一行文字之間的垂直空間的一半」

### 為什麼這個公式是對的

| Label 行數 | 行為 |
|---|---|
| 1 行（短 label） | padding-top 把 label 向下推到第一行中線與 control 中線對齊 → 視覺置中 ✓ |
| 多行（長 label） | 第一行仍在同一位置（與 control 中線對齊），後續行往下流，label 總高度超過 control → 視覺上「label 從 control 中線往下長」，對齊 control 內容基準線 |

### 為什麼不用 JS 測量

- 公式純 CSS，size / density / 字體切換時自動連動，不需 ResizeObserver
- 符合 CLAUDE.md「可推導的值用 calc() 或公式表達，不硬寫結果」原則
- 跨 Atlassian / Salesforce Lightning / Polaris 等世界級系統的共通做法

### 其他世界級系統的對照

| 系統 | 作法 |
|---|---|
| **Atlassian DSP** | 相同公式（`align-items: flex-start` + `padding-top`） |
| **Salesforce Lightning** | 相同（`slds-form-element__label` 有 `padding-top` 對齊） |
| **Polaris (Shopify)** | 類似（`align-items: baseline` + baseline 修正） |

---

## Control area 高度對齊（重要）

### 規則

Field 的 control area 是一個 `min-h-field-{size}` + `flex items-center` 的 box。任何 control（Input、Checkbox、Switch、Radio...）都渲染在這個 box 內。

| Control | 渲染行為 |
|---|---|
| **Input / NumberInput / DatePicker / Select / Combobox / Textarea** | 自身 height 等於 `field-height`，填滿 control area |
| **Checkbox / Switch / Radio** | 自身 height 小於 `field-height`，垂直置中於 control area box，視覺上對齊 Input 中線 |

### 為什麼 primitive 不自己變高

**Checkbox / Switch / Radio 的 primitive 保持原生尺寸**（16-20px），不為了 form 而被拉高。世界級系統（shadcn、Radix、Material、Atlassian）全部這樣做。理由：

1. **Primitive 保持單一職責**——Checkbox 在 table cell、toolbar、menu 裡仍然是 16px，不受 form 高度污染
2. **高度節奏由 Field 容器提供**——一次設定，所有 primitive 在任何 size / density 都自動對齊
3. **DataTable cell 共用同一個 min-h 機制**——不需為 cell 另發明對齊邏輯

### 水平排列 Field 時的垂直對齊

多個 Field 並排（多欄表單）時，每個 Field 的 control area 都是同樣 `min-h-field-{size}`，所以並排 Field 的 control 中線都對齊——Input、Checkbox、Switch 放在同一列時視覺上完全對齊。

---

## FieldContext — 子元件如何讀 Field 狀態

Field 透過 Context 暴露以下狀態給子元件（Primitive 可以透過 `useFieldContext()` 讀取）：

| 欄位 | 用途 |
|---|---|
| `id` | FieldLabel 自動 `htmlFor`、Input 自動 `id` |
| `descriptionId` | FieldDescription 的 id，Input 自動 `aria-describedby` |
| `errorId` | FieldError 的 id，Input 自動 `aria-errormessage` |
| `mode` | `edit` / `readonly` / `disabled`，Control 決定自己的視覺形態 |
| `disabled` | Control 顯示 disabled 樣式 |
| `required` | FieldLabel 自動渲染 `*`；Input 自動 `aria-required` |
| `invalid` | Control 顯示 error 邊框；Input 自動 `aria-invalid` |
| `size` | Control 自動同步尺寸（sm / md / lg） |
| `orientation` | FieldLabel 的垂直對齊策略（horizontal 模式套用 padding-top 公式） |
| `hasFieldWrapper` | Primitive 讀到此旗標時應忽略自己的 label / description prop，由 FieldLabel / FieldDescription 接管 |

### Primitive 的 Field-aware 行為

**Checkbox / Switch / RadioItem** 等 primitive 自己有 `label` / `description` props 可用於**獨立使用場景**（不在 Field 內），但在 Field context 內時：

- 讀到 `hasFieldWrapper === true` 就**忽略自己的 `label` / `description` props**（若 consumer 誤傳，開發環境可 warn）
- 改由 `<FieldLabel>` 和 `<FieldDescription>` 接管這兩個 slot
- 避免「雙層 label」

這個機制讓**同一個 primitive 可以在兩種情境下正確呈現**：

```tsx
// 情境 A：獨立使用（toolbar / settings row / dashboard widget）
<Checkbox label="訂閱電子報" description="每週一封" />

// 情境 B：form 內（Field 接管 label）
<Field>
  <FieldLabel>訂閱電子報</FieldLabel>
  <Checkbox />
  <FieldDescription>每週一封</FieldDescription>
</Field>
```

兩種情境用同一個 primitive，一份樣式規範。

---

## Required 星號

- Field 的 `required` prop 透過 context 傳給 FieldLabel 自動渲染 `*`
- 星號 `text-fg-muted`（neutral-7），**緊貼 label 文字無 gap**（不用 `margin-right`）
- Disabled 時星號改為 `text-fg-disabled`（neutral-6），與 label 同步降色
- 個別 FieldLabel 可用 `required` prop 覆寫 context 值

**為什麼貼齊無 gap**：星號是 label 語意的一部分（WCAG 友善——screen reader 先讀 required 再讀 label），不是獨立視覺元素，所以不需要間距。

---

## 驗證與 aria 屬性

- `invalid` 透過 context 讓 Control 顯示 error 邊框、自動 `aria-invalid`
- `errorId` 讓 Control 自動 `aria-errormessage`
- `descriptionId` 讓 Control 自動 `aria-describedby`
- `<FieldError>` 自帶 `role="alert"` 並有 id = `errorId`
- 無 children 的 `<FieldError>` 不渲染，不佔位

---

## FieldGroup — 多 Field 垂直堆疊

```tsx
<FieldGroup gap="normal">
  <Field><FieldLabel>姓名</FieldLabel><Input /></Field>
  <Field><FieldLabel>email</FieldLabel><Input /></Field>
  <Field orientation="horizontal" labelWidth="120px">
    <FieldLabel>訂閱</FieldLabel>
    <Switch />
  </Field>
</FieldGroup>
```

gap 三個選項：

| gap | 值 | 用途 |
|---|---|---|
| `compact` | `gap-3`（12px） | 密集表單、dialog 內 |
| `normal`（預設） | `gap-4`（16px） | 標準表單 |
| `loose` | `gap-6`（24px） | 寬鬆大表單、settings 頁 |

---

## 禁止事項

- ❌ 不得在 Field 內再包 Field——Field 不支援巢狀
- ❌ 不得在 Field 內同時放 `<FieldLabel>` 和給 primitive 傳 `label` prop——Field context 會讓 primitive 忽略自己的 label，但語意上仍是重複宣告，避免誤導
- ❌ 不得跳過 `<FieldLabel>` 直接寫 `<label>`——失去 required 星號、disabled 處理、size 連動等 codified 樣式
- ❌ 不得為了「讓 Checkbox 與 Input 同高」而修改 Checkbox primitive——高度對齊由 Field control area 負責
- ❌ Horizontal 模式下不得對 FieldLabel 自訂 `padding-top`——會打破公式對齊
- ❌ 不得把 Button 或其他 action 放進 control area 作為主要 control——Field 是資料輸入容器，不是 action container
