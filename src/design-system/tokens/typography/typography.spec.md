# Typography 設計原則

Typography 定義字體尺寸與行高的 token 系統，確保全系統文字層級一致。

## 設計原則

Typography 由三個獨立維度組成，分開疊加：

| 維度 | 控制方式 | 說明 |
|------|---------|------|
| font-size | `text-{role}` utility | token 決定，不可繞過 |
| line-height | 烤進 token，需要時覆蓋 | heading / supplementary → 1.3；body → 1.5 |
| font-weight | `font-normal` / `font-medium` / `font-bold` | 使用端疊加，不寫死在 token |

**line-height 的選擇基於「是否適合多行閱讀」：**
- `1.5`：適合連續閱讀的段落（14px / 16px）
- `1.3`：標題、短文字、截斷場景、不需要閱讀行距
- 12px 以下不適合作為連續閱讀內文，一律 1.3

**font-weight 等同 `<strong>` 的疊加邏輯：**
- 不加 = 400，一般文字
- `font-medium` = 500，行內中等強調
- `font-bold` = 700，強調（等同 `<strong>`）


## Token 表

| Utility        | font-size | line-height | 用途 |
|----------------|-----------|-------------|------|
| `text-h1`      | 48px      | 1.3         | 頁面主標題 |
| `text-h2`      | 32px      | 1.3         | 區塊標題 |
| `text-h3`      | 24px      | 1.3         | 子區塊標題 |
| `text-h4`      | 20px      | 1.3         | 小節標題 |
| `text-h5`      | 16px      | 1.3         | 元件層級標題 |
| `text-h6`      | 14px      | 1.3         | 最小層級標題 |
| `text-body-lg` | 16px      | 1.5         | 16px 為主版面的段落內文 |
| `text-body`    | 14px      | 1.5         | ★ 主要內文基準 |
| `text-caption` | 12px      | 1.3         | 圖表附註、標籤文字、元件內次要說明 |
| `text-footnote`| 10px      | 1.3         | 法律文字、來源標注（極少用）|

**h5（16px）vs body-lg（16px）**：同尺寸，line-height 不同，靠這個區分標題與段落角色。
**h6（14px）vs body（14px）**：同尺寸，靠 font-weight 和 color 區分，使用端需有意識地處理。


## line-height 覆蓋

大多數情況不需要覆蓋。以下場景例外：

```tsx
{/* body 文字用於截斷 → 覆蓋為 1.3 */}
<p className="text-body leading-compact line-clamp-2">副標說明</p>

{/* h5/h6 用於段落說明而非標題 → 覆蓋為 1.5 */}
<p className="text-h5 leading-normal">較小的說明段落</p>
```

可用的 override utilities：
- `leading-compact`：1.3（自訂）
- `leading-normal`：1.5（Tailwind 內建）


## 組合範例

```tsx
{/* 頁面標題 */}
<h1 className="text-h1">專案總覽</h1>

{/* 區塊標題加重 */}
<h2 className="text-h2 font-medium">執行進度</h2>

{/* 主要內文 */}
<p className="text-body">一般說明段落，預設 400 weight。</p>

{/* 行內強調 */}
<p className="text-body">
  此操作將<span className="font-medium">永久刪除</span>該筆資料。
</p>

{/* 截斷副標 */}
<p className="text-body leading-compact line-clamp-2 text-fg-secondary">
  這是一段較長的副標說明，超過兩行會被截斷顯示。
</p>

{/* 欄位附屬說明 */}
<span className="text-caption text-fg-muted">最多 200 字元</span>
```


## 禁止事項

```tsx
// ❌ 不要用 Tailwind 原始 text-sm / text-lg / text-base
<p className="text-sm">內文</p>

// ❌ 不要硬寫 font-size 或 line-height
<p style={{ fontSize: '14px' }}>內文</p>

// ❌ 不要用 12px 做連續閱讀段落
<p className="text-caption">這是一整段很長的說明文字...</p>

// ❌ 不要把 font-weight 寫死在外層容器（應在需要的元素上疊加）
<section className="text-body font-medium">...</section>
```


## 跨元件參考

行高在 row 類元件中的應用（scanning vs reading 模式）詳見 `patterns/element-anatomy/item-anatomy.spec.md`「兩種閱讀模式」節。

---

## Inline icon + text 對齊 canonical(2026-04-22)

**規則**:inline 排列的 icon + text 用 **flex `items-center` 對齊**,icon **尺寸略大於 cap-height**(約 `x-height × 1.5` 或 `cap-height × 1.2`),視覺效果 = icon 中心對齊 text x-height 中線。**不用 baseline-align**(會讓 icon 下陷)。

**本 DS 實作**:
- Row 內 inline icon:`ICON_SIZE` table(sm/md = 16, lg = 20)for `text-body`(14px);大致 = cap-height(~10px) × 1.6
- Button inline icon:固定 16(xs/sm/md) / 20(lg),對齊 button text
- 單行 inline 用 `h-[1lh]` 確保 icon 不被文字 descender / line-box 下移

**世界級 benchmark**:

| DS | 對齊方式 | Optical adjust |
|----|---------|---------------|
| Material 3 | Icon center ↔ text line-height mid | icon 略大於 cap-height(MD3 icon 20 for body 14) |
| Apple HIG / SF Symbols | baseline-aware(`baseline` / `firstBaseline` / `center`)| SF Symbol 內建 cap-height metadata |
| Figma DS | `align-items: center` + icon 對齊 x-height baseline grid | icon 高 ≈ cap-height + 2px |
| Polaris | `<InlineStack blockAlign="center">`;icon fixed 16 for body 14 | 無 documented optical rule |
| Atlassian | flex center;icon 16 for body 14 | 無 explicit rule |
| Carbon | `align-items: center`;icon 16 for body 14 | 無 optical rule |

**共識**:**flex center + icon 略大於 cap-height(≈ 1.2-1.5 倍)是全業界 de-facto**。只有 Apple SF Symbols 有正式 baseline-aware 系統;其他家純 flex center。

**本 DS 選擇**:flex center + `ICON_SIZE` mapping(對齊 Material / Polaris / Atlassian / Carbon idiom)。不使用 baseline-aware(過度工程,且我們 icon 非 SF Symbol font)。

**使用**:

```tsx
// ✅ Inline icon + text(Button / Tag / InlineStack)
<div className="flex items-center gap-2">
  <Icon size={16} className="shrink-0" />
  <span className="text-body">Label</span>
</div>

// ✅ Row 內 inline icon(走 ICON_SIZE table)
<MenuItem icon={User}>Profile</MenuItem>  // 自動 ICON_SIZE[md] = 16

// ❌ icon size ≠ cap-height range
<div className="flex items-center gap-2">
  <Icon size={24} />  {/* 對 text-body 14 過大,視覺 unbalanced */}
  <span className="text-body">Label</span>
</div>

// ❌ baseline align 讓 icon 下陷
<div className="flex items-baseline gap-2">
  <Icon size={16} />  {/* icon 底邊貼 text baseline,視覺下陷 */}
  <span className="text-body">Label</span>
</div>
```

**meta pattern**:**視覺層 vs 幾何層分離** — icon glyph box(16×16)與 optical center(cap-height mid)分離,icon 尺寸基於 cap-height 而非 font-size。
