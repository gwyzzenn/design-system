#!/usr/bin/env node
// check-field-cascade-resolve.mjs — 機械防複發:Field 控件必經 resolver hook 解析 cascade(size / mode / disabled)
//
// 2026-06-08(取代舊 check-field-size-resolve.mjs,擴 size → size+mode+disabled cascade SSOT):
//   size B 組 + mode/disabled cascade bug = **同一根因**：控件各自手刻 fieldCtx 解析、precedence 不一、漏接 channel。
//     - picker(Select/Combobox/DatePicker/TimePicker)`resolvedMode = disabled ? 'disabled' : mode`,**不讀 fieldCtx.mode**
//       → <Field mode="display"> 失效。
//     - PeoplePicker/Switch/Rating/Slider/Avatar 只讀 fieldCtx.mode==='disabled'(或全不讀)→ <Field disabled> 失效
//       (因 <Field disabled> 設 ctx.disabled=true 但 ctx.mode 仍 'edit')。
//   根治後全控件改用 field-context.ts 的 useResolvedFieldSize / useResolvedFieldMode / useResolvedFieldDisabled SSOT。
//
// 本 gate(ci + release:preflight,deterministic source grep,無 build 依賴):
//   Check 1:import fieldWrapperStyles 的控件(= 吃 Field size→font/height + mode→chrome 契約者)
//           必用 useResolvedFieldSize + useResolvedFieldMode(mode helper 內部已 cascade disabled,故 disabled channel 同涵蓋)。
//   Check 2a:任何控件散落直讀 `fieldCtx?.size` → fail(size SSOT,broad)。
//   Check 2b:fieldWrapperStyles 控件散落直讀 `fieldCtx?.(mode|disabled)` → fail(input-class 必走 resolver hook)。
//           注:SegmentedControl/RadioGroup 等 own-chrome 控件**不** import fieldWrapperStyles → 不在此 scope;
//           其 `fieldCtx?.disabled` 直讀為正確 cascade(`disabled || !!fieldCtx?.disabled` / `?? fieldCtx?.disabled ?? false`),豁免。

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMPONENTS = join(__dirname, '..', 'packages/design-system/src/components')

function walk(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const fp = join(dir, e)
    if (statSync(fp).isDirectory()) out.push(...walk(fp))
    else if (e.endsWith('.tsx') && !e.includes('.stories.') && !e.endsWith('.test.tsx')) out.push(fp)
  }
  return out
}

const FIELD_STYLE_IMPORT = /(fieldWrapperStyles|bareInputStyles)/
const v1 = []            // Check 1：缺 resolver hook
const scatteredSize = [] // Check 2a：散落 fieldCtx.size
const scatteredCascade = [] // Check 2b：散落 fieldCtx.mode/disabled(fieldWrapperStyles 控件)
let checked = 0

for (const f of walk(COMPONENTS)) {
  if (f.includes('/Field/')) continue // Field 基建本身豁免(resolver hook 內部本就讀 fieldCtx)
  const s = readFileSync(f, 'utf8')
  const rel = f.replace(/.*packages\/design-system\/src\//, 'src/')
  const importsWrapper =
    /from '@\/design-system\/components\/Field\/field-wrapper'/.test(s) && FIELD_STYLE_IMPORT.test(s)

  // ── Check 1 ──
  if (importsWrapper) {
    checked++
    const missing = []
    if (!/useResolvedFieldSize/.test(s)) missing.push('useResolvedFieldSize')
    if (!/useResolvedFieldMode/.test(s)) missing.push('useResolvedFieldMode')
    if (missing.length) v1.push(`${rel}: 缺 ${missing.join(' + ')}`)
  }

  // ── Check 2(逐行剝行尾註解後比對,避免 SSOT 註解內 prose 的「fieldCtx.mode」誤判)──
  let hitSize = false
  let hitCascade = false
  for (const rawLine of s.split('\n')) {
    const code = rawLine.replace(/\/\/.*$/, '') // 去行尾(含整行)// 註解
    if (!hitSize && /fieldCtx\??\.size/.test(code)) {
      scatteredSize.push(`${rel}: ${rawLine.trim().slice(0, 80)}`)
      hitSize = true
    }
    if (importsWrapper && !hitCascade && /fieldCtx\??\.(mode|disabled)\b/.test(code)) {
      scatteredCascade.push(`${rel}: ${rawLine.trim().slice(0, 80)}`)
      hitCascade = true
    }
  }
}

if (v1.length || scatteredSize.length || scatteredCascade.length) {
  if (v1.length) {
    console.error(`❌ Field 控件缺 resolver hook(size/mode 不會隨 <Field size>/<Field mode>/<Field disabled>/cell surface 流動):`)
    v1.forEach((x) => console.error(`   - ${x}`))
  }
  if (scatteredSize.length) {
    console.error(`❌ 散落直讀 fieldCtx.size(應走 useResolvedFieldSize SSOT):`)
    scatteredSize.forEach((x) => console.error(`   - ${x}`))
  }
  if (scatteredCascade.length) {
    console.error(`❌ fieldWrapperStyles 控件散落直讀 fieldCtx.mode/disabled(應走 useResolvedFieldMode/useResolvedFieldDisabled SSOT):`)
    scatteredCascade.forEach((x) => console.error(`   - ${x}`))
  }
  console.error(`\n   修:改用 field-context.ts 的 useResolvedFieldSize / useResolvedFieldMode({ mode, disabled, readOnly }) / useResolvedFieldDisabled(prop)。`)
  console.error(`   SSOT:components/Field/field-context.ts + field-controls.spec.md「Field context cascade — SSOT」。`)
  process.exit(1)
}
console.log(`✓ Field cascade-resolve gate:${checked} 個 fieldWrapperStyles 控件全經 useResolvedFieldSize + useResolvedFieldMode；0 散落 fieldCtx.size/mode/disabled(cascade SSOT 統一)`)
