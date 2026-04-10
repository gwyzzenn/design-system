# Item Layout 設計原則

## 定位

Item Layout 定義**結構和對齊系統**，不定義具體間距值。每個消費元件根據自身場景設定間距，但遵循相同的結構和對齊規則。

**這不是一個元件，是一套佈局原則。**

---

## 結構:四個獨立 slot

所有 item layout 元件共用一個 4-slot 結構,**每個 slot 各自獨立決定對齊**:

```
[control?] [prefix?] [content] [suffix?]
    ↑          ↑          ↑          ↑
  always    follows    flex-1    follows
  inline    24px       min-w-0   24px
            rule                  rule
```

| Slot | 用途 | 出現條件 | 對齊規則 |
|---|---|---|---|
| **control** | Selection 機制(Checkbox / RadioGroupItem) | 只有 SelectionItem 有 | **永遠 inline**(`h-[1lh]`) |
| **prefix** | 視覺輔助(icon / avatar / thumbnail) | 可選,在所有 item 元件 | 24px 閾值規則 |
| **content** | label + 可選 description | 永遠存在 | 佔滿剩餘空間,`flex-1 min-w-0` |
| **suffix** | label 的 metadata(tag、chevron、time、count) | 可選,在所有 item 元件 | **24px 閾值規則(跟 prefix 同公式但獨立)** |

**外層**:`flex items-start`——多行時 control / prefix / suffix 的 Y 不隨文字下移。

### Control 跟 prefix 是兩個不同的 slot

`control` 跟 `prefix` 不是同一件事,**可以同時存在**:

```
[checkbox] [avatar] [name + email]              ← Notion sharing modal
[checkbox] [icon]   [permission name]           ← Permission picker
[checkbox] [channel icon] [channel name]        ← Slack channel picker
```

`control` 是「selection 的機制」(必有,且永遠 inline,因為它是點擊靶子);`prefix` 是「視覺輔助」(可選,跟 label 內容相關)。兩者各自獨立對齊,不互相同步。

---

## 24px 閾值對齊規則(Prefix 與 Suffix 共用同一條公式)

**核心原則**:每個 slot 的對齊容器高度由**自己內容物的大小**決定。Prefix 和 suffix 用的是**完全一樣**的公式,只是各自獨立判斷,不互相同步。

### 公式

| 內容物高度 | 對齊容器 | 對齊目標 |
|---|---|---|
| ≤ 24px | `h-[1lh]` | 第一行 label 的垂直中心 |
| > 24px(+ 有 description) | `h-[calc(1lh + 2px + desc_1lh)]` | label + gap + description 文字塊的垂直中心 |
| > 24px(無 description) | `h-[1lh]` | 強制 inline(沒有文字塊可對齊) |

### 為什麼 prefix 和 suffix 各自獨立(不互相同步)

之前的版本說「suffix 永遠跟 prefix 使用相同的對齊容器高度」是錯的。Prefix 和 suffix **各自反映自己內容物的視覺重量**,不應該被綁在一起。

**1. Slot 內容物的本質不同**

- **Prefix** 是「item 的視覺主體」(avatar = 這個人是誰、icon = 這個東西是什麼)。當 prefix 是大 avatar 時,它的視覺重量平衡整個文字塊,所以對齊文字塊中心。
- **Suffix** 是「label 的 metadata」(Tag = 屬於哪一類、Chevron = 可展開、Time = 何時)。它修飾的對象是 label 第一行,所以對齊第一行。

兩個 slot 的視覺角色不同,被強迫同步反而違反它們各自的對齊邏輯。

**2. 業界 convention 全部如此**

Apple Mail / Gmail / iOS Settings / Material 3 / Atlassian DSP / Polaris ResourceItem——**全部**是「prefix 跟 suffix 各自獨立對齊」。沒有任何一個把小 suffix 強迫對齊到大 avatar 中心。

| 系統 | Prefix(大 avatar) | Suffix(小元素) |
|---|---|---|
| Apple Mail | Avatar 40px → 文字塊中心 | Date → Subject 第一行 |
| Gmail | Star icon → 第一行 | Time → Subject 第一行 |
| iOS Settings | Icon ≤24px → 第一行 | Chevron → Label 第一行 |
| Material 3 List | Leading icon → 第一行 | Trailing icon → top-aligned |

