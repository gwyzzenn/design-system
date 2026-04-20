#!/usr/bin/env node
/**
 * Google Drive sync 會偶發刪掉 `node_modules/lucide-react/dist/esm/Icon.js`
 * (createLucideIcon + DynamicIcon 都在,唯獨這個 Icon.js 被針對性刪)。
 * 沒有它 → build 掛 / storybook 起不來。
 *
 * 長期正解:把 node_modules 移出 Google Drive 同步範圍(symlink 或整個 repo 外移)。
 * 短期兜底:這支 postinstall script 檢查檔案存在,不在就寫回 lucide-react v0.577+ 的
 * canonical Icon.js 內容(從 GitHub source 重建)。
 *
 * 觸發:package.json scripts.postinstall — 每次 `npm install` 後自動跑。
 */
import { existsSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const target = join(__dirname, '..', 'node_modules', 'lucide-react', 'dist', 'esm', 'Icon.js')

const canonicalContent = `/**
 * @license lucide-react v0.577.0 - ISC
 * EMERGENCY REGENERATED via scripts/ensure-lucide-icon.mjs postinstall hook.
 * Original content reconstructed from lucide-react GitHub source.
 * Root cause: Google Drive sync deletes this file; long-term fix is to move
 * node_modules outside Drive sync path.
 */

import { forwardRef, createElement } from 'react';
import defaultAttributes from './defaultAttributes.js';
import { mergeClasses } from './shared/src/utils/mergeClasses.js';

const Icon = forwardRef(
  (
    {
      color = 'currentColor',
      size = 24,
      strokeWidth = 2,
      absoluteStrokeWidth,
      className = '',
      children,
      iconNode,
      ...rest
    },
    ref,
  ) =>
    createElement(
      'svg',
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth,
        className: mergeClasses('lucide', className),
        ...rest,
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...(Array.isArray(children) ? children : [children]),
      ].filter(Boolean),
    ),
);

Icon.displayName = 'Icon';

export { Icon as default };
`

if (!existsSync(target)) {
  writeFileSync(target, canonicalContent)
  console.log('[ensure-lucide-icon] Icon.js was missing — regenerated.')
} else if (statSync(target).size === 0) {
  // Drive sometimes writes 0-byte shadow file instead of deleting
  writeFileSync(target, canonicalContent)
  console.log('[ensure-lucide-icon] Icon.js was 0 bytes — regenerated.')
}
