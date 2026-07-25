# FCMT Prototype — Benchmark 掃描與候選方案評估

`/prototype` Phase 1(benchmark research)+ Phase 2(candidate evaluation)完整記錄。
對應 PRD:`建廠計劃與物料追蹤管理系統 PRD v0.1`;聚焦範圍:MVP 核心 3 頁(App Shell 導覽 + 追蹤單清單 + 追蹤單詳情)。
決議結果與產出檔案見同層 `notes.md`。

---

## Phase 1 — Benchmark 掃描(9 家世界級參考)

### A. 視覺/互動層

| Reference | Approach | Key mechanics | 對應我們畫面 |
|---|---|---|---|
| **Linear** | Issue list 依 status 分組,group header 顯示數量/estimate 總和 | Status 是有序 workflow(Backlog→Todo→In Progress→Done→Canceled),顏色語意化;list 排序「離完成最近→最遠」 | 追蹤單清單的狀態分組邏輯;但 Linear **無**進度百分比雙編碼,純狀態驅動 |
| **Jira** | Issue detail 下方 Activity 區塊分 Comments/History tab,History 為 event-sourced 時間序 | Subtask 變更**不會**自動寫回 parent history(已知 gap)——反例:提醒我們追蹤單→子項變更必須顯式往上寫歷程 | 追蹤單詳情的「歷程」表格形態 tab |
| **Monday.com** | Status column(文字+色塊)與獨立 Progress Tracking column(battery-like bar)並列 | 兩欄**分離**但同列並排,progress 是「子項完成比例」衍生值 | 直接對應 PRD R1「狀態 chip + 進度條雙編碼」的視覺原型 |
| **Procore** | Submittal Log 三層狀態(Draft/Open/Closed)+「Ball In Court」欄顯示現在卡在誰手上 | 狀態欄旁**永遠**有「負責人」欄一起看,不單獨看狀態 | 追蹤單清單的「負責人」欄必須跟狀態並列 |
| **Autodesk Construction Cloud** | 提交項目與 schedule 的 task/milestone 對齊,time-stamped filterable record | 到料/提交跟施工排程的依賴關係是一等公民,不是事後報表湊出來的 | PRD R4「到料 vs 施工對齊」的資料模型依據 |
| **Smartsheet** | Baseline/Actual/Variance 三個**不可編輯**衍生欄位,Gantt 中 baseline bar 疊加 actual bar | Variance = Actual − Baseline,系統算不可人工填;Baseline 鎖定後才有意義 | 里程碑三日期組(Baseline/Forecast/Actual)+ PRD 5.3「delay_days 衍生欄位」 |
| **Salesforce** | Approval History related list:送審日期/簽核人/決議,獨立於主記錄 | Four-eyes 簽核的「誰簽的、何時、決議」是獨立可稽核的 related list,不是主表一個欄位 | PRD 6.1「Approved 必須非提出者」+ 未生效態三件套的「可回溯」 |
| **SAP Ariba** | PO 狀態由「系統事件」觸發轉移(供應商確認/出貨通知/驗收),不是人工任意切換 | 狀態轉移與「觸發事件」強綁定 | PRD M3-3「非法轉移必須被系統阻擋」→ 詳情頁用動作按鈕(填 PO/確認出貨)觸發轉移,不給裸狀態下拉 |
| **Oracle Fusion Procurement** | Requisition→PO 自動轉換,保留 Lifecycle / History / Approval History 三張獨立稽核表 | 稽核軌跡拆三張表,而非塞進單一 log | 佐證 PRD M3-6「歷程雙形態」(稽核用表格 + 工作用時間軸)是業界收斂的最小拆分 |

### B. OOUX 層(跨 9 家收斂出的物件共識)

| Object | 業界共識屬性 | 我們 PRD 對應 |
|---|---|---|
| **Tracking Item**(Procore Submittal / Jira Issue / Linear Issue) | 唯一編號、狀態(enum)、負責人、里程碑日期組 | `TrackingItem` 追蹤單(附錄 A) |
| **Sub-item**(Monday subitem / Jira subtask / Smartsheet child row) | 繼承 parent 部分屬性、自己的狀態、彙總回 parent | `SubItem` 子項(5.1 / 附錄 B) |
| **Milestone/Baseline set**(Smartsheet / ACC schedule task) | 三態日期(計劃/預測/實際)、鎖定規則、衍生 variance | 5.3 里程碑日期組 |
| **Activity/History record**(Salesforce / Jira History) | 獨立 append-only、可篩選、不可竄改 | M3-6 變更歷程雙形態 |
| **Ball-in-court / Owner**(Procore) | 狀態旁必顯示「現在卡在誰」 | owner + status 並列顯示 |