**3. 視覺重量平衡**

把小 suffix 強迫對齊大 avatar 中心,小 suffix 會「下沉」到 description 行,**視覺上跟 label 失聯**。對齊 label 第一行則讓 suffix 跟它修飾的對象在同一條基準線上,視覺重量自然分配。

### 大塊 suffix 的對待方式(symmetric 規則)

`suffix > 24px` 的場景雖然罕見,但**完全套用同一條公式**——當 suffix 是 thumbnail、stacked badge 等大塊內容時,自己的對齊容器走 block calc,對齊文字塊中心。

| 場景 | Prefix | Suffix | 結果 |
|---|---|---|---|
| 標準選單(SelectMenuItem 大宗) | icon 16px / avatar 24px | Tag / Chevron(≤24px) | 兩邊都 inline |
| 用戶選單(avatar + name + role) | avatar 32px(block) | Chevron(≤24px) | Prefix block,suffix inline ← **各自獨立** |
| 帶縮圖列表(thumbnail + title + 縮圖) | icon 16px(inline) | thumbnail 40px(block) | Prefix inline,suffix block ← **各自獨立** |
| 雙視覺重的卡片 | avatar 40px(block) | thumbnail 40px(block) | 兩邊都 block |

**沒有「prefix 跟 suffix 必須同步」的情況。** 每個 slot 反映自己內容物的視覺重量,各自走公式。

### Avatar 尺寸選擇(用於 prefix slot)

Avatar 在 item 中的尺寸由 description 決定:
- 無 description → inline 模式(20/24/24px @ sm/md/lg)
- 有 description → block 模式(32/32/40px @ sm/md/lg)

Avatar 元件自身的規格(icon 模式、fallback、內部 icon 尺寸)見 `Avatar/avatar.spec.md`。

---

## SelectionItem:Control 跟 Prefix 同高度(不歪斜)

`SelectionItem` 永遠有 **control** slot(checkbox / radio)。當 prefix(icon / avatar)也存在時,**兩者必須在同一條 baseline**——否則視覺歪斜。

### 規則:control 跟著 prefix 的對齊走

| prefix 模式 | Control 對齊 | Prefix 對齊 | 結果 |
|---|---|---|---|
| **inline**(icon / 小 avatar,≤24px) | `h-[1lh]` | `h-[1lh]` | 兩者都在 label 第一行 |
| **block**(大 avatar >24px + 有 desc) | **`h-[block calc]`** | `h-[block calc]` | 兩者都在 text block center |

```
Inline 模式:

[✓][avatar 24] Alice Chen
               Design lead

Block 模式:

         ┌──────┐
  [✓]    │  A   │  Alice Chen
         │ 32px │  Design lead
         └──────┘
```

Block 模式時 checkbox 不在 label 第一行——它跟 avatar 在同一高度(text block center)。這沒問題,因為 form picker 整列可點擊,checkbox 的位置不影響操作;checkbox 跟 avatar 構成「selection + identity」的視覺單元,應該同高。

### 為什麼不是「checkbox 固定在 label 第一行、avatar 自由 block」?

那樣會歪斜:

```
❌ 歪斜:checkbox 跟 avatar 在不同高度

[✓] ──── label 第一行
              ┌──────┐
              │avatar│  Alice Chen
              │  32  │  Design lead
              └──────┘
```

業界零個成功案例。只要左側有兩個元素(control + prefix),它們必須在同一條 baseline 上。

### 業界 form picker 對照

| 系統 | Avatar | 對齊 | 備註 |
|---|---|---|---|
| **GitHub** | 20px | inline | 小 avatar,不需要 block |
| **Linear** | 20px | inline | 同上 |
| **Microsoft Teams** | 24-28px | inline | 簡單列表 |
| **Notion sharing** | 28px | block(avatar center) | 無左 checkbox(click row 選取) |
| **Slack invite** | 36px | block(avatar center) | checkbox 在右側 suffix |

有 left checkbox 的(GitHub/Linear/Teams)都用 inline。想 block 的(Notion/Slack)則不用 left checkbox——要嘛 click row 選取,要嘛 checkbox 在右。

