#!/usr/bin/env node
// Periodic content-quality audit for Storybook stories.
// Catches drift that write-time hooks miss — runs across ALL files, not single edit.
//
// Modes:
//   --check : report violations(exit 1 if any)
//   --fix   : auto-fix mechanical drift(numbering),report content-judgement issues
//
// Detects:
//   1. Anatomy stories with extras lacking number prefix(violates anatomy-standard.md)
//   2. Principles cross-references in plain text without LinkTo(對照X頁 / 見X / 跳X)
//   3. Auto-generated stub patterns(`<X> 場景` CamelCase split without real content)
//   4. Missing `name:` zh-CN on stories(showcase / principles)
//
// Usage from Stop hook: `node scripts/audit-content-quality.mjs --check` (silent if OK, warn if drift).

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const COMPONENTS_DIR = 'src/design-system/components';
const fix = process.argv.includes('--fix');

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (p.endsWith('.stories.tsx')) yield p;
  }
}

const violations = {
  numbering: [],          // anatomy extras 缺 number
  nonAnatomyNumbering: [], // showcase/principles 不該有 numbering
  linkTo: [],
  stub: [],
  missingName: [],
  placeholderContent: [],  // Option A/B/C / Lorem / 抽象代號
  emptyStory: [],          // story render returns empty
};
let autoFixed = 0;

