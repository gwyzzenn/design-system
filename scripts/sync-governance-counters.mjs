#!/usr/bin/env node
/**
 * sync-governance-counters.mjs — Dynamic counter source for governance metrics
 *
 * 2026-05-18 D6 codify(per autonomous batch sub-agent 3 finding + codex P0-3):
 * Hardcoded counters across CLAUDE.md / SKILL.md / hook caps / audit prompts drift.
 * This script counts actual artifacts + outputs a JSON source-of-truth for both
 * audits & docs to reference instead of hardcoded N values.
 *
 * Counts:
 *   - hooks:     `.claude/hooks/{*.sh,*.py}` excluding retired/tests/_internal
 *   - mRules:    `.claude/rules/meta-patterns.md` table rows + `## M<N>` headings
 *   - auditDims: `.claude/skills/design-system-audit/SKILL.md` numbered table rows
 *   - traits:    `*.spec.md` frontmatter `traits:` enumeration
 *
 * Output: `.claude/logs/governance-counters.json`
 *
 * Usage:
 *   node scripts/sync-governance-counters.mjs            # write log + console
 *   node scripts/sync-governance-counters.mjs --check    # exit 1 if hardcoded drift detected
 *   node scripts/sync-governance-counters.mjs --quiet    # silent unless drift
 */

import fs from 'node:fs'
import path from 'node:path'
import { globSync } from 'node:fs'

const ROOT = process.cwd()
const CHECK = process.argv.includes('--check')
const QUIET = process.argv.includes('--quiet')

// ── Counts ───────────────────────────────────────────────────────────

// 1) Hooks(對齊 session_start_governance_check.sh:168-170 邏輯)
const hookFiles = globSync('.claude/hooks/**/*.{sh,py}', { cwd: ROOT })
  .filter(f => !f.includes('/retired/'))
  .filter(f => !f.includes('/tests/'))
  .filter(f => !path.basename(f).startsWith('_'))
const hookCount = hookFiles.length

// 2) M-rules(支援 table-row + heading 兩種,對齊 audit-preflight.mjs P0-2 fix)
const metaPath = path.join(ROOT, '.claude/rules/meta-patterns.md')
const metaContent = fs.existsSync(metaPath) ? fs.readFileSync(metaPath, 'utf-8') : ''
const mRuleSet = new Set()
for (const m of metaContent.matchAll(/\|\s*\*\*M(\d+)\*\*\s*\|/g)) mRuleSet.add(parseInt(m[1]))
for (const m of metaContent.matchAll(/^##\s+M(\d+)\b/gm)) mRuleSet.add(parseInt(m[1]))
const mRules = [...mRuleSet].sort((a, b) => a - b)
const mRuleCount = mRules.length

// 3) Audit dims(讀 SKILL.md `## The N audit dimensions` table,grep numbered rows)
const skillPath = path.join(ROOT, '.claude/skills/design-system-audit/SKILL.md')
const skillContent = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf-8') : ''
const dimRows = [...skillContent.matchAll(/^\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*/gm)]
const dimNums = dimRows.map(m => parseInt(m[1]))
const dimCount = dimNums.length
const dimMin = dimNums.length ? Math.min(...dimNums) : 0
const dimMax = dimNums.length ? Math.max(...dimNums) : 0

// 4) Spec traits(frontmatter traits enumeration)
const specFiles = globSync('src/design-system/**/*.spec.md', { cwd: ROOT })
const traitSet = new Set()
for (const f of specFiles) {
  const c = fs.readFileSync(path.join(ROOT, f), 'utf-8')
  const fm = c.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!fm) continue
  const tr = fm[1].match(/traits:\s*\n((?:\s+-\s+\w+\s*\n)+)/)
  if (!tr) continue
  for (const m of tr[1].matchAll(/-\s+(\w+)/g)) traitSet.add(m[1])
}
const traitCount = traitSet.size

// ── Drift detection (against well-known hardcoded SSOT lines) ─────────
// SSOT canonical reference points(每加新 SSOT-pointer-hardcode 必加 entry):
const drifts = []

// session_start_governance_check.sh:173 hard cap
const sessStartPath = path.join(ROOT, '.claude/hooks/session_start_governance_check.sh')
if (fs.existsSync(sessStartPath)) {
  const c = fs.readFileSync(sessStartPath, 'utf-8')
  const m = c.match(/HOOK_COUNT"\s*-gt\s*(\d+)/)
  if (m) {
    const cap = parseInt(m[1])
    if (hookCount > cap) drifts.push(`session_start_governance_check.sh hard cap ${cap} < actual ${hookCount}`)
  }
}

// CLAUDE.md hooks-text (loose: extract "Hooks **N soft / M hard**")
const claudeMdPath = path.join(ROOT, 'CLAUDE.md')
if (fs.existsSync(claudeMdPath)) {
  const c = fs.readFileSync(claudeMdPath, 'utf-8')
  const m = c.match(/Hooks\s+\*\*(\d+)\s+soft\s+\/\s+(\d+)\s+hard\*\*/)
  if (m) {
    const claudeHard = parseInt(m[2])
    if (hookCount > claudeHard) drifts.push(`CLAUDE.md hard cap ${claudeHard} < actual ${hookCount}`)
  }
}

// SKILL.md "The N audit dimensions" header
const skillDimHeaderMatch = skillContent.match(/^##\s+The\s+(\d+)\s+audit\s+dimensions/m)
if (skillDimHeaderMatch) {
  const declared = parseInt(skillDimHeaderMatch[1])
  if (declared !== dimCount) drifts.push(`SKILL.md "The ${declared} audit dimensions" != actual table rows ${dimCount}`)
}

// ── Output ───────────────────────────────────────────────────────────

const report = {
  ts: new Date().toISOString(),
  counts: {
    hooks: hookCount,
    mRules: mRuleCount,
    auditDims: dimCount,
    auditDimMin: dimMin,
    auditDimMax: dimMax,
    specTraits: traitCount,
  },
  mRulesList: mRules.map(n => `M${n}`),
  hookFiles: hookFiles.sort(),
  drifts,
}

const logsDir = path.join(ROOT, '.claude/logs')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })
const outPath = path.join(logsDir, 'governance-counters.json')
fs.writeFileSync(outPath, JSON.stringify(report, null, 2))

if (!QUIET || drifts.length) {
  console.log('=== Governance Counters ===')
  console.log(`Hooks:       ${hookCount}`)
  console.log(`M-rules:     ${mRuleCount}(${report.mRulesList.join(', ')})`)
  console.log(`Audit dims:  ${dimCount}(range ${dimMin}-${dimMax})`)
  console.log(`Spec traits: ${traitCount}`)
  console.log('')
  if (drifts.length) {
    console.log('⚠️  Hardcoded drift detected:')
    drifts.forEach(d => console.log(`  - ${d}`))
  } else {
    console.log('OK no hardcoded drift detected.')
  }
  console.log('')
  console.log(`Log: ${outPath}`)
}

if (CHECK && drifts.length) process.exit(1)
process.exit(0)
