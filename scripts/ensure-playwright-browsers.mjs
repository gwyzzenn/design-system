#!/usr/bin/env node
/**
 * ensure-playwright-browsers — 裝完 node_modules 後自動確保 Chromium binary 已下載。
 * postinstall 呼叫,idempotent(已存在則 skip)。
 *
 * 為什麼放 postinstall:
 *   Playwright npm package 只裝 lib,chromium binary 需另走 `playwright install chromium`。
 *   沒這步 `npm run visual-audit` 會報「Executable doesn't exist」。
 *   postinstall 自動處理,developer `npm install` 一次就 ready。
 *
 * 跳過條件:
 *   - CI 環境且 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1(用戶自管)
 *   - 無 playwright(尚未裝 devDep,第一次 npm install 可能在 postinstall 就執行,但 playwright 已 resolved)
 *
 * Sandbox fallback(2026-05-01 加,offline / restricted 環境):
 *   若 cache 有 chromium 但版本不符 Playwright lib 期待版本(常見:envs 有舊 cache + lib 升級),
 *   嘗試 symlink 既有 binary 到期待路徑,避免重新 download(sandbox 沒網路時 download 會 403)。
 */

import { existsSync, mkdirSync, symlinkSync, readdirSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import os from 'node:os'
import { join } from 'node:path'

if (process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1') {
  console.log('[ensure-playwright-browsers] SKIP via env var')
  process.exit(0)
}

const require_ = createRequire(import.meta.url)
let playwrightPkg
try {
  playwrightPkg = require_('playwright/package.json')
} catch {
  // playwright 還沒裝好(第一次 `npm install` 時 postinstall 可能比 devDep link 早?安全起見 exit 0)
  console.log('[ensure-playwright-browsers] playwright not yet installed — skipping')
  process.exit(0)
}

// Chromium cache path — Playwright 1.x default
// macOS: ~/Library/Caches/ms-playwright/chromium-*
// Linux: ~/.cache/ms-playwright/chromium-*(本機)/  /opt/pw-browsers/chromium-*(sandbox)
// Win:   %USERPROFILE%\AppData\Local\ms-playwright\chromium-*
const cacheDir =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  (process.platform === 'darwin'
    ? join(os.homedir(), 'Library/Caches/ms-playwright')
    : process.platform === 'win32'
      ? join(process.env.LOCALAPPDATA || '', 'ms-playwright')
      : existsSync('/opt/pw-browsers') // sandbox env first
        ? '/opt/pw-browsers'
        : join(os.homedir(), '.cache/ms-playwright'))

// 取 Playwright lib 期待的 chromium-headless-shell 版本(從 package.json browsers 欄位 OR fallback 1217)
// Playwright lib 內部硬編 BUILD 號;簡化策略:讀 cache 找出最新版,期待版 = 跟 lib 版本對應
// 若 lib v1.59 對應 build 1217,但 cache 只有 1194,需 symlink 1217 → 1194 才能 launch。
function detectExpectedBuild() {
  // Playwright stores per-browser build IDs in playwright-core/browsers.json
  // (路徑不在 package.json exports,直接 fs.readFileSync 繞過 resolver)
  try {
    const corePkgPath = require_.resolve('playwright-core/package.json')
    const browsersJsonPath = join(corePkgPath, '..', 'browsers.json')
    if (!existsSync(browsersJsonPath)) return null
    const browsersJson = JSON.parse(readFileSync(browsersJsonPath, 'utf8'))
    const headlessShell = browsersJson.browsers?.find?.((b) => b.name === 'chromium-headless-shell')
    if (headlessShell?.revision) return headlessShell.revision
  } catch {}
  return null
}

if (existsSync(cacheDir)) {
  const entries = readdirSync(cacheDir).filter((n) => n.startsWith('chromium'))
  if (entries.length > 0) {
    // 嘗試 sandbox fallback symlink — 若期待版 binary 缺,但有舊版 binary,symlink 救援
    const expected = detectExpectedBuild()
    if (expected) {
      const expectedHeadlessDir = join(cacheDir, `chromium_headless_shell-${expected}`, 'chrome-headless-shell-linux64')
      const expectedHeadlessBin = join(expectedHeadlessDir, 'chrome-headless-shell')
      if (!existsSync(expectedHeadlessBin)) {
        // 找 cache 內**任一**現有 headless_shell binary
        const fallbackDirs = entries
          .filter((n) => n.startsWith('chromium_headless_shell-'))
          .map((n) => ({ name: n, build: parseInt(n.split('-')[1] || '0', 10) }))
          .sort((a, b) => b.build - a.build) // newest first
        for (const f of fallbackDirs) {
          // Layout v1(舊):chrome-linux/headless_shell
          // Layout v2(新):chrome-headless-shell-linux64/chrome-headless-shell
          const v1 = join(cacheDir, f.name, 'chrome-linux', 'headless_shell')
          const v2 = join(cacheDir, f.name, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
          const realBin = existsSync(v2) ? v2 : (existsSync(v1) ? v1 : null)
          if (realBin) {
            try {
              mkdirSync(expectedHeadlessDir, { recursive: true })
              symlinkSync(realBin, expectedHeadlessBin)
              console.log(`[ensure-playwright-browsers] OK (symlink fallback: expected v${expected} → cache v${f.build})`)
              process.exit(0)
            } catch (err) {
              // permission or already exists race — fall through
              if (err?.code === 'EEXIST' && existsSync(expectedHeadlessBin)) {
                console.log(`[ensure-playwright-browsers] OK (existing symlink for v${expected})`)
                process.exit(0)
              }
              console.warn(`[ensure-playwright-browsers] symlink fallback failed:`, err?.message)
              break
            }
          }
        }
      }
    }
    console.log(`[ensure-playwright-browsers] OK (${entries.length} chromium variant in cache)`)
    process.exit(0)
  }
}

console.log(`[ensure-playwright-browsers] 下載 chromium(playwright v${playwrightPkg.version})...`)
const res = spawnSync('npx', ['playwright', 'install', 'chromium'], {
  stdio: 'inherit',
})
process.exit(res.status ?? 1)
