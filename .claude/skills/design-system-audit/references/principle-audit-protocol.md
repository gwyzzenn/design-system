# D6 設計原則稽核 Protocol(SSOT)

**此檔是 D6「設計原則自檢」的唯一執行 SSOT**。所有 audit skill(design-system-audit / component-quality-gate / prototype / product-ui-audit)的 D6 phase 都 chain 本檔,不重複寫邏輯。

對齊 CLAUDE.md `# 稽核 6 維 + 2 模式` + `# 稽核 vs 執行 分權 canonical`。

---

## 為什麼有這個檔

2026-04-21 user 發現 D6 過去只做 triage 不真 scan → 漏掉 Inline Action icon SSOT 矛盾(item-anatomy 說「統一 fg-muted」vs Tag spec 說「繼承 Tag 文字色」),跨 spec 矛盾自 2026 年初累積到被 user 透過 BTW 發現才修。

**原因**:D6 散在各 skill 裡描述為「提議討論 triage」,無統一掃描方法 → 每次 audit 的 sub-agent 沒有強制 scan 動作 → 矛盾無人發現。

**解**:本檔定義 D6 的 4 子維 + auto-vs-STOP 判斷公式 + scan 方法。一處 SSOT,所有 skill chain。

---

## D6 4 子維

| # | 子維 | 掃什麼 | 怎麼掃 |
|---|------|-------|-------|
| **D6a** | **合理性** | 每條 canonical 是否世界級對照支持?有明文 rationale(「為什麼」)?自立論的規則應淘汰或補世界級 | 讀 spec 找「為什麼」prose + 對照 Polaris / Material / Atlassian / Ant / Apple HIG 該概念;孤立 rule 無對照 = flag |
| **D6b** | **一致性** | 同概念跨 spec / 跨元件表達 / 術語是否一致? | (1) grep 同 token 名跨 spec 用法(fg-muted / foreground 等)檢查用對層級;(2) grep 同 prop value literal 跨元件;(3) 命名三重 test(CLAUDE.md) |
| **D6c** | **無矛盾** | spec↔spec / CLAUDE.md↔spec / canonical 聲明衝突 | 找兩 spec 對同一 canonical 概念給出**不同規定**;找 canonical 被多處聲明但版本不一致(SSOT drift) |
| **D6d** | **完整性** | 原則有無覆蓋所有 state / scope / edge case?scope default pointer 該有沒有? | 對照 Rule B scope defaults(Field family / dark mode / density / wrapper 類),每 spec 驗證 applicable 項目的 coverage |

---

## Auto-fix vs 提議(STOP)判斷公式

### 核心判斷:**動 canonical 的 substantive meaning 與否**

| Finding 類型 | 動作 | 判斷依據 |
|--------------|------|---------|
| spec 跟 tsx / cva 不同步(tsx 是 source of truth) | **AUTO** 修 spec 對齊 tsx | tsx 是 code canonical,spec 該反映實作 |
| spec 跟 spec 用詞不一致 **但 substantive meaning 同** | **AUTO** 對齊 wording | 純表達統一,不改 meaning |
| SSOT pointer 缺 / reciprocal 缺 / dead link | **AUTO** 補 | 架構已定,機械補齊 |
| 編號 / 格式 / 排序問題(anatomy numbering / heading 順序) | **AUTO** 修 | 無 substantive 改變 |
| 命名對齊 **既有** canonical(術語 drift 修) | **AUTO** 統一 | canonical 已定 |
| 某 spec hardcoded class / px 漂移 → 用 token 名或 pointer 取代 | **AUTO** 修 | 表達層,不動 canonical |
| Rule A spec prose 移除 class name(遷到 anatomy) | **AUTO** 遷移 | 職責分離 |
| Scope default pointer 缺(該指 field-controls.spec.md 沒指) | **AUTO** 補 | SSOT 已存在 |

---