**我們的 SelectionItem 兩個都支援**:左 checkbox + block 時,checkbox 跟 avatar 同步下移到 text block center,不歪斜。

---

## 兩種閱讀模式

| | 掃描模式 | 閱讀模式 |
|---|---|---|
| **場景** | 浮層 / overlay（一掃而過） | 頁面 / 表單（仔細閱讀） |
| **Label 行高** | `leading-compact` (1.3) | 預設 (1.5) |
| **Description 字體** | 降一級（14→12px, 16→14px） | 最小 14px（14→14px, 16→14px） |
| **Description 顏色** | `fg-secondary` | `fg-secondary` |
| **Label ↔ Desc 間距** | 2px (`mt-0.5`) | 2px (`mt-0.5`) |
| **判斷標準** | 使用者快速掃描選擇 | 使用者停留閱讀 |

**兩種模式的唯一差異是行高。** Description 在所有模式都降一級字體——label 是要辨識的目標，description 是補充，尺寸差有助快速區分。

---

## Icon 色彩原則

一條統一規則，跨所有元件（詳見 `color.spec.md`）：

| 判斷 | 顏色 | 範例 |
|---|---|---|
| icon 代表內容或類別 | **與 label 同色** | Mail「電子郵件」、Settings「設定」 |
| icon 代表危險操作 | **與 label 同色**（text-error） | Trash2「刪除」 |
| icon 純指示方向/展開 | `fg-muted`（neutral-7） | ChevronRight、ChevronDown、ExternalLink |
| suffix value 文字 | `fg-muted`，**字體大小與 label 相同** | "深色"、"已啟用" |
| disabled 時 | `fg-disabled` | 全部統一 |

---

## 消費元件預設

每個消費元件根據場景自訂間距，但結構和對齊規則不變：

### SelectMenuItem / DropdownMenuItem（浮層選單）

| 屬性 | 值 | 原因 |
|---|---|---|
| padding-y | `calc((field-height - 1lh) / 2)` | 單行高度 = field-height，對齊 Button / Input |
| padding-x | 12px (`px-3`) | 選單項目的標準水平間距 |
| prefix ↔ content gap | 8px (`gap-2`) | 緊湊但可辨識 |
| suffix 獨立後綴 gap | 8px (`gap-2`) | tag / badge / endIcon 間距 |
| suffix 子選單指示 gap | 4px (`gap-1`) | value / badge / ChevronRight 更緊湊 |
| 閱讀模式 | 掃描模式 | 浮層內一掃而過 |

### SelectionItem（表單 Checkbox / Radio）

| 屬性 | 值 | 原因 |
|---|---|---|
| padding-y | `calc((field-height - 1lh) / 2)` | 單行高度 = field-height，對齊同 size 的 Input |
| padding-x | 無（由外層容器決定） | 表單佈局各異 |
| prefix ↔ content gap | 8px (`gap-2`) | 控件與 label 的標準間距 |
| 閱讀模式 | 閱讀模式 | 表單內仔細閱讀 |

### ListItem（頁面列表，未來元件）

| 屬性 | 值 | 原因 |
|---|---|---|
| padding-y | 12px (`py-3`) | 舒適的列表行高，觸控友好 |
| padding-x | 16px (`px-4`) | 頁面內容的標準水平間距 |
| prefix ↔ content gap | 12px (`gap-3`) | 較寬鬆，適合較大的 avatar / thumbnail |
| 閱讀模式 | 閱讀模式 | 頁面內停留閱讀 |

---

## 新元件 checklist

建立新的「prefix + content + suffix」元件時：

1. ✅ 確定閱讀模式（掃描 or 閱讀）→ 決定 typography 策略
2. ✅ 確定 padding-y（field-height 公式 or 固定值）
3. ✅ 確定 padding-x 和 gap
4. ✅ prefix / suffix 對齊容器遵循 24px 閾值
5. ✅ suffix 跟 prefix 共用同一個容器高度
6. ✅ 外層 `flex items-start`（多行釘住 prefix/suffix）
7. ✅ icon 色彩遵循「代表內容 = label 同色，指示方向 = fg-muted」
8. ✅ description 字體遵循閱讀模式規則