for (const file of walk(COMPONENTS_DIR)) {
  const isAnatomy = file.endsWith('.anatomy.stories.tsx');
  const isPrinciples = file.endsWith('.principles.stories.tsx');
  let content = readFileSync(file, 'utf-8');
  let modified = false;

  // === Check 1: Anatomy numbering(extras 必須繼續編 6,7,...)===
  if (isAnatomy) {
    const lines = content.split('\n');
    const nameMatches = [];
    let maxNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/name:\s*['"]([^'"]+)['"]/);
      if (m) {
        const num = m[1].match(/^(\d+)\.\s*/);
        if (num) maxNum = Math.max(maxNum, parseInt(num[1]));
        nameMatches.push({ idx: i, name: m[1], num: num ? parseInt(num[1]) : null });
      }
    }
    if (maxNum > 0) {
      let next = maxNum + 1;
      for (const nm of nameMatches) {
        if (nm.num === null) {
          if (fix) {
            const newName = `${next}. ${nm.name}`;
            lines[nm.idx] = lines[nm.idx].replace(/(name:\s*['"])([^'"]+)(['"])/, `$1${newName}$3`);
            next++;
            modified = true;
            autoFixed++;
          } else {
            violations.numbering.push({ file: basename(file), name: nm.name });
          }
        }
      }
      if (modified) content = lines.join('\n');
    }
  }

  // === Check 2: Cross-reference plain text without LinkTo(only principles)===
  if (isPrinciples) {
    const linkToImported = /from\s+['"]@storybook\/addon-links/.test(content);
    const refPatterns = [
      /對照「展示」頁/g,
      /對照展示頁/g,
      /見「展示」/g,
      /見\s*Vs\*Rule/g,
      /跳到展示頁/g,
    ];
    let refCount = 0;
    for (const re of refPatterns) {
      const m = content.match(re);
      if (m) refCount += m.length;
    }
    if (refCount > 0 && !linkToImported) {
      violations.linkTo.push({ file: basename(file), refs: refCount });
    }
  }

  // === Check 3: Auto-generated stub pattern detection(showcase / principles)===
  // Signature: list items with CamelCase split format like「Foo Bar 場景」
  const stubPattern = /<li>\s*<strong>([A-Z]\w+)<\/strong>\s*—\s*\1\s*場景/g;
  const stubs = [...content.matchAll(stubPattern)];
  if (stubs.length > 0) {
    violations.stub.push({ file: basename(file), count: stubs.length });
  }

  // === Check 4a: Numbering in non-anatomy(violation — only anatomy uses numbering)===
  if (!isAnatomy) {
    const numberedNames = [...content.matchAll(/name:\s*['"](\d+\.\s*[^'"]+)['"]/g)];
    if (numberedNames.length > 0) {
      violations.nonAnatomyNumbering.push({
        file: basename(file),
        names: numberedNames.slice(0, 5).map(m => m[1])
      });
    }
  }

  // === Check 4b: Placeholder / abstract content(forbidden per CLAUDE.md `# Story`)===
  // Strip comments first(/* */ + // + leading * lines)to avoid false positives
  // when rules are *referenced* in comments.
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')        // /* ... */
    .replace(/^\s*\*.*$/gm, '')              // leading * (jsdoc)
    .replace(/\/\/.*$/gm, '');               // // line comments

  const forbiddenPatterns = [
    { re: /Option\s+[A-Z](?:\s|<|"|')/g, label: 'Option A/B/C' },
    { re: /Variant\s+[A-Z](?:\s|<|"|')/g, label: 'Variant X' },
    { re: /\bLorem ipsum/gi, label: 'Lorem ipsum' },
    { re: /\bfoo\s*bar\b/gi, label: 'foo bar' },
    { re: /按鈕[一二三四五]/g, label: '按鈕一/二/三' },
  ];
  for (const { re, label } of forbiddenPatterns) {
    const matches = stripped.match(re);
    if (matches && matches.length > 0) {
      violations.placeholderContent.push({ file: basename(file), label, count: matches.length });
    }
  }

  // === Check 4c: Empty story render(無 visible JSX)===
  if (!isAnatomy) {
    const renderEmpty = /render:\s*\(\s*\)\s*=>\s*\(\s*<\s*(div|>)\s*\/>\s*\)/g;
    if (renderEmpty.test(content)) {
      violations.emptyStory.push({ file: basename(file) });
    }
  }

  // === Check 5: Missing `name:` zh-CN(showcase + principles)===
  if (!isAnatomy) {
    const exportMatches = [...content.matchAll(/^export const ([A-Z]\w+)(?:\s*:\s*Story)?\s*=\s*\{/gm)];
    let missingNames = 0;
    for (const m of exportMatches) {
      // Check if this export has a name: 跟在後面 ~10 lines 內
      const startIdx = m.index;
      const slice = content.slice(startIdx, startIdx + 800);
      if (!/name:\s*['"]/.test(slice)) {
        missingNames++;
      }
    }
    if (missingNames > 0) {
      violations.missingName.push({ file: basename(file), count: missingNames });
    }
  }

  if (modified) writeFileSync(file, content);
}

const totalViolations = violations.numbering.length + violations.nonAnatomyNumbering.length + violations.linkTo.length + violations.stub.length + violations.missingName.length + violations.placeholderContent.length + violations.emptyStory.length;

console.log('=== Content quality audit ===\n');
console.log(`Mode: ${fix ? 'fix' : 'check'}`);
if (autoFixed > 0) console.log(`Auto-fixed: ${autoFixed} numbering drift`);

if (violations.numbering.length > 0) {
  console.log(`\n[P1] Anatomy numbering missing: ${violations.numbering.length}`);
  violations.numbering.slice(0, 10).forEach(v => console.log(`  • ${v.file}: "${v.name}"`));
}

if (violations.nonAnatomyNumbering.length > 0) {
  console.log(`\n[P0] Non-anatomy stories with numbering(only anatomy uses numbers): ${violations.nonAnatomyNumbering.length} files`);
  violations.nonAnatomyNumbering.slice(0, 10).forEach(v => console.log(`  • ${v.file}: ${v.names.join(', ')}`));
}

if (violations.placeholderContent.length > 0) {
  console.log(`\n[P0] Placeholder / abstract content(forbidden per CLAUDE.md # Story): ${violations.placeholderContent.length}`);
  violations.placeholderContent.slice(0, 10).forEach(v => console.log(`  • ${v.file}: ${v.count}× "${v.label}"`));
}

if (violations.emptyStory.length > 0) {
  console.log(`\n[P0] Empty story render: ${violations.emptyStory.length}`);
  violations.emptyStory.slice(0, 10).forEach(v => console.log(`  • ${v.file}`));
}

if (violations.linkTo.length > 0) {
  console.log(`\n[P1] Cross-ref plain text(should use LinkTo): ${violations.linkTo.length} files`);
  violations.linkTo.slice(0, 10).forEach(v => console.log(`  • ${v.file}: ${v.refs} refs`));
}

if (violations.stub.length > 0) {
  console.log(`\n[P0] Auto-generated stub pattern(non-human content): ${violations.stub.length} files`);
  violations.stub.slice(0, 10).forEach(v => console.log(`  • ${v.file}: ${v.count} stubs`));
}

if (violations.missingName.length > 0) {
  console.log(`\n[P1] Missing zh-CN name: ${violations.missingName.length} files`);
  violations.missingName.slice(0, 10).forEach(v => console.log(`  • ${v.file}: ${v.count} stories`));
}

if (totalViolations === 0) {
  console.log('\n✅ No content drift detected');
  process.exit(0);
} else {
  console.log(`\n⚠️  Total: ${totalViolations} violation(s)${fix ? ` (${autoFixed} auto-fixed)` : ''}`);
  process.exit(fix ? 0 : 1);
}
