---
pattern: app-shell
scope: web service page-level layout primitive (sidebar + header + main + aside composition)
benchmark:
  - Mantine AppShell: https://mantine.dev/core/app-shell/ — 6-slot (Header/Navbar/Aside/Footer/Main) + layout="default|alt" mode
  - Ant Design Layout: https://ant.design/components/layout — Layout/Header/Sider/Content/Footer compound API
  - Material 3 Navigation Drawer: https://m3.material.io/components/navigation-drawer/overview — standard (persistent inline) vs modal (overlay with mask)
  - Atlassian Navigation System (Beta): https://atlassian.design/components/navigation-system — TopNav + SideNav + Layout
  - Linear / Notion / Figma — primary-sidebar mode reference(local toolbar header)
  - GitHub / Slack / Gmail — primary-header mode reference(global top bar)
---

<!-- @benchmark-cited: 2026-05-19 D5 cite — all design intent claims backed by frontmatter benchmark URLs. -->

# AppShell 設計原則

## 定位

**Web service 頁面層級的 layout primitive**——組合 `Sidebar` + `ChromeHeader` + `Aside` + main content 成完整 page shell,定義跨元件 composition + responsive + a11y landmark canonical。

**實作基礎**:自建 grid/flex layout(無 Radix primitive 對應)+ 消費既有 DS canonical(`Sidebar` / `header-canonical` / `Sheet` / `layoutSpace`)。對齊 Mantine AppShell compound API + Ant Layout slot 模式。

**Layout Family**:跨 family 的**整頁框架**,不屬 4-family 任一,但**所有 family 元件可塞進 main slot**。

**SSOT 邊界**:
- AppShell own:slot composition / layout mode / Aside inline-vs-modal mode / mobile breakpoint propagate
- **不 own**:Sidebar 視覺(SSOT 在 `Sidebar.spec.md`)/ Header 視覺(SSOT 在 `header-canonical.spec.md`)/ Sheet 視覺(SSOT 在 `sheet.spec.md`)/ Main 內 layout(SSOT 在 `layoutSpace.spec.md` 6 條規則)

**不是**:`Sidebar`(本 shell consumer 之一)/ `Sheet`(臨時浮層)/ `ChromeHeader`(local header)/ `Page`(語意 wrapper,不存在於本 DS)。

---

## 何時用

- 多頁 web service 主結構(Linear / Notion / Slack / GitHub / Asana 類)
- 需要 sidebar + main 持續共存,跨頁切換時 sidebar 不重渲染
- 需要 right panel(info / inspector / detail pane)跟 main 並存

## 何時不用

| 場景 | 改用 | 原因 |
|---|---|---|
| 單頁 landing / marketing site | `<main>` 直接展開 | 沒導覽不需要 shell |
| Auth 頁(login / signup) | 自寫 centered layout | 不該被 sidebar 佔位 |
| Embedded widget / iframe | `<main>` only | 已被 host shell 包住 |
| 文件 reader(全螢幕閱讀)| `<main>` only | shell chrome 干擾閱讀 |

---

## API skeleton(對齊 Mantine compound API)

```tsx
<AppShell
  layout="primary-sidebar" | "primary-header"   // 預設 primary-sidebar
  sidebarOpen={open}    onSidebarOpenChange={setOpen}    // cmd+\ toggle
  asideOpen={open}      onAsideOpenChange={setOpen}      // cmd+. toggle
  sidebar={<Sidebar>...</Sidebar>}              // SSOT in Sidebar.spec.md
  header={<ChromeHeader>...</ChromeHeader>}     // SSOT in header-canonical.spec.md
  aside={<AppShellAside>...</AppShellAside>}    // 本 pattern own
>
  {children}    {/* <main> landmark, padding=0,內容遵循 layoutSpace 6 條規則 */}
</AppShell>
```

Sub-component:`<AppShellAside width={400}>`(width 完全 consumer 自決,DS 不發明 width token)。

---

## Layout mode(對齊 Mantine `layout` prop)

| Mode | Sidebar 位置 | Header 位置 | 適用 product 派 |
|---|---|---|---|
| **`primary-sidebar`**(預設)| 頂天立地 full-height(viewport 左側) | 在 main content area 內 full-width 橫跨 main(local toolbar,**不橫跨 sidebar**) | Linear / Notion / Figma — product-focused / single-workspace / Header scope = 當前頁 actions |
| **`primary-header`** | Header 下方 full-height(扣 header 高) | 頂部 full-width 橫跨整 viewport(global bar) | GitHub / Slack / Gmail — multi-workspace / account-heavy / Header scope = global account + workspace switcher + notifications |

**Header 永遠是 horizontal strip,不延伸 vertical**(per 2026-05-19 user clarification)。

**Sidebar toggle 按鈕位置**(消費既有 `Sidebar.spec.md:308-360` SidebarTrigger 兩 pattern,**不發明新 toggle**):

