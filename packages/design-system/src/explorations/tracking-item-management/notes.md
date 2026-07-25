# 建廠物料追蹤 FCMT — Prototype Notes

來源:`建廠計劃與物料追蹤管理系統 PRD v0.1`(2026-07-25 draft)。本輪 prototype 依 user 拍板範圍聚焦 **MVP 核心 3 頁**:App Shell 導覽 + 追蹤單清單(B 型)+ 追蹤單詳情(A 型),走 `/prototype` 完整 6-phase 流程。

## Phase 0 — 範圍

- 聚焦:App Shell 導覽、追蹤單清單(B 型總覽表格頁)、追蹤單詳情(A 型 Master-Detail)。
- 不含本輪:Excel 匯入精靈(C 型)、報表 R1-R7、甘特/矩陣頁(D/F 型)、主檔管理 CRUD——皆為 Phase 2/3 PRD 範圍或獨立 prototype 課題。

## Phase 1 — Benchmark(9 家;完整掃描表 + A/B/C 評估 → 同層 `benchmark-and-candidates.md`)

Linear / Jira / Monday.com / Procore / Autodesk Construction Cloud / Smartsheet / Salesforce / SAP Ariba / Oracle Fusion Procurement。核心收斂:
- 狀態與進度%是兩個獨立衍生軸(全 9 家一致)
- 狀態轉移由「事件」觸發(填 PO 號/出貨日等),非自由下拉切換(SAP Ariba / Oracle Fusion)
- Baseline / Actual / Variance 三態不可編輯衍生欄位(Smartsheet)
- 狀態旁必顯示「現在卡在誰手上」(Procore Ball-in-court → 本頁「負責人」欄)
- 稽核歷程應拆「稽核用表格」+「工作用時間軸」雙形態(Salesforce Approval History)

## Phase 2 — Checkpoint 2 決議

3 候選(Peek Panel / Master-Detail 全頁 / Inline-Expand)評分後,**user 拍板:B(全頁 Master-Detail)為主,A(Peek rightSider)作為輔助混搭**——不是分開的比稿版本,是同一設計內的互補 interaction:
- 清單頁點列 kebab 眼睛 icon → Sheet 快速看(不離開清單,不用於維護單筆完整脈絡)
- 清單頁點 row `Eye` action 之外,完整維護走 `TrackingItemDetail` 全頁(PRD 9.1 已定選型,非比稿對象)

## Phase 3.0 — Object Map(ORCA)

見對話記錄;Object 定義:`Program → WorkPackage → TrackingItem → SubItem/Milestone`,`ChangeRecord`,`Zone/Material/Supplier` 主檔。UI Shape 映射:
- 清單列 → DataTable + Tag + ProgressBar
- Peek → Sheet(320/360px)
- 全頁詳情 → TreeView(左)+ Tabs 現況/進行中/歷史(右)
- 歷程雙形態 → DataTable(歷史 tab)+ 手刻 timeline(rightSider Sheet)

## 產出檔案

```
tracking-item-management/
├── notes.md                          本檔
├── benchmark-and-candidates.md       Phase 1 九家 benchmark 掃描 + Phase 2 A/B/C 評估與決議
├── tracking-item-data.ts             型別 + mock 資料(13 筆追蹤單,涵蓋全部 13 狀態)+ 狀態機 meta
├── fcmt-shell.tsx                    共用 AppShell 殼(兩頁共用,對齊 apps/template/src/App.tsx archetype)
├── TrackingItemList.stories.tsx      B 型清單 + Peek rightSider(2 stories)
└── TrackingItemDetail.stories.tsx    A 型 Master-Detail 全頁(3 stories)
```

## SSOT 消費清單(對照 CLAUDE.md「SSOT 消費 canonical」)

| 決策 | 消費的 SSOT | 備註 |
|---|---|---|
| 狀態語意色彩 | Tag(`categorical-color.ts`)+ Product Master Design Standards P20 | **產品層決策,非 DS 層**:tag.spec.md 明文色相為「categorical 裝飾,非語意狀態」;FCMT 產品把特定 hue 固定指派給特定生命週期/流程狀態(purple=Draft / turquoise=Submitted / green=Approved+Closed / blue=進行中族 / deep-orange=Rejected+OnHold / neutral=Cancelled),這是**消費既有 categorical 色板做產品層固定映射**,不是改 Tag 元件本身語意——對齊 Ant Design Tag preset colors 同款用法(業界慣例:categorical 色板 + 產品層固定指派) |
| 進度條 | ProgressBar(`status` prop 對映 inProgress/success/error) | |
| 清單頁 | DataTable(`data-table.stories.tsx#RowActions` baseline) | |
| 快速檢視 | Sheet(`sheet.stories.tsx#EditUserRight` baseline) | |
| 全頁殼 | AppShell + Sidebar(`apps/template/src/App.stories.tsx#Default` baseline) | |
| 左樹 | TreeView + `indicator` slot(狀態圓點,對齊元件文件「stepper status dot」用法) | |
| 編輯入口 | Dialog `maxWidth={698}`(Product Master G1)+ Field/Input/Textarea/DatePicker(`dialog.stories.tsx#WithForm` baseline) | 唯讀灰底 = `disabled` prop(不新造灰底 pattern) |
| 歷程雙形態 | DataTable(歷史 tab)+ 手刻 timeline(rightSider) | **新 pattern,未升級為 primitive**——見下方「未來評估」 |