| Finding 類型 | 動作 | 為何 STOP |
|--------------|------|----------|
| spec 聲明的原則世界級對照有疑 | **STOP 提議** | 改 substantive 需 user 拍板 |
| 跨 spec 矛盾 **兩邊都有 rationale** | **STOP 提議(擇一當 canonical)** | 哪個對?需仲裁 |
| 新增 canonical rule / 刪現有 canonical rule | **STOP 提議** | canonical scope 動 |
| 命名決策(新 prop value / 新術語)| **STOP 提議** | 命名三 test 後仍需拍板 |
| 原則 scope 擴充 / 收緊 | **STOP 提議** | governance 動 |
| 擴 SSOT 納入新 branch(例:Inline Action「colored host」新分支) | **STOP 提議** | canonical 擴張 — 2026-04-21 Inline Action icon 案例屬此 |
| Rationale 存在但疑似過時(實作已改但 rationale 沒跟) | **STOP 提議** | 是該撤 rationale 還是 revert 實作?需判斷 |

### 核心公式

```
動 canonical 的 substantive meaning → STOP(提議,等 user sign-off)
對齊 canonical / 表達統一 / 補 pointer → AUTO(直接修)
```

**判斷 substantive 的 keyword**:
- 「canonical」「聲明」「必須」「統一規則」「SSOT」「rationale」「為什麼」「不允許」「禁止」
- 出現在 spec prose 且動到的 edit 觸及這些關鍵字 → 觸發 STOP

---

## Scan 方法

### D6a 合理性 scan

```
對每個 .spec.md:
1. grep 「為什麼」/「rationale」/「世界級對照」章節
2. 找不到 = P1 flag(spec 缺 rationale)
3. 找到但無外部對照(自立論)= P2 flag(需補世界級對照)
```

### D6b 一致性 scan(grep-heavy)

```
1. Token 用法一致性
   - grep `fg-muted` / `fg-secondary` / `fg-tertiary` 在所有 spec
   - 檢查是否用在對的 role(color.spec.md 定義)
   - 誤用 → AUTO 修

2. Prop value literal 跨元件
   - grep 所有 `variant:` / `size:` / `mode:` 在 .tsx
   - 建立 {literal: [components]} 表
   - 同字跨元件 → 驗語義一致(命名三 test #3)
   - 語義不一致 → STOP 提議(命名決策)

3. 術語一致性
   - 常見 drift:dismiss vs close vs dismiss vs onDismiss / onClose
   - fg-muted vs fg-secondary 用對層級
```

### D6c 無矛盾 scan(AI 讀 spec pairs)

```
1. 建「canonical concept index」(從 CLAUDE.md + patterns/*/spec.md)
2. 對每個 canonical concept,grep 所有 spec 聲明該 concept 的段落
3. 比對:
   - 同 concept 兩 spec 聲明**不同**規定 → P0 矛盾(修其一或擴 SSOT)
   - 同 concept 某 spec 靜默違反 CLAUDE.md rule → P0 矛盾
   - 某 spec rationale 跟 tsx 實作不符 → P1 矛盾(spec 過時或 tsx 錯)
4. 每個 P0 矛盾 flag 前驗是否為 documented deviation(rationale 存在 → deviation ✓)
```

### D6d 完整性 scan

```
1. 對每個 .spec.md,checkpoint 是否覆蓋(applicable):
   - disabled state
   - loading state(async 元件)
   - empty state(容器類)
   - dark mode(non-scope-default 元件)
   - density(non-scope-default)
   - icon-only rule(interactive 元件)
   - a11y 預設
   
2. 缺且無 scope default pointer → flag(可能 AUTO 補 pointer or STOP 補 prose)
```

---

## Report 格式

```markdown
# D6 Principle Audit — {Scope} — {YYYY-MM-DD}

## 執行 scope
- 子維:D6a / D6b / D6c / D6d
- 元件 scope:{all / changed / component:X}

## AUTO-fixable findings(直接修)
### D6a 合理性(AUTO)
- {file:line} {desc}

### D6b 一致性(AUTO)
- ...

### D6c 無矛盾(AUTO)
- ...

### D6d 完整性(AUTO)
- ...

## 提議討論(STOP,等 user sign-off)
### 跨 canonical 矛盾需仲裁
1. **{Concept}**:spec A 說 {X}(line),spec B 說 {Y}(line)
   - 選項 A:修 A 對齊 B,因為 {reason}
   - 選項 B:修 B 對齊 A,因為 {reason}
   - 選項 C:擴 SSOT 納入新 branch(例如兩 host 分類)
   - **我的建議**:{choice}

### 原則本身有疑
1. **{spec:line}** 聲稱 {claim} 但世界級對照 {evidence}
   - 是否修?

### 命名決策
1. **{prop value collision}** → 建議改名 {X → Y}

## Self-improvement capture(每次 audit 結束寫)
- 新發現的 FP pattern:{描述},回填到 audit-prompts.md
- 新確立的 meta-pattern:{描述},回填到 CLAUDE.md Meta-Pattern 預警
- 修完的矛盾:{list},回填到 memory `project_audit_progress`
```

