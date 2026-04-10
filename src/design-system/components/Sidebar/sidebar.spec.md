# Sidebar

## 定位

佈局外殼元件——提供頁面側邊欄的容器結構（Header / Content / Footer 三個 slot），不包含導覽邏輯。導覽邏輯由放入 SidebarContent 的元件（如 TreeView）負責。

不是：Navigation Menu、Tab Bar、命令面板。

## 結構

```
SidebarProvider          ← 狀態 context（collapsed / width）
  Sidebar                ← 容器（bg-surface + border + width transition）
    SidebarHeader        ← 頂部 slot（logo、workspace switcher）
    SidebarContent       ← 中間可捲動區域（TreeView、選單列表）
    SidebarFooter        ← 底部 slot（user menu、settings）
  SidebarTrigger         ← 展開/收合按鈕（可放 sidebar 內或外）
```

## 收合行為

- 展開寬度預設 260px，收合寬度預設 48px（icon-only）
- 收合時整個容器寬度縮窄，內部文字被 `overflow-hidden` 裁切
- 寬度變化有 200ms transition，避免突兀跳動
- SidebarTrigger 透過 context 控制 collapsed 狀態，可放在 sidebar 任意位置

## 何時用收合 / 何時不用

- 用：資訊密集的工具型產品，使用者需要最大化主內容區
- 不用：內容型產品（blog、文件站），sidebar 內容本身就是核心，收合會損失價值

## 與其他元件的關係

- **TreeView**：放在 SidebarContent 內，TreeView 的 `context="sidebar"` 會自動使用 `--layout-space-loose` padding
- **Avatar**：常見於 SidebarFooter 顯示使用者身份
- **ScrollArea**：SidebarContent 可用 ScrollArea 取代原生 overflow 捲動（需要自訂 scrollbar 樣式時）

## 禁止事項

- 不在 Sidebar 內實作路由邏輯——Sidebar 只是容器，路由是 consumer 的事
- 不硬寫寬度到子元件——子元件應自適應容器寬度
- 不在收合模式下顯示 tooltip（目前版本不處理，未來可擴充）
