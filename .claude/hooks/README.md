# .claude/hooks/ Charter

## 這裡只收:pre/post tool event 的機械化自動檢查

每個 hook 是一個 shell / python script,在 Claude Code tool event 上自動觸發:
- **PreToolUse**:tool 執行前(可 block 或 inject context)
- **PostToolUse**:tool 執行後(通常 inject 提醒 / warning)
- **Stop**:turn 結束(sanity / harvest / metric capture)
- **SessionStart**:session 開始(governance check)

**核心特徵**:**不依賴 AI 自律**,tool 層強制執行;規則可用 `grep` / 條件判斷自動驗證。

## 當前居民(2026-04-26 重整,以 `settings.json` 註冊為準)

### PreToolUse

| Hook | Matcher | 做什麼 |
|------|---------|--------|
| `check_solo_workflow.sh` | Bash / github PR·merge | M28 git ops gate(branch sprawl / PR / merge — solo work canonical) |
| `check_codex_collab_5step.sh` | Bash / github PR·merge | M31 codex collab 5-step gate(claude+codex dual-track discipline) |
| `check_audit_sample_escape.sh` | Agent / Task / Workflow | audit agent dispatch 禁 sample-escape(全盤 NO-SAMPLE) |
| `check_codex_brief_invariants.sh` | Bash | codex brief 三 invariant(transport / queue / cite) |
| `enforce_home_charter.sh` | Write | classification-sensitive dir / 新檔案的 charter gate |
| `check_file_size_budget.sh` | Edit/Write/MultiEdit | CLAUDE.md / spec / SKILL / memory 行數預算警告 |
| `check_story_invariants.sh` | Edit/Write/MultiEdit | stories 合一 invariant(anatomy / slot-split / category / principles / R7-R9 baseline·overlay) |
| `check_canonical_propagation.sh` | Edit/Write/MultiEdit | canonical 改動(spec / token / primitive)consumer propagation 檢查 |
| `check_pattern_invariants.sh` | Edit/Write/MultiEdit | pattern 層 invariant(overlay-surface / item-anatomy / action-bar / C.1 scroll-chain) |
| `check_naming_and_abstraction.sh` | Edit/Write/MultiEdit | M21 prop variant test + M23(c) prop name conflict + naming 三 test + D.1 premature-abstraction P0 |
| `check_benchmark_citation.sh` | Edit/Write/MultiEdit | M22 benchmark claim inline cite verify |
| `check_wrapper_primitive_schema_drift.sh` | Edit/Write/MultiEdit | M30 wrapper schema 必 extends primitive |
| `check_field_family_invariants.sh` | Edit/Write/MultiEdit | Field family layout / state machine 統一(含 A.4 disabled-placeholder) |
| `check_datatable_invariants.sh` | Edit/Write/MultiEdit | DataTable canonical(virtualizer / column-types / autoRow / overflow / r2 size→width) |
| `check_opacity_token_usage.sh` | Edit/Write/MultiEdit | opacity token 使用紀律 |
| `check_substantive_edit_approval_preflight.sh` | Edit/Write/MultiEdit | production code substantive edit 前 user 拍板 preflight |
| `check_ds_anchor_preflight.sh` | Edit/Write/MultiEdit | M29 視覺/結構 propose 前必 grep spec owner 3-column |
| `check_chrome_header_avatar_canonical.sh` | Edit/Write/MultiEdit | chrome header avatar/NameCard 消費 canonical |
| `check_sidebar_menu_button_implicit_wrap.sh` | Edit/Write/MultiEdit | SidebarMenuButton 隱式 wrap 攔截 |
| `check_item_list_gap.sh` | Edit/Write/MultiEdit | M16 standalone card/pill multi-instance gap |
| `chrome_header_dispatcher.sh` | Edit/Write/MultiEdit | **Dispatcher**:orchestrate 4 ChromeHeader lib helper(chrome_header_handcraft / app_shell_primary_header / header_with_tabs_border / tab_lg_chrome_header_equal) |
| `check_dim_count_drift.sh` | Edit/Write/MultiEdit | audit dim count hardcode 攔(SSOT = design-system-audit/SKILL.md) |
| `check_propose_pre_grep_verify.sh` | Edit/Write/MultiEdit | M18 Q0 propose 前必 grep DS-wide verify |
| `check_spec_class_drift.sh` | Edit/Write/MultiEdit | spec 分類敘述 drift 檢查 |
| `check_main_branch_workbench.sh` | Edit/Write/MultiEdit | M28 sub-rule 禁直接在 main 上 edit production code |

### PostToolUse