## Phase 3.5 — 自我稽核(6 維度,stakeholder-gate 強制)

| 維度 | 結果 |
|---|---|
| D1 設計語言 | 全消費既有 DS 元件(DataTable/Tag/ProgressBar/Sheet/Dialog/TreeView/Tabs/Breadcrumb/DescriptionList/Field/Avatar/Button/ChipGroup),無新元件,無 hardcode 色值/間距(全走 semantic utility + `--layout-space-*` token) |
| D2 程式語言 | `npx tsc -b packages/design-system` **PASS**(0 error);`npm run build:lib` **PASS**;`npx storybook build` **PASS**(2 story 檔正確編譯進 bundle) |
| D3 元件效能 | DataTable 資料量小(13 筆 / 4 筆),未啟用 virtualization 也無感;無多餘 re-render 疑慮(狀態集中在 page-level useState) |
| D4 UX 行為 | 走查 7 題:狀態轉移依 PRD 6.1 事件觸發(填 PO/送審/核准等按鈕,非裸狀態下拉)✓;暫停/取消/退回強制原因 ✓;未生效態三件套(待審 story:可見紫/turquoise 標記 + 歷程 tab 可回溯 + 舊值新值前後對照)✓;鍵盤可達(TreeView/Tabs/Dialog 皆走既有元件內建 a11y)✓ |
| D5 視覺品質 | Playwright 截圖驗證 8 個狀態組合(清單總覽 / Peek 開啟 / 生產中+延遲 / 待審 / 暫停+原因 / 樹展開選中態 / 進行中 tab / 歷史 tab / 時間軸 sheet / 編輯 modal / 原因 modal)——**發現並修正 1 處視覺 bug**:左樹初版把 Tag 塞進 280px 窄列導致文字截斷(「生...」「結...」),改用 TreeItem `indicator` slot 純色圓點 + 完整編號 label,問題排除 |
| D6 原則自檢 | Mindset #4 真實業務場景:全 13 筆追蹤單皆用 PRD 自身建立的 F22 Phase 1 / CL-3F / AHU-03 等命名延伸,無 Option A/B/C 或佔位符;Mindset #2 優先消費既有:每個 UI 決策皆列 SSOT 對照表(見上);M23(d):3 個 story-baseline 引用皆已 Read 全文才動筆 |

**P0 待辦**:無(0 個 blocker)。

## Phase 4 — 候選定位與 Storybook 路徑

| Story | Positioning | 適合場景 | 不適合場景 |
|---|---|---|---|
| `TrackingItemList` 清單總覽 | PM/主管快速掃視全局,狀態+進度雙編碼一眼看出卡點 | 日常巡檢、找逾期項 | 深度編輯單筆(仍需進全頁) |
| `TrackingItemList` Peek 開啟 | 採購/工程師想「順手看一眼」不失去清單上下文 | 批次瀏覽多筆時快速核對 | 需要看子項/歷程等完整脈絡 |
| `TrackingItemDetail` × 3 states | 區塊工程師/採購維護單筆全生命週期(狀態機/子項/歷程三合一) | 建立-送審-核准-下單-驗收全流程操作 | 批次操作多筆(PRD M3-4 批次操作留待 B 型清單擴充,本輪未做) |

**推薦**:兩頁一起採用(互補而非互斥)——清單頁滿足「掃視」,詳情頁滿足「維護」,Peek 是兩者間的低成本橋接。但**最終定案由 stakeholder 決定**。

## Refinement pass(2026-07-25,第二輪重審)

同日對初版做一輪批判性重審,修 5 處:
1. 詳情頁兩處空狀態手刻 div → 改消費 `<Empty>`(ui-development「icon+text 垂直 → `<Empty>`」自我檢查)
2. 清單頁 DataTable 補 `emptyState`(篩選可能 0 筆)
3. Peek / 時間軸兩個 Sheet 從 DS 預設 448px 收斂為 **360px**(Product Master G3 rightSider 320/360 規格;Playwright 實測兩者皆 360.0px)
4. fcmt-shell 移除 `SidebarMenuButton` 冗餘 `data-active`(provider 由 `id` 自動計算 active)+ 清 `FcmtSidebar` 死參數
5. 清 `getActions(...).map(no-op)` 死碼;空狀態文案移除 PRD 內部代號「(M3-2)」(story-rules 禁 spec 內部代號入 user-facing 文案)

驗證:tsc PASS / storybook build PASS / Playwright 重截 4 畫面(Peek 360 / 已延遲篩選 / 子項空狀態 / 時間軸 360)。

## 未來評估(若定案採用)

1. **變更歷程時間軸**目前是本 exploration 手刻(無 DS Timeline primitive)。若定案採用,建議評估是否升級為 DS `patterns/` 或 `components/` 正式 primitive(Rule-of-3:目前僅 1 處消費,未達門檻,先留在 exploration)。
2. **Tag 產品層色彩固定指派**建議在 Product Master Design Standards 文件補一份「FCMT 狀態 → categorical hue」對照表(本檔 SSOT 消費清單已有雛形),避免未來其他工程師重新發明映射。
3. PRD Q7(進度加權方式)本輪採 PRD 6.2 建議預設值(狀態對應固定 %),均分/金額/人工三選一 UI 未做,待 PRD 未決議題收斂後補。
