# Design System Audit — Workflow(Phase 0 → 4 執行細節)

> 從 `SKILL.md` 拆出(2026-07-04,per 治理健檢裁定 3:SKILL.md 瘦身至 ≤250,dim registry 留 SKILL.md 原位、workflow 散文移此)。SKILL.md `## Workflow` 段指向本檔。

## Phase 0 — Setup + Build Baseline

1. Read `CLAUDE.md` fully + `git status --short`
2. **Build baseline(任一 fail STOP → Checkpoint 5)**:
   - `npx tsc -b` — 0 errors
   - `npx vite build` — `✓ built in`
   - `npm run build-storybook` — clean
3. **Mechanical content-quality baseline**:
   - `node scripts/audit-content-quality.mjs --check` — `✅ No content drift`(16 cat)
   - `node scripts/extract-canonical-rules.mjs` — `✅ All extracted rule keywords covered`
   - violation → 列 P0
4. Build fail → 不跑全 dim;報 user 決定先修 OR 繼續(broken code audit 多 dim 跑不動)
5. TaskList entries 建好

## Phase 0.5 — Preflight 全面盤查(2026-05-15 user-mandated P0,NO-SAMPLE 前置)

User verbatim:「你完整稽核之前應該會先全面盤查全部檔案和所有設計原則對吧?我記得之前我有命令你要在 infra 定義這件事」+「確保現在和未來都會自動涵蓋,當有新的準則就務必更新設計系統進階稽核的內容」。

**強制 chain**:`/design-system-audit --deep` 跑時 Phase 1 前自動跑 `node scripts/audit-preflight.mjs`(對應 SSOT `.claude/memory/feedback_audit_preflight_全盤查.md`)

**輸出 3 件**:
1. **檔案 enumeration**:全 `packages/design-system/src/**/*.{tsx,ts,css,md}` 計數 + per type bucket(component tsx / showcase stories / anatomy stories / principles stories / spec.md / tokens)
2. **設計原則 enumeration**:M-rule(meta-patterns.md)+ spec trait(frontmatter)+ hook invariant + rules
3. **Coverage matrix**:每原則 → audit dim 對應(N 對應 / NO COVER gap)— 存 `.claude/logs/audit-preflight-{date}.json`

**Gap 處理**:有 gap → Phase 1 dispatch 前 user 拍板:補新 dim / 撤原則 / 接受 gap 紀錄 deferred。

**Phase 1 sub-agent 必引 preflight log**:Coverage matrix 對應 dim → sub-agent 跑該 dim 時掃 file enumeration list(DS-wide ALL,不 sample,per NO-SAMPLE invariant)。

## Phase 1 — Parallel audit execution

Launch all audits as background subagents (single message, multiple `Agent` tool calls with `run_in_background: true`). Use prompts in [audit-prompts.md](audit-prompts.md).

**Every audit prompt declares three metadata lines at top**:
- **Type**: `Absolute` or `Consistency` (per CLAUDE.md`# 稽核 canonical`「Consistency 類稽核」)
- **Canonical source**: where correct behavior is defined
- **Rationale home**: where deviation justification should live (`N/A` for Absolute)

Sub-agents applying a **Consistency** dim **must** search the Rationale home for each apparent deviation before reporting as VIOLATION. A documented rationale paragraph = `deviation ✓` (not a violation). Absolute dims apply strict `actual == canonical` check.

Each audit reports:
- Violations only (skip confirmations); for Consistency dims, also list `deviation ✓` items with rationale location as evidence the framework caught-and-cleared them
- file:line for every finding
- Suggested fix direction
- Count + top offenders

### ⚠️ `--deep` mode NO-SKIP + NO-SAMPLE invariant(2026-05-15 user-mandated P0)

User verbatim 2026-05-15:
> 「請確保之前所有列過的關於 design system 深度稽核要做的事情在稽核時都肯定會做到」
> 「都已經叫深度稽核到底怎麼還能疏漏?」
> 「**稽核並非既往不咎,稽核要全盤稽核,不能只抽樣,要全盤**」

**`/design-system-audit --deep` 跑時兩條 mechanical**:

### NO-SKIP(原 2026-05-15)
- Sub-agent prompt 禁含「SKIP / too heavy / DEFERRED per instruction / 跳過 dim」keyword
- 每 dim 必跑,heavy dim(12/24/25/40-44)獨立 sub-agent,不擠 batch
- Context 不夠 → 拆 2-stage(per-component scan → cross-component synthesis)

### NO-SAMPLE(2026-05-15 補強 + 2026-05-17 P0 升級嚴格 no escape clause)
- Sub-agent prompt **禁含「sample top N / subset / pick top X / top hot / sampled components / sample evidence allowed / heavy agent needed / full sweep deferred」**等任何縮 scope keyword
- 每 dim 必 **DS-wide ALL components**(60+ 元件全掃),不 sample subset
- Context 不夠 → 拆 N stages(每 stage 10-15 元件 batch),**不 sample**
- 對應 SSOT:`memory/feedback_audit_full_sweep_not_sample.md`
- **2026-05-17 強化(user verbatim 抓教訓)**:「每次抓出的問題你他媽要給我基於我們所有的檔案包括設計原則去再三確認到底是不是問題」+「沒有取樣這種東西」+「重新深度完整稽核」。Dispatch prompt 任何「sample evidence allowed」/「heavy agent needed for full sweep」/「sample-N」escape clause **禁止寫入** — 違 = BLOCKER 不發 dispatch

**Sub-agent dispatch prompt template MUST 含(2026-05-17 升級)**:
```
**Coverage requirement (NO-SAMPLE STRICT, NO ESCAPE)**:
DS-wide ALL components(grep / glob 全 packages/design-system/src/components/*/),不挑樣本。
若 context 不夠 → 拆 stage 分批(每 stage 10-15 元件),**所有 stages 必跑完才能寫 verdict**。
**禁止**寫「sample / top N / heavy agent needed / full sweep deferred」等 escape clause。
若 dim 真不可能全掃,反 dispatch 給 user 拍板,不是寫 sample escape clause。

**Triple-verify finding rule (2026-05-17 user-mandated)**:
每抓 1 個 violation,sub-agent 必 verify 3 layer 才能列進 report:
(a) grep cite 真實 file:line(不只列名,要 quote 引文)
(b) Cross-check 對應 spec.md「禁止事項」/「何時用」/「何時不用」段 — 該違反真的違 spec 嗎?
(c) Cross-check 既有 DS canonical/.claude/rules + structural-token-retention.md + tokens/{name}.spec.md — 屬 forward-looking / palette completeness / dark mode pair 嗎?
任一 layer 顯示「不是 violation」→ retract from report,不送 user 拍板。
違 triple-verify = 浪費 user 時間 false-positive,違 verbatim 2026-05-17 directive。
```

**Mechanical strength**:
- `stop_self_audit.sh` 偵測「`--deep` + sub-agent prompt 含 SKIP / sample / heavy agent / top N keyword」→ BLOCKER inject
- `check_audit_sample_escape.sh`(2026-05-17 新加)PreToolUse Agent 攔截 dispatch prompt 含 sample escape clause
- 本 skill Phase 1 dispatching MUST cite「NO-SKIP + NO-SAMPLE invariant verified, triple-verify 內建,全 dim 已 dispatch」in commit message

## Phase 2 — Triage + CHECKPOINT 1 (MUST ASK)

Consolidate into priority matrix:

| Priority | Category | Examples |
|---|---|---|
| **P0 (auto-fix OK)** | Three-way drift / dead links / Tailwind v4 grep violations / hardcoded colors | 明確 bug，surgical 修復，無 scope 爭議 |
| **P1 (batch-fix + review)** | Rule A / 人話 / shadcn passthrough holes / a11y missing aria-label / anatomy missing section | 每組一個 commit，改完立刻 review |
| **P2 (MUST ASK)** | Rule B scope / new rule proposals / Internal vs Components reclassification / cross-cutting refactors (helper extraction 41 files) | 需 user 決策 scope |

### ⚠️ Checkpoints — STOP-and-ASK 場景(detail in [checkpoints.md](checkpoints.md))