| Hook | Matcher | 做什麼 |
|------|---------|--------|
| `check_audit_sample_escape.sh` | Agent / Task / Workflow | (同 PreToolUse,post 路徑補位) |
| `inject_deploy_url_after_push.sh` | Bash | push 後自動吐 Netlify preview URL |
| `check_post_main_ssot_propagate.sh` | Bash | push origin main + SSOT-affecting diff → inject 發版鏈 context |
| `block_prototype_imports.py` | Write/Edit/MultiEdit | 產品 code 禁止 import `explorations/` |
| `check_consumer_app_invariants.sh` | Write/Edit/MultiEdit | consumer app 端 invariant(no-catalog / story-baseline / DS primitive misuse — 2026-06-11 prune-merge 3 hook) |
| `check_full_story_visual_interaction_sweep.sh` | Write/Edit/MultiEdit | stakeholder story 全視覺互動 sweep(M15) |
| `check_overlay_open_focus_escape_probe.sh` | Write/Edit/MultiEdit | overlay open/focus/escape 行為 probe |
| `check_escape_marker_abuse.sh` | Write/Edit/MultiEdit | escape / allow marker 濫用偵測 |
| `check_tailwind_wildcard_in_docs.sh` | Write/Edit/MultiEdit | docs 內 tailwind wildcard 誤植攔 |
| `check_storybook_addon_packaging.sh` | Write/Edit/MultiEdit | storybook addon preset packaging(CJS)紀律 |
| `post_edit_dispatcher.sh` | Write/Edit/MultiEdit | **Dispatcher**(2026-05-13 prune,+1 since):orchestrate 9 lib helper(token_hygiene / hardcoded_strings / code_quality / layout_space / person_data / overlay_handcraft / cva_default_sync / story_compile_drift / governance_coverage) |
| `check_story_invariants.sh` | Write/Edit/MultiEdit | (同 PreToolUse,post 路徑做 disk read drift check) |
| `check_pixel_quantified_audit.sh` | Write/Edit/MultiEdit | M32 audit script 必 pixel-quantified(掃 `getAttribute(` 缺 `getBoundingClientRect(`) |
| `check_layout_space_magic_numbers.sh` | Write/Edit/MultiEdit | layout space magic number 攔 |
| `check_field_controls_contracts.sh` | Write/Edit/MultiEdit | Field controls contract 強制(c)/(e)/(f) 等 |
| `check_peoplepicker_ssot_drift.sh` | Write/Edit/MultiEdit | PeoplePicker schema drift(M30 anchor) |
| `check_select_all_canonical.sh` | Write/Edit/MultiEdit | select-all canonical 一致 |
| `check_audit_post_report_validator.sh` | Write/Edit/MultiEdit | audit report validator(F 段 false-claim 攔) |
| `auto_regen_ds_barrel.sh` | Write/Edit/MultiEdit | DS barrel 自動重生(internal 排除) |
| `log_governance_fires.sh` | Write/Edit/MultiEdit | 治理檔 fire log 寫 `.claude/logs/hook-fires.jsonl`(L2 anti-bloat) |
| `log_skill_invokes.sh` | Skill | skill invoke log(僅捕 Skill tool,slash-command 走 user prompt 不被捕 — known limitation) |

### Stop

| Hook | 做什麼 |
|------|--------|
| `stop_passive_logging.sh` | **Dispatcher**(2026-05-13 prune):一次跑 5 rule R1-R5(tsc sanity / harvest corrections / capture metrics / governance drift / infra best-practice score)— 已吸收原 stop_meta_self_audit(R5)/ stop_harvest_corrections(R2)/ stop_capture_metrics(R3) |
| `stop_self_audit.sh` | turn 行為 audit(claim 沒 verify / prune trigger / topic 重複 ≥ 3 次 / 完整性宣告閘 → BLOCKER inject,M20 升級 2026-05-13) |
| `check_propose_discipline.sh` | propose 紀律(中文人話 + file:line cite)Stop 補位 |
| `check_orphan_ds_css.sh` | DS css orphan(不在 aggregator 也沒被 import)攔 |

### SessionStart

| Hook | 做什麼 |
|------|--------|
| `session_start_governance_check.sh` | 11 check(1 CLAUDE.md 行數 / 2 距上次 prune / 3 corrections / 4 benchmarks 過期 auto-fetch / 5 fire-weighted test gap / 6 fix-without-scan / 7 hook count / 8 memory entries / 9 branch sprawl / 10 SSOT auto-sync drift / 11 cross-repo env smoke) |
| `check_plugin_fork_health.sh` | plugin / fork repo 版本健檢(session start 提示 stale) |

### UserPromptSubmit

