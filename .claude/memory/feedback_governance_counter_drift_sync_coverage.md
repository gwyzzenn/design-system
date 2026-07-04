# Governance counter drift — 計數 SSOT 必進機械偵測範圍

**2026-07-04 全系統治理健檢根因**(3-agent 唯讀稽核抓出 D 斷鏈 9 / C 過期 15)。

## 核心教訓

治理文件的「計數 / 編號」是最易漂移的 SSOT class。反覆 stale 的 4 類:
1. **checklist 項數**:component-quality-gate 真值 35(12+13+6+4),但 6 處 hardcode「45」(連 checklist.md 標題自身,body 簽結卻寫 35 = 自我矛盾)
2. **gate 題數**:propose-options 真值 7-Q,但 meta-patterns 寫「6 題」、README/ensure-canonical/deep-audit 寫「4-Q」
3. **skill 清單數**:實際 22,但 meta-patterns「20 skills」+ skills/README 表只列 18(header 卻寫 22)
4. **M-rule 編號**:M27/M33/M35 已 retired fold(→M23(c)/M20/M23(d)),但 4 個 skill 仍當 active 引用

## 根因 = 機械偵測範圍漏

`scripts/sync-governance-counters.mjs` 的 `liveCountFiles` **原不含** `.claude/rules/meta-patterns.md` 與 `.claude/skills/README.md` → 「20 skills」等 stale 逃過自動 drift 偵測。這正是 CLAUDE.md「SSOT auto-sync invariant」宣示卻未落實的缺口。

**修法(2026-07-04 已落地)**:兩檔加入 `liveCountFiles`。踩到 date-adjacent false-match 陷阱:「2026-05-10 skills」被 `\b(\d+)\s+skills\b` 誤配成「10 skills」→ 改寫標題移開日期(`Skills consolidation(2026-05-10,...)`)才安全納入。

## 原則(下次加計數字樣前必守)

- **計數盡量改 pointer 不 hardcode**:能寫「per design-system-audit SSOT」「全 dim」就別寫具體數字(dim count 已如此做,故 88 無 drift)。真需寫數字 → 該檔必在 `liveCountFiles`,靠 script 機械守。
- **加檔進 liveCountFiles 前**:grep 該檔 `\b\d+ (skills|hooks|audit dims?|M-rules?)\b`,確認每個匹配都 = 真值,且無 date/version 相鄰誤配(`YYYY-MM-DD` 尾碼 + 空格 + keyword)。
- **retired M-rule/hook 必回填新 home 編號**:fold 時同步 grep 全 `.claude/skills/**` 改引用(M27→M23(c) / M33→M20 / M34→M7 / M35→M23(d))。
- **checklist/gate 題數以「純勾選表 / SKILL body 實列」為真值 SSOT**,引用處全對齊或改 pointer。

## Verify

`node scripts/sync-governance-counters.mjs` → 印 Hooks 52 / M-rules 31 / Audit dims 88 / 無 drift。加新計數字樣後必重跑確認 0 false-positive。
