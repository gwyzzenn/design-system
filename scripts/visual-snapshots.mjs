#!/usr/bin/env node
/**
 * Visual snapshots — Playwright-driven screenshot capture for design system.
 *
 * 目的:
 *   1. 觸發 Storybook dev server,逐一載入關鍵 stories,截圖到 `snapshots/` 目錄
 *   2. 產出的 PNG 可:(a) 給 /visual-audit skill 做 pixel 稽核 (b) 送 AI 比對 (c) 未來接 Chromatic / visual regression
 *
 * 為什麼不跑 build-storybook static:
 *   Storybook static build 可用,但 dev server 載入更快且支援 HMR,對 one-shot snapshot OK
 *
 * 使用:
 *   # 在另一個 terminal 先跑 storybook
 *   npm run storybook
 *
 *   # 然後在 snapshot terminal
 *   node scripts/visual-snapshots.mjs
 *
 *   # 或一行搞定(啟動 + snapshot + 關閉)
 *   node scripts/visual-snapshots.mjs --auto-start
 *
 * 依賴:playwright(已在 devDependencies)
 */

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const OUT_DIR = join(PROJECT_ROOT, 'snapshots')
const STORYBOOK_URL = 'http://localhost:6006'

// 關鍵 stories 清單(user 列的 7 場景 + 本 session 新/改的元件 critical views)
// slug 對應 Storybook URL iframe ?id=<path>
const SCENARIOS = [
  // DatePicker 四邊對稱 / 點擊互動
  { id: 'design-system-components-datepicker-展示--basic', file: 'datepicker-basic.png' },
  { id: 'design-system-components-datepicker-展示--range-picker', file: 'datepicker-range.png' },

  // Calendar(event view,新)
  { id: 'design-system-components-calendar-展示--團隊行事曆', file: 'calendar-event-team.png' },
  { id: 'design-system-components-calendar-展示--空行事曆', file: 'calendar-event-empty.png' },

  // TimePicker 新元件
  { id: 'design-system-components-timepicker-展示--會議時段', file: 'timepicker-meeting.png' },
  { id: 'design-system-components-timepicker-展示--店家營業時間', file: 'timepicker-shop-hours.png' },

  // FileViewer toolbar
  { id: 'design-system-components-fileviewer-展示--default', file: 'fileviewer-default.png' },

  // Badge overlay 規則(on iconOnly Button)
  { id: 'design-system-components-badge-設計原則--ruleoverlayiconanchoronly', file: 'badge-overlay-iconanchor.png' },

  // DescriptionList horizontal divided 間距
  { id: 'design-system-components-descriptionlist-設計規格--horizontal-variants', file: 'description-list-horizontal.png' },

  // Carousel 箭頭不覆蓋文字
  { id: 'design-system-components-carousel-展示--default', file: 'carousel-default.png' },

  // Rating 去邊框 + field size 對齊
  { id: 'design-system-components-rating-展示--default', file: 'rating-default.png' },

  // Coachmark 多步驟 tips header
  { id: 'design-system-components-coachmark-展示--tipsmultistep', file: 'coachmark-tips-multistep.png' },
]

async function ensureOutDir() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })
}

async function waitForStorybook(url, maxWaitMs = 60_000) {
  const start = Date.now()
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url + '/iframe.html')
      if (res.ok) return true
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

async function snapshot(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // retina quality
  })
  const page = await context.newPage()
  const url = `${STORYBOOK_URL}/iframe.html?id=${scenario.id}&viewMode=story`

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    // Wait for potential animations / font load
    await page.waitForTimeout(500)
    await page.screenshot({
      path: join(OUT_DIR, scenario.file),
      fullPage: false,
    })
    console.log(`  ✓ ${scenario.file}`)
  } catch (err) {
    console.error(`  ✗ ${scenario.file} —`, err.message)
  } finally {
    await context.close()
  }
}

async function main() {
  await ensureOutDir()

  const autoStart = process.argv.includes('--auto-start')
  let storybookProc = null

  if (autoStart) {
    console.log('啟動 Storybook dev server...')
    storybookProc = spawn('npm', ['run', 'storybook', '--', '--ci'], {
      cwd: PROJECT_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    storybookProc.stdout.on('data', () => {}) // silent

    const ready = await waitForStorybook(STORYBOOK_URL)
    if (!ready) {
      console.error('Storybook 啟動超時(>60s)')
      storybookProc.kill()
      process.exit(1)
    }
  } else {
    const ready = await waitForStorybook(STORYBOOK_URL, 5_000)
    if (!ready) {
      console.error(
        `Storybook 未運行(${STORYBOOK_URL})。請先 \`npm run storybook\` 或加 --auto-start`
      )
      process.exit(1)
    }
  }

  console.log(`截圖 ${SCENARIOS.length} 個場景到 ${OUT_DIR}...`)
  const browser = await chromium.launch({ headless: true })

  for (const scenario of SCENARIOS) {
    await snapshot(browser, scenario)
  }

  await browser.close()

  // 產出一個 manifest 方便 /visual-audit 讀
  const manifest = {
    generatedAt: new Date().toISOString(),
    snapshots: SCENARIOS.map((s) => ({ id: s.id, file: s.file })),
  }
  await writeFile(
    join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )
  console.log(`\n完成。Manifest: ${join(OUT_DIR, 'manifest.json')}`)

  if (storybookProc) {
    storybookProc.kill()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
