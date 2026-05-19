#!/usr/bin/env node
/**
 * Runtime verify header-canonical Dialog tabs structure(M32 pixel-quantified)。
 *
 * Verify W1-W4 真實 honored,不靠肉眼:
 *   W1: DialogHeader 自己無 border-b(`border-bottom-width = 0`);row 2 wrapper 有 border-b
 *   W2: TabsList 第一個 trigger left = DialogTitle left(都 = DialogContent left + layout-space-loose)
 *   W4: row 1 bottom = row 2 top(flush stack,gap = 0)
 *
 * 對照組:DialogHeaderDefault(無 tabs)— 確保 header 自畫 border-b。
 */

import { chromium } from 'playwright'

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? 'http://localhost:6006'

async function loadStory(page, storyId) {
  await page.goto(`${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`, { waitUntil: 'networkidle', timeout: 45_000 })
  await page.locator('button:has-text("打開")').first().click()
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
  await page.waitForTimeout(300)
}

async function probeDialogWithTabs(page) {
  return await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]')
    if (!dialog) return { error: 'no dialog' }
    const title = dialog.querySelector('[id*=":r"][id$=":-title"], h2')
    const headerRoot = title?.closest('div.flex.flex-col, div.flex.items-center')
    const tabList = dialog.querySelector('[role="tablist"]')
    const firstTab = tabList?.querySelector('[role="tab"]')
    if (!title || !tabList || !firstTab) return { error: 'missing parts', titleFound: !!title, tabListFound: !!tabList, firstTabFound: !!firstTab }

    const dialogRect = dialog.getBoundingClientRect()
    const titleRect = title.getBoundingClientRect()
    const tabListRect = tabList.getBoundingClientRect()
    const firstTabRect = firstTab.getBoundingClientRect()

    // W2 check: first trigger left aligns with title left (both inset from dialog by px-loose)
    const titleLeftFromDialog = titleRect.left - dialogRect.left
    const firstTabLeftFromDialog = firstTabRect.left - dialogRect.left

    // W4 check: row 1 bottom should be very close to row 2 top (flush)
    const row1 = headerRoot
    const row2 = tabList.closest('div.px-\\[var\\(--layout-space-loose\\)\\]') || tabList.parentElement
    const row1Rect = row1?.getBoundingClientRect()
    const row2Rect = row2?.getBoundingClientRect()
    const flushGap = row2Rect && row1Rect ? row2Rect.top - row1Rect.bottom : null

    // 2026-05-18 fix(user 抓雙線):W1 line owner = TabsList 自身 border-b(wrapper 撤了)。
    // Probe 兩個 border 必恰好 1 條 = 1px(避雙線 / 避缺線)。
    const row2Style = row2 ? window.getComputedStyle(row2) : null
    const tabListStyle = window.getComputedStyle(tabList)
    const wrapperBorderPx = parseFloat(row2Style?.borderBottomWidth || '0')
    const tabListBorderPx = parseFloat(tabListStyle.borderBottomWidth || '0')
    const totalBorderCount = (wrapperBorderPx > 0 ? 1 : 0) + (tabListBorderPx > 0 ? 1 : 0)
    // TabsList 必 full-width(W2 fix):span 從 wrapper 內邊(left=px-loose)到 wrapper 內邊(right=px-loose)
    const tabListWidth = tabListRect.width
    const dialogContentWidth = dialogRect.width
    const expectedTabListWidth = dialogContentWidth - (titleLeftFromDialog * 2) // 2x px-loose 估算
    const tabListFullWidth = Math.abs(tabListWidth - expectedTabListWidth) <= 2

    return {
      titleLeftFromDialog,
      firstTabLeftFromDialog,
      leftAlignDelta: Math.abs(titleLeftFromDialog - firstTabLeftFromDialog),
      flushGap,
      wrapperBorderPx,
      tabListBorderPx,
      totalBorderCount,
      tabListWidth,
      expectedTabListWidth,
      tabListFullWidth,
    }
  })
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  let passed = 0, failed = 0
  const STORY = 'design-system-patterns-header-canonical--dialog-header-with-tabs'

  try {
    await loadStory(page, STORY)
    const probe = await probeDialogWithTabs(page)
    console.log('  Probe:', JSON.stringify(probe, null, 2))

    if (probe.error) {
      console.error(`  ❌ Probe failed: ${probe.error}`)
      failed++
    } else {
      // W2 — left-align within tolerance(允許 1px sub-pixel)
      if (probe.leftAlignDelta <= 1) {
        console.log(`  ✅ W2: title vs first tab left-align Δ=${probe.leftAlignDelta.toFixed(2)}px`)
        passed++
      } else {
        console.error(`  ❌ W2: left-align Δ=${probe.leftAlignDelta.toFixed(2)}px > 1px tolerance`)
        failed++
      }

      // W4 — flush stack (gap <= 1px)
      if (probe.flushGap !== null && Math.abs(probe.flushGap) <= 1) {
        console.log(`  ✅ W4: flush stack gap = ${probe.flushGap.toFixed(2)}px`)
        passed++
      } else {
        console.error(`  ❌ W4: flush stack gap = ${probe.flushGap}px (expect <= 1)`)
        failed++
      }

      // W1 — 恰好 1 條 border-b(2026-05-18 fix:user 抓雙線 = wrapper+TabsList 兩個都畫)
      if (probe.totalBorderCount === 1) {
        console.log(`  ✅ W1: 恰好 1 條 border-b(wrapper=${probe.wrapperBorderPx}px / TabsList=${probe.tabListBorderPx}px)`)
        passed++
      } else {
        console.error(`  ❌ W1: ${probe.totalBorderCount} 條 border-b(wrapper=${probe.wrapperBorderPx}px / TabsList=${probe.tabListBorderPx}px,expect 恰好 1)`)
        failed++
      }

      // W2-extra — TabsList full-width(從 px-loose 內邊延展到內邊,不是 content-width)
      if (probe.tabListFullWidth) {
        console.log(`  ✅ W2-extra: TabsList full-width = ${probe.tabListWidth}px(expected ~${probe.expectedTabListWidth.toFixed(0)}px)`)
        passed++
      } else {
        console.error(`  ❌ W2-extra: TabsList width = ${probe.tabListWidth}px, expected ~${probe.expectedTabListWidth.toFixed(0)}px(差太多 = content-width 沒 full-width)`)
        failed++
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`\nResult: ${passed} passed / ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}

run().catch((e) => { console.error(e); process.exit(1) })