---

## 常見 false positive 記憶(活文件,每次 audit 回填)

**sub-agent 跑 D6 前必讀此節,避免重複過去 FP**。

### 2026-04-21 Session 已收錄 FP

- **SSOT reciprocal 以 `##` heading 為唯一格式** → FALSE。inline prose pointer「詳見 `X.spec.md`「Y」」也是合法 reciprocal。flag 前要完整 grep target spec 找 anchor 再判。
- **「缺 dark mode section」** → FALSE,若 spec 用 semantic token(`--primary` / `--fg` 等)= 自動豁免;若有 pointer 到 color.spec.md = 豁免。
- **「缺 empty state」** → FALSE,若 spec 寫「empty 由 consumer 用 <Empty>」= 豁免。
- **「anatomy 缺 Inspector」** → 2026-04-21 revert applicable-where-meaningful → 改回 strict-by-default。但確實 props < 2 的(Separator / Skeleton / CircularProgress)有 hard rationale 豁免。
- **「ARIA / tabIndex 不對」** → FALSE,若 wrap Radix primitive(Radix 處理)= 豁免。grep import 確認。
- **「7-dim 覆蓋不足」** → 多數是 scope default 豁免(Field family pointer / Internal / wrapper),flag 前驗 scope default。

### 回填格式

每次 audit 結束,若 sub-agent 回報「某 finding 經驗證為 FP」→ main agent 在此節追加一行:
`- **{FP pattern}** → FALSE,{豁免條件}`

---

## Integration — 哪個 skill 在哪個 phase 跑 D6

| Skill | Phase | Scope |
|-------|-------|-------|
| `/design-system-audit` --deep | Phase 3.5d | D6 全 4 子維,全 DS scope(真 scan 而非 triage) |
| `/design-system-audit` --changed | Phase 3.5d | D6b(一致性)+ D6c(無矛盾)scope to changed files |
| `/component-quality-gate` | Phase 4.5(6 維內) | D6 scoped to 該元件 + 跨 spec pointer 涵及的 kin |
| `/prototype` | Phase 3.5d | D6 scoped to exploration code 是否牴觸 DS 原則 |
| `/product-ui-audit` | new dim(增) | D6 scoped to consumer code(檢查是否誤用 DS canonical) |

### 使用公式(每個 skill 的 Phase 對應段落)

skill 只需寫:
```
Phase X — D6 設計原則自檢:chain `principle-audit-protocol.md`
scope: {all / component:X / consumer_code_path}
```

skill 不再重複 scan 方法 / 判斷表。

---

## 自我升級機制(Claude Code 最佳實務)

本 protocol 設計為**活文件**:每次 audit 結束,main agent 自動回填:

1. **新 false positive 發現** → 加到上方「常見 FP 記憶」
2. **新 meta-pattern 確立** → 提議加到 CLAUDE.md `# Meta-Pattern 預警`
3. **新 canonical SSOT 擴張**(例:Inline Action colored host 2026-04-21) → 提議加到對應 pattern spec
4. **User 糾正的錯誤類型** → memory 寫 feedback anchor

每個 audit skill 的 Phase F(final report)結尾**強制**「Self-improvement capture」step:main agent 寫下「這次 audit 學到什麼」。無新 learning → 該 step 寫 "無新 pattern"。

**目標**:隨時間推移,FP 記憶長大 / meta-pattern 完善 / canonical 更精準 — 不再靠 user 人工抓漏。
