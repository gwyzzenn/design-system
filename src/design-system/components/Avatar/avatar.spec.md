# Avatar 設計原則

## 定位

Avatar 是視覺身份標識——代表一個人、一個實體（專案、組織、App）。不是裝飾。

---

## 三種內容模式

按優先順序：

| 模式 | 觸發條件 | 內容 | 用途 |
|---|---|---|---|
| **Image** | 有 `src` | 圖片填滿 | 照片、上傳頭像 |
| **Icon** | 有 `icon` 或 src 載入失敗且無 alt | LucideIcon 在底色背景 | 類別標識、預設頭像 |
| **Text** | 有 `alt` 且無 src/icon | 首字大寫 | 無照片時的 fallback |

圖片載入失敗自動降級為 Icon 或 Text fallback。

---

## 尺寸

`size` 接受任意 px 值。**不提供預設尺寸名稱**——尺寸由消費元件（item-layout 系統）決定。

內部元素自動按比例計算：

| 元素 | 公式 | 範例（size=32） |
|---|---|---|
| Icon | `round_even(size × 0.6)` | 20px |
| Text fallback 字體 | `round(size × 0.5)` | 16px |

- Icon 60%：業界標準（Material Design、Apple HIG）
- Text 50%：業界標準（Material Design、GitHub），且自動對齊我們的字體 scale（10→12→16→20px）

### 常用尺寸參考

由 item-layout 消費元件決定：

| 場景 | Avatar size | Icon size | 來源 |
|---|---|---|---|
| Menu item inline（無 desc） | 20-24px | 12-16px | Tag 高度 |
| Menu item block（有 desc） | 32-40px | 20-24px | floor₈(text block) |

---

## 形狀

| Shape | 圓角 | 用途 |
|---|---|---|
| `circle`（預設） | `rounded-full` | 人物（照片、姓名） |
| `square` | `rounded-md` (4px) | 實體（專案、組織、App、品牌） |

**判斷標準：「這個 avatar 代表一個人，還是一個東西？」**

---

## 背景色

Icon 和 Text 模式使用 categorical 色的 subtle 背景 + 對應前景色。`solid` boolean prop 可切換為 step-6 全色背景 + 白色前景。

與 Tag 元件完全對齊——所有有色 variant 使用 categorical token（`--blue`、`--red` 等），不使用 semantic token（`--primary`、`--error`）。Avatar 的「blue」代表藍色本身，不代表「主要操作」語義。neutral 用 `foreground`，有色用 **step-7**（非 step-6）優先辨識度：

### Subtle（預設，`solid=false`）

| Color | 背景 | 前景 |
|---|---|---|
| neutral（預設） | `--muted` | **`--foreground`** |
| blue | `--blue-subtle` | `--color-blue-7` |
| red | `--red-subtle` | `--color-deep-orange-7` |
| green | `--green-subtle` | `--color-green-7` |
| yellow | `--yellow-subtle` | `--color-yellow-7` |
| turquoise | `--turquoise-subtle` | `--color-turquoise-7` |
| purple | `--purple-subtle` | `--color-purple-7` |
| magenta | `--magenta-subtle` | `--color-magenta-7` |
| indigo | `--indigo-subtle` | `--color-indigo-7` |

### Solid（`solid=true`）

step-6 全色背景 + 白色前景，適合需要更強視覺權重的場景。

| Color | 背景 | 前景 |
|---|---|---|
| neutral | `--fg-secondary` | white |
| blue | `--blue` | white |
| red | `--red` | white |
| green | `--green` | white |
| yellow | `--yellow` | **`--warning-foreground`** |
| turquoise | `--turquoise` | white |
| purple | `--purple` | white |
| magenta | `--magenta` | white |
| indigo | `--indigo` | white |

**yellow 例外**：yellow solid 背景亮度高，白字對比不足，改用 `--warning-foreground`（深色文字）。

Image 模式不顯示背景色（圖片填滿），`solid` prop 無效果。

---

## Disabled

Avatar 在 disabled 元件內使用 `opacity-disabled`（由宿主元件控制，非 Avatar 自身 prop）。詳見 `color.spec.md` 的 Disabled 狀態。

---

## 禁止事項

- ❌ 不要用 Avatar 當裝飾——每個 Avatar 必須代表一個明確的身份
- ❌ 不要手動指定 icon 尺寸——60% 自動計算
- ❌ 不要用 square 給人物——人用 circle，東西用 square
- ❌ 不要省略 `alt`——即使有 `src`，`alt` 是圖片失敗時的 fallback 來源
