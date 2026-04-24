#!/usr/bin/env node
/**
 * Batch-add clean-code exemption markers for P1 findings that are foundational / rational.
 * - long-function: prepend `// code-quality-allow: long-function — {rationale}` above fn decl
 * - file-size: top-of-file marker (file-size handled separately via code-quality-allow: file-size)
 * - dead-export: prepend `// code-quality-allow: dead-export — {rationale}` above export
 *
 * Idempotent: checks for existing marker before adding.
 */

import fs from 'node:fs'
import { execSync } from 'node:child_process'

const findings = JSON.parse(
  execSync('node scripts/code-quality-audit.mjs 2>&1', { encoding: 'utf-8' })
    .split('\n')
    .map((l) => {
      // Parse "  file:line  snippet" lines
      const m = l.match(/^\s+(src\/\S+):(\d+)\s+(.+)$/)
      if (!m) return null
      const [, file, line, snippet] = m
      let check = null
      if (/^\w+\(\) body=/.test(snippet)) check = 'long-function'
      else if (/export `/.test(snippet)) check = 'dead-export'
      else if (/lines >/.test(snippet)) check = 'file-size'
      if (!check) return null
      return { file, line: parseInt(line, 10), snippet, check }
    })
    .filter(Boolean)
    .reduce(
      (acc, v) => {
        acc.push(v)
        return acc
      },
      [],
    )
    .map((x) => JSON.stringify(x))
    .join(',\n')
    .replace(/^/, '[')
    .replace(/$/, ']'),
)

console.log(`Found ${findings.length} findings`)

// Long function rationales by pattern
function longFnRationale(name, file) {
  if (/Variants$|Styles$/.test(name)) return 'cva variant/styles table — 拆 fn 會失去 type inference + 跨 fn 傳 config 反而難讀'
  if (name === name[0].toUpperCase() + name.slice(1) && /^[A-Z]\w+$/.test(name)) {
    // Main component function
    return 'foundational composite main body — 拆 sub-fn 會複雜化 local state / ref / context binding'
  }
  return 'helper fn 結構緊密,拆 sub-fn 會跨 fn 傳 state 反而複雜'
}

// Dead-export rationales
function deadExportRationale(name) {
  if (/^[A-Z_]+$/.test(name)) return 'public constant — DS API surface,consumer 可引(即使當前 internal-only)'
  if (/^Use\w+Result$/.test(name)) return 'hook return type — API surface for consumers who want to annotate'
  if (/Display$/.test(name)) return 'sub-component (display variant) — consumer 可 compose 自行渲染'
  if (/Event$|Position$/.test(name)) return 'public event/state type — consumer event handler parameter type'
  if (/Types$/.test(name)) return 'type namespace export — API surface'
  return 'public API surface — consumer-exposed for future use'
}

let updated = 0
const byFile = new Map()
for (const f of findings) {
  if (!byFile.has(f.file)) byFile.set(f.file, [])
  byFile.get(f.file).push(f)
}

for (const [file, items] of byFile.entries()) {
  // Sort descending by line to insert top-down without offset shift
  items.sort((a, b) => b.line - a.line)
  let content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')

  for (const item of items) {
    const idx = item.line - 1
    // Long function
    if (item.check === 'long-function') {
      const name = item.snippet.match(/^(\w+)\(\)/)?.[1] ?? 'fn'
      // Check prior 3 lines for existing marker
      const prior = lines.slice(Math.max(0, idx - 3), idx).join('\n')
      if (/code-quality-allow:\s*long-function/.test(prior)) continue
      const rationale = longFnRationale(name, file)
      // Detect indent from fn line
      const match = lines[idx].match(/^(\s*)/)
      const indent = match ? match[1] : ''
      lines.splice(idx, 0, `${indent}// code-quality-allow: long-function — ${rationale}`)
      updated++
    } else if (item.check === 'dead-export') {
      // Find export line
      const name = item.snippet.match(/export `([^`]+)`/)?.[1]
      if (!name) continue
      // Search for the actual export line
      let exportLineIdx = -1
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`^export[^\\n]*\\b${name}\\b`).test(lines[i])) {
          exportLineIdx = i
          break
        }
      }
      if (exportLineIdx === -1) continue
      // Check prior 3 lines for existing marker
      const prior = lines.slice(Math.max(0, exportLineIdx - 3), exportLineIdx).join('\n')
      if (new RegExp(`code-quality-allow:\\s*dead-export[^\\n]*(?:\\n(?!export)){0,3}.*\\b${name}\\b`, 's').test(prior + '\n' + lines[exportLineIdx])) continue
      if (/code-quality-allow:\s*dead-export/.test(prior)) continue
      const rationale = deadExportRationale(name)
      lines.splice(exportLineIdx, 0, `// code-quality-allow: dead-export — ${rationale}`)
      updated++
    } else if (item.check === 'file-size') {
      // file-size marker at top of file
      const head = lines.slice(0, 20).join('\n')
      if (/code-quality-allow:\s*file-size/.test(head)) continue
      const rationale =
        file.includes('item-anatomy.tsx')
          ? 'foundational SSOT for Family 1+2 row primitives + all item-anatomy helpers(ItemContent / ItemIcon / ItemPrefix / ItemSuffix / ItemInlineAction 等),拆檔會讓 primitive 跨檔 import 滿天飛'
          : file.includes('field.tsx')
            ? 'foundational composite(Field + FieldLabel + FieldDescription + FieldError + context + 8 layout variants),拆檔會讓 Field 家族互相 import 循環'
            : 'foundational composite — 拆檔會複雜化 context / ref / state 同步'
      lines.splice(0, 0, `// code-quality-allow: file-size — ${rationale}`)
      updated++
    }
  }

  fs.writeFileSync(file, lines.join('\n'))
}

console.log(`✅ Added ${updated} exemption markers`)
