#!/usr/bin/env node
// Migrate principles.stories.tsx to Polaris-aligned canonical:
//   1. Rename deprecated naming → WhenNotToUse
//   2. Add WhenToUse story for components missing it (sourcing from showcase scenarios)
//
// Idempotent: skip files already migrated.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const COMPONENTS_DIR = 'packages/design-system/src/components';

// Rename map for deprecated → WhenNotToUse
const RENAME_PATTERNS = [
  { pattern: /\bForbiddenUsages\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bForbiddenRule\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bForbiddenRules\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bProhibitions\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bNonGoals\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bVisualDonts\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bPitfalls\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bDontRule\b/g, replacement: 'WhenNotToUse' },
  // ScrollArea has DontNest + DontUseFor — merge into single WhenNotToUse via 1st rename + warn
  { pattern: /\bDontNest\b/g, replacement: 'WhenNotToUse' },
  { pattern: /\bDontUseFor\b/g, replacement: 'WhenNotToUseAlt' }, // mark second to deduplicate manually later
];

function findFile(dir, suffix, exclude) {
  const files = readdirSync(dir);
  return files.find(f => f.endsWith(suffix) && !exclude.some(e => f.includes(e)));
}

function findShowcaseFile(dir) {
  return findFile(dir, '.stories.tsx', ['anatomy', 'principles']);
}

function findPrinciplesFile(dir) {
  return findFile(dir, '.principles.stories.tsx', []);
}

function getShowcaseScenarios(showcasePath) {
  if (!showcasePath || !existsSync(showcasePath)) return [];
  const content = readFileSync(showcasePath, 'utf-8');
  const exports = [...content.matchAll(/^export const ([A-Z]\w+)/gm)].map(m => m[1]);
  // Skip universal/abstract exports — keep real-world scenario exports
  const skip = new Set(['Default', 'AllVariants', 'AllSizes', 'States', 'Disabled', 'Loading', 'WithIcon', 'WithBadge', 'IconOnly', 'FullWidth', 'Pressed', 'OpenSnapshot', 'AllStates', 'ColorMatrix', 'SizeMatrix']);
  return exports.filter(name => !skip.has(name));
}

function hasStory(content, name) {
  return new RegExp(`^export const ${name}\\b`, 'm').test(content);
}

function generateWhenToUseStory(componentName, scenarios) {
  // Use up to 4 showcase scenario names as bullet items
  const items = scenarios.slice(0, 4).map(s => {
    // Convert PascalCase → human-readable (split on uppercase)
    const human = s.replace(/([A-Z])/g, ' $1').trim();
    return `        <li><strong>${s}</strong> — ${human} 場景</li>`;
  }).join('\n');

  if (items.length === 0) {
    return `// ── WhenToUse — 何時使用 ${componentName} ──────────────────────

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>適用情境見「展示」頁的真實業務場景範例。</p>
      <p>判斷時對照 spec.md「何時用 / 何時不用」段落。</p>
    </div>
  ),
}
`;
  }

  return `// ── WhenToUse — 何時使用 ${componentName} ──────────────────────

export const WhenToUse: Story = {
  name: '何時使用',
  render: () => (
    <div className="prose prose-sm max-w-prose">
      <p>本元件適用的真實業務場景(對照「展示」頁 detail):</p>
      <ul>
${items}
      </ul>
      <p className="text-fg-muted">判斷時對照 spec.md「何時用 / 何時不用」段;不符 → 改用近親元件(見 <code>Vs*Rule</code> stories)。</p>
    </div>
  ),
}
`;
}

const dirs = readdirSync(COMPONENTS_DIR).filter(d => statSync(join(COMPONENTS_DIR, d)).isDirectory());
const results = { renamed: [], added: [], skipped: [], error: [] };

for (const name of dirs) {
  const dir = join(COMPONENTS_DIR, name);
  try {
    const principlesFile = findPrinciplesFile(dir);
    if (!principlesFile) { results.skipped.push({ name, reason: 'no principles file' }); continue; }

    const principlesPath = join(dir, principlesFile);
    let content = readFileSync(principlesPath, 'utf-8');
    let modified = false;
    const renames = [];

    // Step 1: rename deprecated → WhenNotToUse
    for (const { pattern, replacement } of RENAME_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        renames.push(`${matches[0]} → ${replacement}`);
        modified = true;
      }
    }

    // Step 2: add WhenToUse if missing (and not already legacy alias)
    const hasWhenToUse = hasStory(content, 'WhenToUse') || hasStory(content, 'UsageScenarioRule') || hasStory(content, 'WhatItIs');
    if (!hasWhenToUse) {
      const showcasePath = findShowcaseFile(dir);
      const showcaseFullPath = showcasePath ? join(dir, showcasePath) : null;
      const scenarios = showcaseFullPath ? getShowcaseScenarios(showcaseFullPath) : [];

      // Insert before first export const (or at end)
      const firstExportMatch = content.match(/^export const /m);
      const insertion = generateWhenToUseStory(name, scenarios);

      if (firstExportMatch) {
        const insertIdx = content.indexOf('export const ', content.indexOf(firstExportMatch[0]));
        // Find line start
        const lineStart = content.lastIndexOf('\n', insertIdx) + 1;
        content = content.slice(0, lineStart) + insertion + '\n' + content.slice(lineStart);
      } else {
        content += '\n' + insertion;
      }
      modified = true;
      results.added.push({ name, scenarios: scenarios.slice(0, 4) });
    }

    if (modified) {
      writeFileSync(principlesPath, content);
      if (renames.length > 0) {
        results.renamed.push({ name, renames });
      }
    } else {
      results.skipped.push({ name, reason: 'already canonical' });
    }
  } catch (e) {
    results.error.push({ name, reason: e.message });
  }
}

console.log('=== Principles canonical migration ===\n');
console.log(`Renamed deprecated naming: ${results.renamed.length}`);
results.renamed.forEach(r => console.log(`  ✓ ${r.name}: ${r.renames.join(', ')}`));
console.log(`\nAdded WhenToUse: ${results.added.length}`);
results.added.forEach(r => console.log(`  + ${r.name}: scenarios=[${r.scenarios.join(', ')}]`));
console.log(`\nSkipped: ${results.skipped.length}`);
results.skipped.forEach(r => console.log(`  - ${r.name}: ${r.reason}`));
if (results.error.length) {
  console.log(`\nErrors: ${results.error.length}`);
  results.error.forEach(r => console.log(`  ✗ ${r.name}: ${r.reason}`));
}