| Mode | 對應 Sidebar pattern | Toggle 位置 |
|---|---|---|
| `primary-sidebar` | `Sidebar.spec.md` Pattern A(無 global top bar) | 主內容 header 最左 |
| `primary-header` | `Sidebar.spec.md` Pattern B(有 global top bar) | global top bar 最左 |

**唯一 invariant**(`Sidebar.spec.md:310` 既有):trigger 必在 sidebar 任何 state(offcanvas / icon / expanded)下都可見 — 收合後 sidebar 不見了,toggle 不可能留在 sidebar 內(會跟著消失)。兩 mode 結論都落在 **Header 最左**,只是該 Header 是 local toolbar(Pattern A)還是 global bar(Pattern B)。Consumer 直接 `<SidebarTrigger />` 塞 Header 最左,AppShell 不 wrap / 不發明。

**層級語意差異**:`primary-sidebar` 的 Header scope = local(當前頁);`primary-header` 的 Header scope = global(整 app)。兩者是不同 product 角色,**不互通**。Consumer 選 mode = 表態 product 是哪派。

**Workspace switcher 預設位置**:
- `primary-sidebar`:sidebar 頂部(對齊 Linear / Notion / Slack)
- `primary-header`:header 左側(對齊 GitHub / Gmail)

**Breadcrumb 預設位置**:
- `primary-sidebar`:Header 內(當前頁 anchor,對齊 Linear local header)
- `primary-header`:Main 頂(對齊 GitHub `<repo>/<dir>/<file>` breadcrumb)

兩者都消費既有 `breadcrumb.spec.md` 視覺 canonical,只是 placement 不同。

---

## Aside 2-mode(對齊 Material 3 standard vs modal drawer canonical)

| Mode | Trigger | Mask 蓋背景? | Background operable? | 佔 layout 寬度? |
|---|---|---|---|---|
| **Standard inline**(對齊 Material 3 standard drawer) | viewport ≥ `--sidebar-mobile-breakpoint`(768px) | ❌ 不蓋 | ✅ 可操作 | ✅ 佔 layout |
| **Modal overlay**(對齊 Material 3 modal drawer = Sheet pattern) | viewport < breakpoint | ✅ 蓋 | ❌ 不可操作 | ❌ 不佔(蓋上去) |

**Standard inline** 行為:右側 fix 在整 window 頂天立地(同 Sidebar 但反方向);width consumer 自傳(`<AppShellAside width={400}>`,DS 不發明 width token);跟 main 共享 layout space(main width = viewport - sidebar - aside)。

**Modal overlay** 行為:消費既有 `sheet.spec.md` canonical(從右滑出 + Esc 關閉 + click-outside 關閉 + focus trap + restore focus);跟 Sidebar mobile fallback 同樣機制(同 SSOT)。

**Breakpoint**:消費既有 `--sidebar-mobile-breakpoint`(`sidebar.spec.md:594` SSOT,768px),**不發明新 breakpoint**。Sidebar + Aside 同步切 Sheet。

---

## Mobile(viewport < breakpoint)

- **Sidebar**:消費既有 `sidebar.spec.md:594` canonical(自動切 Sheet,從左滑出,寬度 `--sidebar-width-mobile`)
- **Aside**:同邏輯,切右 Sheet(複用 Sheet primitive,只方向相反)
- **Header**:始終可見(both mode);`primary-sidebar` 仍是 local toolbar / `primary-header` 仍是 global bar
- **AppShell 不重新發明 mobile**,沿用 Sidebar / Sheet 既有 canonical

---

## Main slot

**`<main>` landmark + padding=0**。AppShell.Main 是空殼 layout primitive,**不發明任何內距規則**。

Main 內塞什麼(table / field / card / page header / list)的 layout + spacing → **完全遵循 `layoutSpace.spec.md` 既有 6 條規則 + 親疏 3 級**:
- 規則 1:水平 padding(3 patterns 並存 — bounded surface 自帶 / 純 layout 父層管 / list item 自帶)
- 規則 2:頂部(Header → 第一個元素的 gap)
- 規則 3:元素間 gap(只看親疏)
- 規則 6:Chrome 表面水平 padding 統一 `loose`

**禁止**:AppShell.Main 強制 padding(會跟內部 DataTable / naked list 衝突 + 違反規則 1B「純 layout primitive 無邊界 → 父層管」)。

---

## Dialog / Sheet / Popover 互動(per user Q7 — 不是 AppShell scope)

- 所有 modal overlay(Dialog / Sheet / Popover / HoverCard)消費既有 `overlay-surface.spec.md` SSOT
- Mask 蓋整個 AppShell(包含 sidebar + header + aside + main)
- Z-index:AppShell base = 100(對齊 Mantine default);overlay 走既有 `--z-overlay` token(consumer 不可 override)
- AppShell **不** export `modalOpen` prop,overlay 自管 open / close state

---

## Keyboard shortcuts(對齊 Linear / Notion / VS Code 共識)