### 共識與分歧

- **共識**:9 家全部同意「狀態」與「進度%」是兩個獨立衍生軸,無一家把兩者塞進同一欄位語意。
- **共識**(ERP 兩家):狀態轉移 = 事件觸發、非自由切換,是採購/建廠領域的硬性慣例(跟 Linear/Jira 的「使用者自由拖動狀態」分屬不同領域慣例)。
- **分歧**:「進度%怎麼算」——Monday 是子項完成比例;PRD Q7 未收斂(均分/金額/人工)。Prototype 先採 PRD 6.2 預設(狀態對應固定 %)。

---

## Phase 2 — 候選方案評估(A/B/C)

三個候選共用同一 Object Map(差異在 UI shape + progressive disclosure + CTA ordering,不在物件定義)。

### 候選總覽

| 候選 | 核心 pattern | 靈感來源 |
|---|---|---|
| **A. Peek Panel 式** | 清單為主場,點列開 rightSider(320/360px)快速看/改,不跳頁 | Linear issue peek |
| **B. Master-Detail 全頁式** | 清單 → 點列導覽進全頁詳情(左樹 Zone/Site + tabs 現況/進行中/歷史) | Procore log + Salesforce approval history + **PRD 9.1 既定選型** |
| **C. Inline-Expand 式** | 清單列直接展開子項/里程碑,編輯走 G1 698px modal,零跳頁 | Procore / SAP Ariba 高密度操作 |

### 評分矩陣

| 軸 | A. Peek Panel | B. Master-Detail 全頁 | C. Inline-Expand |
|---|---|---|---|
| **優點** | 導航成本最低,PM 快速掃視/處理最快 | 完全對齊 PRD 9.1 已定 A 型選型 + Product Master 三分 tabs/rightSider/G1 canonical;四角色(PM/工程師/採購/主管)都覆蓋 | 採購窗口批次處理大量追蹤單效率最高,零跳頁 |
| **缺點** | 追蹤單 14 欄位+子項+歷程+附件,rightSider 塞不下完整脈絡;等於用 Sheet 取代既定 A 型頁面,繞過 PRD 已寫明的選型決策 | 清單→詳情要跳頁,改個負責人也要進全頁 | 「查看」與「編輯」擠在同一 inline-expand/modal,違反 Product Master「Attribute tab 禁直接可編輯,需經 Edit 進 Modal」分離原則;10,000 筆資料量下展開列滾動體驗差 |
| **DS 一致性**(1-5) | 3 | **5**(直接消費既定 canonical,非自創) | 3 |
| **業務 fit**(1-5) | 3 | **5** | 4 |
| **複雜度**(低=5) | 4 | 3 | 4 |

### Narrative(對齊 mindset)

- **Mindset #2(優先消費既有)/ M23(DS canonical 優先)**:PRD 9.1 頁面選型表已明講「追蹤單詳情 = A. Master-Detail 管理頁,tabs 採現況/進行中/歷史三分」——這是 PRD 作者已做的設計判斷,不是本輪憑空提案。A/C 兩候選等於挑戰既定選型,除非有強烈理由,否則不該無故偏離。
- **Mindset #4(真實業務場景)**:C 的零跳頁對採購窗口高量操作有真實價值,但 PRD 效能需求(清單頁 10,000 筆)下 inline-expand 的滾動與虛擬化複雜度顯著上升。
- **A 的定位修正**:A 不適合當「唯一詳情入口」,但作為清單頁的**輔助快速檢視**(不取代全頁)成本低、價值高——這正是最終混搭決議的來源。

### Checkpoint 2 決議(user 拍板)

> **「B 為主,A 作為輔助混搭」**——主頁面走 B(全頁 Master-Detail),清單額外支援點列開 Peek rightSider 快速看(不取代全頁,只是快速瞥一眼);C 落選。

落地對應:
- B → `TrackingItemDetail.stories.tsx`(A 型 Master-Detail,3 stories)
- A(輔助)→ `TrackingItemList.stories.tsx` 的 `TrackingItemPeek`(Sheet 360px,G3 規格)
- C → 未實作;其「批次操作」價值由 PRD M3-4(批次改狀態/負責人/預計日)在 B 型清單頁後續擴充承接

### C 落選理由存檔(per /prototype 排除理由要寫進 notes)

1. 違反 Product Master 編輯入口分離原則(View/Edit 顯式切換、禁 cell 級隱式編輯)。
2. 10,000 筆效能需求下 inline-expand 虛擬化複雜度高,MVP 階段成本不划算。
3. 其核心價值(高量批次處理)可由 M3-4 批次操作 + B 型清單覆蓋,不需要獨立 layout pattern。
