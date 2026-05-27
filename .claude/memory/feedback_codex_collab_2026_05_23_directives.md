---
name: Codex collab + autonomous 7-axis + ASK gate strict (3-in-1 consolidated 2026-05-23 永久 directive)
description: User 2026-05-23 系列 verbatim directives — ASK gate 唯一收斂 SSOT-UI/UX 增刪改;codex brief 三 invariant;「trust 自己」真意 = M31 dual-track NOT skip;triple-verify 防無病呻吟
type: feedback
originSessionId: a689a78e-f264-4c1f-b881-0859a7a12135
---

# Codex Collab + Autonomous Discipline — 3 sub-rules consolidated

2026-05-23 user 同 session 多 turn verbatim directives 合併本檔。原 3 file(`feedback_autonomous_default_triple_verify` / `feedback_codex_collab_real_intent` / `feedback_codex_brief_invariants`)Rule-of-3 absorb 合併。

## Sub-rule 1 — ASK gate 嚴格收斂 + autonomous 7-axis(原 autonomous_default_triple_verify)

**Rule**:
- **ASK gate 唯一條件** = 會影響 SSOT 的 UI/UX 增刪改(新 component / 新 token / 新 design language / 新 visual canonical / 跨元件視覺結構新規)
- 其他全 autonomous,不以省工為前提,依 **7-axis** 完整完美:言簡意賅 / 效率+效能 / SSOT 鐵律 / 易懂 / 維護 / 擴充 / 世界級+一致設計語言
- **SSOT auto-sync invariant**:跨 file 同概念數字(M-rule / hook / dim count / npm scope / version / pluginName)有 SSOT,其他 file 必 reference 或 `sync-governance-counters.mjs` 機械對齊

**Autonomous scope 包含**(non-exhaustive):
- Bug fix / clean / refactor / 命名一致 / test / audit / verify
- Governance / hook / skill / spec 內部(typo / pointer / 結構 — 不動 canonical meaning)
- Perf / a11y / 漸進遷移
- 既有 canonical 對齊 / 反 sample / anti-pass-through infra / CI / npm script / memory hygiene

**User 原話**:「所有工作流程,基本上只有會影響 SSOT 的 UI/UX 的增刪改需要用中文具體言簡意賅的人話講給我聽讓我判斷決策,其他的決策基本上就是不以省工為前提...自主自動自發地做到完整、完美」+「你他媽這些所有有 ssot 的東西都要給我自動同步更新,避免他媽給我偏移」

## Sub-rule 2 — Triple-verify before bothering user(原 autonomous_default + real_intent)

**Rule**:任何 propose / 列 option / 發現 problem(含 codex 抓的、deep audit P0/P1/P2、hook 抓的)propose 前必先 inline 跑 3-test:
1. `grep` DS-wide consumer / spec / hook 確認 pattern 存在
2. Read 對應 `*.spec.md` / `*.tsx` 確認 problem 真存在
3. 對照既有 canonical 確認非 false positive(eg. documented exception)

三題全過才 propose;任一 NO → 自動撤回,不煩 user。

**User 原話**:「所有問題,包括跟 codex 討論辯論出來的問題,你他媽都要給我再三全盤確認所有檔案包括設計原則看到底是不是真的問題還是只是無病呻吟,不要明明不是問題卻一直煩我」

**False-positive anchors**(propose 前要 triple-verify 才不會誤煩 user):
- 2026-05-18:Sheet / inline-action / SurfaceBody 三題 migration propose 全 false positive(grep 0 個真 gap)
- 2026-05-23:Badge / OverflowIndicator `text-[10px]` 被 deep audit 誤判 drift,實際 `badge.spec.md` L161-167 documented sub-footnote exception

## Sub-rule 3 — Codex brief 三 invariant + 真意 = adversarial dual-track NOT skip(原 brief_invariants + real_intent)