| # | When | Action |
|---|------|--------|
| 1 | Triage 完(P0+P1 auto / P2 decision)| present + 等 user approve P2 scope |
| 2 | Audit surfaces pattern 未在 CLAUDE.md | propose 新 rule draft + 等 approve |
| 3 | Classification ambiguous(Internal/Components / SSOT home / primitive vs semantic)| present options + rationale |
| 4 | Cross-cutting refactor > 10 檔 | execution strategy options(1 commit / N / defer) |
| 5 | 環境 / 建置 issue | 報 user,不在 audit scope 修 env |
| 6 | spec 與 code 衝突 | 不 silent pick,present options + git log context |
| 7 | 「先不管」vs「之後再處理」semantic | **「先不管」= 完全忽略**(不入 tech debt);**「之後再處理」= park to memory**;絕不混淆 |

**Naming proposal**:Checkpoint 2 前必過 CLAUDE.md `## 命名必過三重 test`(SSOT in CLAUDE.md,不 re-spec)。

## Phase 3 — Apply fixes (grouped commits)

每 fix group:Edit(非 Write)→ `npx tsc -b` pass → commit 描述性 message。Typical groups:cva drift / Spec Rule A / a11y / Anatomy / CLAUDE.md contradiction。

## Phase 3.5 — 進階 6 維稽核 D3-D6(對齊 CLAUDE.md `# 稽核 canonical`)

Phase 1-3 覆蓋 D1+D2;D3-D6 chain 專門 skill。**模式**:高效(default)scope=changed 只跑 D5;進階 scope=all 跑全 D3-D6(trigger:`--deep` / 動 tokens|patterns/ / user 要求「完整 audit」)。

| Sub | 維度 | Skill | 規則 |
|-----|------|-------|------|
| 3.5a | D5 視覺 | `npm run visual-audit` Layer A → `/visual-audit` Layer B | violation 開新 commit 修回圈 |
| 3.5b | D3 效能 | `/performance-audit` | 修實作 auto / 改 canonical STOP |
| 3.5c | D4 UX | `/ux-audit` | P0 a11y 必修 / P1 triage |
| 3.5d | D6 原則自檢 | `references/principle-audit-protocol.md` 4 子維(合理 / 一致 / 無矛盾 / 完整)| 動 canonical substantive STOP / 對齊 / 補 pointer AUTO;scan 前必讀「常見 FP 記憶」節 |

**跳過**:spec.md 純文字改 / 高效模式只跑 3.5a。

## Phase 4.5 — Governance sprawl check(2026-05-17 升:default 也 chain light)

**Default mode**:chain `/knowledge-prune` Phase 0(baseline)+ Phase 1 D1(duplicate)+ D4(contradiction)輕量 **report-only**(不修),~5 min。Codex Q5 verdict:contradiction 比 dup 更會破 SSOT,該優先,故 default 不只 D1。

**Deep mode**(`--deep`):chain full Phase 0-5;P0/P1 auto-fix,P2 STOP 等 user。Trigger 條件(2026-05-17 加 4 條,共 9 條):CLAUDE.md > 800 / MEMORY > 20 / 動 Meta-Pattern / hook-fires 6 月 0 fire / corrections > 10 / **audit-prompts.md coverage < 100%** / **`@benchmark-unverified-blanket` count > 0** / **new audit dim added 本次** / **hooks count >= soft threshold(26)**。

**機械化 trigger 點**(2026-05-17 加):post-audit final report validator hook(`check_audit_post_report_validator.sh`)— audit Phase 4 結束 emit 「prune-chain-trigger」signal → 下一 turn `inject_pending_self_audit.sh` 注入 `/knowledge-prune scope=full` directive。**不**靠記憶。

**Findings → prune feed**(M14 mandate):Phase 1 finding 含「新 rule 提議」keyword → auto-queue `/knowledge-prune` Phase 1 D3 candidate(判 abstract 或 duplicate)。

## Phase 4 — Final report + memory + Self-improvement(強制)

Update `memory/project_audit_progress.md`(date / coverage / findings / deferred P2)+ short report(commits / deferred / next trigger)。

**Self-improvement capture(強制)**:每 audit 寫 3 行(無發現也寫「無」,不省略):
- 新 FP pattern + 回填位置(`principle-audit-protocol.md`「常見 FP 記憶」)OR「無」
- 新 meta-pattern + STOP 提議(動 canonical substantive)OR「無」
- 修完矛盾 / user 糾正 + 回填 home(memory / CLAUDE.md / spec)OR「無」
