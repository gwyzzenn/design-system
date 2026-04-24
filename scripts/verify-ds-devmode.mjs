#!/usr/bin/env node
/**
 * Self-verify DS Devmode addon — opens Storybook, toggles Live, clicks a Button,
 * screenshots full Storybook (panel + canvas + overlay), plus canvas-only.
 * Output → snapshots-devmode/.
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'snapshots-devmode')
const SB = 'http://localhost:6006'
const STORY = '/?path=/story/design-system-components-button-%E5%B1%95%E7%A4%BA--primary&viewMode=story'

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2 })
const page = await context.newPage()

console.log('[1/6] Load Storybook Button default story')
await page.goto(`${SB}${STORY}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

console.log('[2/6] Open DS Devmode panel tab')
// Storybook panels are rendered as tabs; find by text "DS Devmode"
const tabSelector = 'button[role="tab"]:has-text("DS Devmode")'
const tab = page.locator(tabSelector).first()
if (await tab.count()) {
  await tab.click()
  await page.waitForTimeout(400)
}

console.log('[3/6] Click Live toggle in panel')
const liveBtn = page.locator('button:has-text("Live")').first()
await liveBtn.click()
await page.waitForTimeout(300)

await page.screenshot({ path: join(OUT, '01-panel-off-live-toggled.png'), fullPage: false })

console.log('[4/6] Click a Button inside the canvas iframe')
const iframe = page.frameLocator('#storybook-preview-iframe')
const button = iframe.locator('#storybook-root button').first()
await button.waitFor({ state: 'visible', timeout: 8000 })
await button.click({ force: true })
await page.waitForTimeout(800)

console.log('[5/6] Full Storybook screenshot (panel + canvas + overlay)')
await page.screenshot({ path: join(OUT, '02-full-inspect.png'), fullPage: false })

console.log('[6/6] Canvas-only screenshot (show overlay)')
const canvasBox = await page.locator('#storybook-preview-iframe').boundingBox()
if (canvasBox) {
  await page.screenshot({
    path: join(OUT, '03-canvas-overlay.png'),
    clip: { x: canvasBox.x, y: canvasBox.y, width: canvasBox.width, height: canvasBox.height },
  })
}

// Panel-only screenshot
const panelSelectors = [
  '#storybook-panel-root',
  '[role="tabpanel"]',
]
for (const sel of panelSelectors) {
  const el = await page.locator(sel).first()
  if (await el.count()) {
    const box = await el.boundingBox()
    if (box && box.width > 100) {
      await page.screenshot({
        path: join(OUT, '04-panel.png'),
        clip: { x: box.x, y: box.y, width: box.width, height: box.height },
      })
      break
    }
  }
}

// Bonus: click a larger element (the whole button) for richer panel demo
console.log('[7/7] Click whole Button — demo CSS + tokens')
const wholeButton = iframe.locator('#storybook-root button').first()
// Element position:  click on the button's outer region (padding area) to select button itself
const bbox = await wholeButton.boundingBox()
if (bbox) {
  // Click on left-padding area where it's unambiguously the button
  await page.mouse.click(bbox.x + 3, bbox.y + bbox.height / 2)
  await page.waitForTimeout(600)
  await page.screenshot({ path: join(OUT, '05-button-inspect.png'), fullPage: false })
  // Panel-only for this state — full height
  for (const sel of panelSelectors) {
    const el = await page.locator(sel).first()
    if (await el.count()) {
      const box = await el.boundingBox()
      if (box && box.width > 100) {
        // Scroll panel content to show CSS sections
        await el.evaluate(n => { n.scrollTop = 0 })
        await page.screenshot({
          path: join(OUT, '06-button-panel.png'),
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        })
        // Find our scrollable panel root (the div inside Storybook's panel-root)
        await page.evaluate(() => {
          const panels = document.querySelectorAll('#storybook-panel-root div[style*="overflow"]')
          panels.forEach(p => { p.scrollTop = p.scrollHeight })
        })
        await page.waitForTimeout(200)
        await page.screenshot({
          path: join(OUT, '07-button-panel-css.png'),
          clip: { x: box.x, y: box.y, width: box.width, height: box.height },
        })
        break
      }
    }
  }
}

await browser.close()
console.log('Done →', OUT)