**Rule A — Codex brief 三 invariant**(brief 缺一 = BLOCKER):
1. 「全盤閱讀全部 source(CLAUDE.md / 全 M-rules / 全 rules/*.md / 全 audit dims SKILL.md / 全 spec.md / 全 stories / 全 components / tokens / patterns / hooks / memory / planning),禁憑記憶」
2. 「Triple-verify per finding:(a) grep DS-wide (b) Read spec.md/tsx (c) 對照既有 canonical exception;任一 NO → 自動撤回 finding」
3. 「禁抽樣 — DS-wide ALL files 全掃,context 不夠拆 stage;『I sampled / spot-check / representative』= audit incomplete reject」

Codex 跑的 audit 流程 = Claude 跑的 deep audit 流程(SSOT 同源 `.claude/skills/design-system-audit/SKILL.md`),不可偏移。

**Rule B — 「trust 自己」真意**:User directive 含「codex / trust 自己 / 不需要再 / 比稿」**永遠不可** 解讀為「skip codex / skip Phase B / Claude solo」。

真意 = **完整 M31 5-step adversarial dual-track**:
1. 各自全盤閱讀(read all files DS-wide)
2. 各自驗證(scripts independently)
3. 各自視覺稽核(playwright + DOM inspect)
4. 各自 3-column cite propose(spec.md path:line / 引文 / reasoning)
5. **不被 codex 牽著鼻子走** — cite battle if disagree,evidence stronger 勝

**User verbatim 2026-05-23**:
> 「我的意思是你們各自都要全盤閱讀過所有檔案據理力爭辯論討論,不要被 codex 牽著鼻子走,要再三確認問題真的是問題而不是無病呻吟」
> 「你他媽為什麼要曲解我的意思,你是低能兒嗎?」

**Anchor**:2026-05-23 我答「Phase B 未啟,因 historical『trust 自己』」→ user 怒糾「曲解!adversarial dual-track NOT skip」。「不被 codex 牽著鼻子走」(反 pass-through,要據理力爭) ≠「不用 codex」(skip)— 180° 相反。

## How to apply(統一)

- 每次送 codex brief **必含三 invariant**(template force per `.claude/skills/codex-collab/references/brief-template.md`)
- Codex reply 收到後必走 M31 Step 4 → 4.5 → 4.6 → 5(grep cite verify + regression + own-version 比稿),禁 pass-through
- ASK gate 自問:(1) 真 SSOT-UI/UX 增刪改?(2) 動新 design language?(3) charter / canonical 已 codify scope? 全 YES 才 ASK,其他 autonomous
- Borderline case(governance / 對齊 charter / 反 sample infra / CI / perf)→ default autonomous + brief 報結果

## Mechanical enforcement

- `check_propose_pre_grep_verify.sh` P0 PreToolUse(propose without grep evidence → BLOCK)
- `check_substantive_edit_approval_preflight.sh` PreToolUse Edit/Write production code(無 approval → BLOCK)
- `stop_self_audit.sh` Mechanism 4(codex-verify gap)+ Mechanism 5(codex-transport-discovery 未跑)
- `check_codex_collab_5step.sh` commit message keyword + cite + verdict
- `check_codex_brief_invariants.sh` brief 缺三 invariant 任一 → BLOCKER(planned)
- `check_audit_sample_escape.sh` pre + post(2026-05-23 雙向)
- `scripts/sync-governance-counters.mjs` + `scripts/ssot-sync-check.mjs` SSOT auto-sync
- CLAUDE.md `# 自主執行 canonical` 2026-05-23 段(永久 codified)

## Anti-pattern(永久 ban)

- ❌ Propose / report 前沒 triple-verify(grep / Read / canonical exception)
- ❌ Codex brief 缺三 invariant
- ❌ 收 codex reply pass-through 不 Step 4.5 verify
- ❌ ASK user 拍板 governance hygiene / charter 對齊 / CI / perf 等 non-UI/UX
- ❌ ASK 用「我推 X」passing buck — 若 non-SSOT-UI/UX 直接做 X
- ❌ 讀「trust 自己」= skip codex(180° 曲解)
- ❌ Codex sandbox EPERM 跳 dim 沒 documented + Claude 不補
- ❌「省工 / 下次再做 / 下個 session」defer
- ❌ SSOT hardcode 多處不走 sync-governance-counters

## 對齊原則

- M31 5-step adversarial dual-track(SSOT `codex-collab/SKILL.md`)
- M18 Q0 universal pre-propose gate
- M19 trigger phrase auto-pipeline
- M20 self-improvement + M33 anti-defer(folded into M20)
- mindset #1 不取巧
- Linux kernel patch review / Google ML eng-design-review(永遠 dual reviewer)
