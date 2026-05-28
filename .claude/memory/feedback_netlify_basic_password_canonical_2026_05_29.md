---
name: Netlify access control canonical = Basic Password(2026-05-29)
description: Netlify Identity deprecated;Team protection 鎖 Pro;fork-template default access = Basic Password(共用 password);Codespaces 是合法 cloud-dev path
type: feedback
originSessionId: 41fa83c2-f951-431e-911e-ed3ceb185903
---
# Netlify access control 真相 + 全雲端可行性(2026-05-29 user screenshot 抓出)

## Rule

**Fork-template default Netlify access control = Basic Password Protection**(free-tier 唯一可用)。**禁** 推薦 Identity(已 deprecated)/ 推薦 Team protection(鎖 Pro $19/mo)。`npm run setup:netlify` 自動跑 CLI install + login + site 建 + 連 repo,**最後印 dashboard URL + 教 user 點 2 radio button + 輸 password**(無法 CLI 自動 — Netlify 沒提供 password protection 的 API,2026-05-29 verified)。

**Why**:Netlify 2024 公告 Identity service deprecated;新帳號可能根本看不到 Identity menu。Visitor access UI 在 free-tier 只有「Basic protection」可選,「Team protection」+ 「Non-production deploys only」都鎖 Pro plan。Identity-based invite-only(per-user account)路徑**真實不可用**。我前期反覆 propose Identity-based 流程,user 2026-05-29 screenshot 抓出實際 UI 跟我講的對不上。

**How to apply**:
- 寫 fork-template setup script / README / CLAUDE.md → default Basic Password,Identity 撤回不再 mention 為 option(只在「為何不用 Identity」段 explain why)
- 寫 propose 給 user 涉及 Netlify access → 先 verify 該功能在 user's tier 真存在(Identity 普遍已不可見;Team protection 普遍鎖)
- Fork user 體驗 = 5 個斷點:plugin install(30s)+ OAuth(1 click)+ password 設(30s dashboard)+ password 分享(team chat / DM)+ push trigger(1 word)。不騙人講「無痛 / 全自動」
- 推 Codespaces 為 cloud-dev path(免本地 macOS):GitHub Codespaces 內可裝 Claude Code CLI,governance hooks 全 fire。免費 60h/月。我前期錯誤否定「全雲端可行」— 真相是 Codespaces 撐得起整套 governance
- 動 Netlify access control 相關文件 / hook / audit dim → 同步 mirror 兩處(DS template `template/product-workspace/` SSOT + `/tmp/ds-product-template/` user live clone + ds-canonical mirror)

## 錨例

- 2026-05-29 user screenshot Netlify Dashboard Visitor access page 顯示 Password Protection 為唯一可用,Team protection 鎖 + Non-production deploys only 鎖
- 我之前(2026-05-26)反覆 propose Identity invite-only + 寫 setup-netlify-access.mjs 用 `netlify api provisionSiteIdentity` — Identity API 在新 site 不穩定 / 不可用
- 我之前 claim「寫 code 一定要本地」否定全雲端 — 錯,Codespaces 可裝 Claude Code,governance 全 fire