| Hook | 做什麼 |
|------|--------|
| `inject_pending_self_audit.sh` | 讀 `stop_self_audit` / `stop_passive_logging` R5 silent log,dedup + 24h filter + 3KB cap,inject 到 next turn additionalContext。修補 Stop hook silent-log 不 inject 的 known issue。 |
| `check_propose_without_benchmark.sh` | M26 propose 前無 WebFetch/WebSearch benchmark → soft inject 提醒 |

### Helper(非註冊 hook,`_` 前綴 = Unix internal-helper 約定,不計 hook 數)

| File | 用途 |
|------|------|
| `_log-fire.sh` | 各 hook source 的 fire-logging helper |
| `lib/_*.sh`(14) | dispatcher orchestrate 的 rule helper(`post_edit_dispatcher` 9 + `chrome_header_dispatcher` 4;`_approval_re.sh` 由 `check_solo_workflow.sh` source) |

## Anti-bloat 落地

- **L1 Pre-write**:`check_file_size_budget.sh` + `check_story_invariants.sh`(內含 principles canonical + l3 primitive 等 5 個合一)等(PreToolUse 阻擋 / 警告)
- **L2 Per-commit**:`log_governance_fires.sh` → `.claude/logs/hook-fires.jsonl`(governance file 編輯軌跡)+ `log_skill_invokes.sh`
- **L3 Periodic**:`/knowledge-prune` skill 季度跑,retire ≥ 5%

## 這裡**不收**(反例)

| 疑似要放這但其實不是 | 實際應去 | 為什麼 |
|-------------------|---------|--------|
| 需要 AI 走流程才能判斷的規則 | `.claude/skills/` | hook 只能機械判斷,複雜 workflow 屬 skill |
| 每 session signal rule | `CLAUDE.md` | hook 是 tool-level,不是 session-level |
| 單一元件的 lint rule | 該元件 spec + code | hook 是跨元件系統級,單元件屬 spec |

## 新 hook 的 criteria(必須全部通過)

1. **規則可機械判斷**(grep / 條件邏輯,不需人類 judgment)
2. **觸發 event 清楚**(PreToolUse / PostToolUse / Stop / SessionStart + matcher)
3. **已有明確 tech debt 或 bug class**(不做預防性空守衛)
4. **失敗模式安全**(hook 掛掉不會 block 合法操作 / 誤殺)

## 接線到 settings.json

新 hook 必須在 `.claude/settings.json` 的 `hooks.PreToolUse` / `hooks.PostToolUse` / `hooks.Stop` / `hooks.SessionStart` 陣列註冊,並用 `$CLAUDE_PROJECT_DIR` 作為路徑前綴。範例:

```json
{
  "type": "command",
  "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/your-hook.sh\""
}
```

## Hook 退出碼約定(Claude Code 協議)

- `exit 0` — 正常,不 inject context
- `exit 2` + stderr — **blocking**,AI 看到 stderr 訊息後必須處理
- `stdout` with `{"hookSpecificOutput":{"hookEventName":"...","additionalContext":"..."}}` — non-blocking context injection

## 已修(2026-04-28):Stop hook → UserPromptSubmit inject 鏈路

**症狀**:Stop hooks(`stop_self_audit` / `stop_passive_logging` R5 infra-score,原獨立 `stop_meta_self_audit` 2026-05-13 已 fold 入 R5)silent-log 但不 inject,M14 / M20 的「auto-inject corrective prompt」 不生效 → AI reactive 模式持續。

**修法**:加 `inject_pending_self_audit.sh` 註冊在 UserPromptSubmit hook(該 event 確認支援 `hookSpecificOutput.additionalContext`)。鏈路:

```
turn 結束 Stop event → stop_self_audit / stop_passive_logging R5 silent log to .claude/logs/
                                              ↓
user 下一個 prompt → UserPromptSubmit fires → inject_pending_self_audit.sh
                                              ↓
                                        讀 log (since last-inject-ts)
                                        dedup + 24h filter + 3KB cap
                                              ↓
                                        inject 給 AI next-turn context
```

**Self-test**:`bash .claude/hooks/tests/test_inject_pending_self_audit.sh`(5/5 pass)。

## Retired

`retired/` 目錄存舊 hook(不再註冊),保留 reference 不刪除。當前已 retire 的 hook 不在本 inventory 列出 — 以 `settings.json` 為 SSOT。

最近 retire(2026-04-28):
- `check_button_icon_literal.sh` — 違反 Rule-of-3(DS-wide 0 hits,只我 1 次失誤建)

## 建立前必 Read

本 README + 最接近的既有 hook 當範本 + CLAUDE.md `# 治理 canonical` 的 Hook 章節。