| Shortcut | Action | Cite |
|---|---|---|
| `cmd+\`(macOS)/ `ctrl+\`(Windows) | Toggle sidebar | Linear / Notion / VS Code 共識(`Sidebar.spec.md` 既有 keyboard 段已 codify)|
| `cmd+.`(macOS)/ `ctrl+.`(Windows) | Toggle aside | Linear convention |

兩者消費既有 `Sidebar.spec.md` keyboard shortcut 機制(`useEffect` + `document.addEventListener('keydown')`),AppShell 不發明新機制。

---

## A11y landmark(對齊 Mantine ARIA)

| Slot | HTML landmark | Auto ARIA |
|---|---|---|
| `header` | `<header>` | `role="banner"`(implicit)|
| `sidebar` | `<nav aria-label="Primary navigation">` | Sidebar own |
| `aside` | `<aside aria-label="Detail panel">` | AppShell own |
| `children`(main) | `<main>` | `role="main"`(implicit)|

不發明新 ARIA,消費 HTML5 semantic + WAI-ARIA Landmark 標準。

---

## Future extension(目前不定義)

**Multi-sidebar**(Notion / Linear 雙側欄派):API 接 `sidebar?: ReactNode | ReactNode[]` 預留 array signature,**目前 strict 取首位**,違反 dev warning。未來擴充 SSOT 在 `Sidebar.spec.md`,不在本 pattern(per user 2026-05-19「AppShell 不該 customize Sidebar」)。

**Footer**:不 expose slot(per user 2026-05-19「不用 footer」)。Web service 通常不用 footer,consumer 若需要自貼 Main 底。

**Banner / announcement bar**:不 expose slot,consumer 自貼 Main 頂(對齊 Notion / Linear banner consumer-managed convention)。

**Multi-tab / split view**:不 codify(per user 2026-05-19「不用」)。

**Print mode**:`@media print` 隱 sidebar + aside,只露 main(future)。

---

## Token consumption(0 新發明,全消費既有 SSOT)

| 用途 | Consume token / SSOT |
|---|---|
| Mobile breakpoint | `--sidebar-mobile-breakpoint`(`sidebar.spec.md:594`)|
| Sidebar width | `--sidebar-width`(`sidebar.spec.md`)|
| Header height | `--chrome-header-height`(`tokens/uiSize/uiSize.spec.md`)|
| Aside width | consumer 自傳 prop(無 token)|
| Layout spacing | `layoutSpace` 全 family(`--layout-space-{tight,loose,bottom}`)|
| Z-index | `--z-overlay`(既有)/ AppShell base z=100 |
| Sheet fallback | `sheet.spec.md` SSOT |
| Overlay | `overlay-surface.spec.md` SSOT |

**0 新 CSS variable**,per CLAUDE.md token 4 條硬規則(不孤立發明)。

---

## Consumer 紀律

- ❌ 禁:`<AppShell>` 內 wrap 第二個 `<AppShell>`(nested shell 違反「整頁框架」單例性)
- ❌ 禁:`sidebar={<div>...</div>}`(必傳 `<Sidebar>` primitive,確保視覺 SSOT)
- ❌ 禁:`header={<header>...</header>}`(必傳 `<ChromeHeader>` 或消費 `header-canonical` 派生 header)
- ❌ 禁:AppShell.Main 自加 padding(違反 layoutSpace 規則 1B)
- ✅ 必:`layout` mode 在 product 啟動時固定,**不在 runtime 切換**(切換 = product 角色變動 = 應該重 mount app)

---

## 世界級對照

| DS | Slot 結構 | Layout mode | Aside 派 | Mobile |
|---|---|---|---|---|
| **Mantine AppShell** | Header / Navbar / Aside / Footer / Main | `default`(header 頂)/ `alt`(navbar 頂)| collapsable | breakpoint per slot |
| **Ant Layout** | Header / Sider / Content / Footer | 拼 building blocks 兩派並存 | 無 explicit Aside slot | Sider breakpoint |
| **Material 3** | (無 AppShell primitive)| — | Standard inline / Modal overlay drawer | Standard → desktop / Modal → mobile |
| **Atlassian Navigation System** | TopNav + SideNav + Layout(Beta) | TopNav-above-SideNav | — | — |
| **本 DS AppShell** | sidebar + header + aside + main(無 footer 預設)| `primary-sidebar` / `primary-header` 對齊 Mantine 2 mode | Standard inline + Modal overlay 對齊 Material 3 | 消費既有 Sidebar / Sheet SSOT |

---

## 相關 spec

- `Sidebar.spec.md` — sidebar 視覺 + 鍵盤 + mobile SSOT(本 pattern 必消費)
- `patterns/header-canonical/header-canonical.spec.md` — header 視覺契約 SSOT(本 pattern 必消費)
- `patterns/overlay-surface/overlay-surface.spec.md` — Aside modal mode + Sheet fallback SSOT
- `Sheet.spec.md` — mobile breakpoint fallback SSOT
- `tokens/layoutSpace/layoutSpace.spec.md` — Main 內 layout 6 條規則 SSOT
- `tokens/uiSize/uiSize.spec.md` — `--chrome-header-height` 等 size token

