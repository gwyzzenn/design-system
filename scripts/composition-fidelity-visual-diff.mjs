#!/usr/bin/env node
/**
 * composition-fidelity-visual-diff.mjs
 *
 * Mechanical mechanism for「DS canonical render 跟 consumer (product-workspace) render 必 visual-identical」
 * Per user 2026-05-27 directive「mechanical 機制讓未來所有 DS components 在 product-workspace 渲染必跟 DS canonical 一致 可被驗證(byte-identity 不夠,visual diff)」
 *
 * Mapping SSOT:consumer story file 的 `// @story-baseline: <DS-story-id>` marker
 *
 * Usage:
 *   node scripts/composition-fidelity-visual-diff.mjs \
 *     --ds-static=packages/design-system/storybook-static \
 *     --consumer-static=/path/to/product-workspace/storybook-static \
 *     --out=.claude/snapshots/composition-fidelity \
 *     --threshold-pct=0.5
 *
 * Or against live servers:
 *   --ds-url=http://localhost:9001 --consumer-url=http://localhost:9002
 *
 * Exit codes:
 *   0 — all diffs within threshold
 *   1 — at least one diff exceeds threshold
 *   2 — setup error (missing tool / story / baseline marker)
 */
import { chromium } from 'playwright'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import http from 'node:http'
import { mkdirSync, existsSync, readFileSync, statSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const i = a.indexOf('='); return i < 0 ? [a.replace(/^--/, ''), true] : [a.slice(2, i), a.slice(i + 1)]
}))

const THRESHOLD_PCT = Number(args['threshold-pct'] ?? 0.5)
const OUT = args.out || join(ROOT, '.claude/snapshots/composition-fidelity')
const CONSUMER_STORIES_GLOB = args['consumer-stories'] || '/tmp/product-workspace/apps/**/src/**/*.stories.tsx'
const CONSUMER_APP_FILES = args['consumer-app-files']?.split(',') || ['/tmp/product-workspace/apps/template/src/App.tsx']

mkdirSync(OUT, { recursive: true })
mkdirSync(join(OUT, 'baseline'), { recursive: true })
mkdirSync(join(OUT, 'consumer'), { recursive: true })
mkdirSync(join(OUT, 'diff'), { recursive: true })

// ── 1. Extract @story-baseline mapping from consumer source ──
const mapping = []
for (const file of CONSUMER_APP_FILES) {
  if (!existsSync(file)) continue
  const src = readFileSync(file, 'utf-8')
  const m = src.match(/@story-baseline:\s*([^\n\r]+)/)
  if (!m) continue
  const baselineRef = m[1].trim()
  // baselineRef format: @qijenchen/design-system/components/Sidebar/sidebar.stories.tsx#IconCollapse
  // We need the storybook story id. Derive from path/exportName.
  const pathMatch = baselineRef.match(/components\/([A-Z][a-zA-Z]+)\/[^#]+#(\w+)/)
  if (!pathMatch) continue
  const componentLower = pathMatch[1].toLowerCase()
  const exportName = pathMatch[2]
  // Convert PascalCase to kebab: IconCollapse → icon-collapse
  const variant = exportName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  const baselineStoryId = `design-system-components-${componentLower}-展示--${variant}`
  // Consumer story id = best-effort derivation from file path
  // /tmp/product-workspace/apps/template/src/App.tsx → apps-template-appshell-dashboard--default (per current convention)
  const consumerStoryId = 'apps-template-appshell-dashboard--default'
  mapping.push({ baselineRef, baselineStoryId, consumerStoryId, sourceFile: file })
}

if (mapping.length === 0) {
  console.error('❌ No @story-baseline markers found in consumer source.')
  console.error(`   Searched: ${CONSUMER_APP_FILES.join(', ')}`)
  process.exit(2)
}

console.log(`Found ${mapping.length} @story-baseline mapping(s):`)
mapping.forEach(m => console.log(`  - ${m.consumerStoryId} → ${m.baselineStoryId}`))

// ── 2. Spin up static file servers if needed ──
function staticServer(dir, port) {
  const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' }
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0])
    if (p === '/') p = '/index.html'
    const fp = join(dir, p)
    if (!existsSync(fp) || statSync(fp).isDirectory()) { res.writeHead(404); res.end(); return }
    res.writeHead(200, { 'content-type': MIME[extname(fp)] || 'application/octet-stream' })
    res.end(readFileSync(fp))
  })
  return new Promise(resolve => server.listen(port, () => resolve(server)))
}

let dsUrl = args['ds-url']
let consumerUrl = args['consumer-url']
let dsServer, consumerServer
if (!dsUrl) {
  const dsStatic = args['ds-static'] || join(ROOT, 'storybook-static')
  if (!existsSync(dsStatic)) {
    console.error(`❌ DS static dir not found: ${dsStatic}`)
    process.exit(2)
  }
  dsServer = await staticServer(dsStatic, 8801)
  dsUrl = 'http://localhost:8801'
}
if (!consumerUrl) {
  const consumerStatic = args['consumer-static']
  if (!consumerStatic || !existsSync(consumerStatic)) {
    console.error(`❌ Consumer static dir not found: ${consumerStatic}`)
    process.exit(2)
  }
  consumerServer = await staticServer(consumerStatic, 8802)
  consumerUrl = 'http://localhost:8802'
}

// ── 3. Screenshot + diff per mapping ──
const browser = await chromium.launch({ headless: true })
const results = []
let failCount = 0

for (const m of mapping) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
  let baselineBuf, consumerBuf
  try {
    await page.goto(`${dsUrl}/iframe.html?id=${encodeURIComponent(m.baselineStoryId)}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.waitForTimeout(800)
    baselineBuf = await page.screenshot({ fullPage: false })
    writeFileSync(join(OUT, 'baseline', `${m.consumerStoryId}.png`), baselineBuf)

    await page.goto(`${consumerUrl}/iframe.html?id=${encodeURIComponent(m.consumerStoryId)}&viewMode=story`, { waitUntil: 'domcontentloaded', timeout: 20_000 })
    await page.waitForTimeout(800)
    consumerBuf = await page.screenshot({ fullPage: false })
    writeFileSync(join(OUT, 'consumer', `${m.consumerStoryId}.png`), consumerBuf)
  } catch (e) {
    results.push({ ...m, status: 'TIMEOUT', error: e.message.slice(0, 200) })
    failCount++
    await page.close()
    continue
  }
  await page.close()

  // Pixel diff
  const png1 = PNG.sync.read(baselineBuf)
  const png2 = PNG.sync.read(consumerBuf)
  const { width, height } = png1
  if (png2.width !== width || png2.height !== height) {
    results.push({ ...m, status: 'SIZE_MISMATCH', baselineSize: `${width}x${height}`, consumerSize: `${png2.width}x${png2.height}` })
    failCount++
    continue
  }
  const diff = new PNG({ width, height })
  const diffPx = pixelmatch(png1.data, png2.data, diff.data, width, height, { threshold: 0.1, includeAA: false })
  writeFileSync(join(OUT, 'diff', `${m.consumerStoryId}.png`), PNG.sync.write(diff))

  const totalPx = width * height
  const diffPct = (diffPx / totalPx) * 100
  const passed = diffPct <= THRESHOLD_PCT
  results.push({ ...m, status: passed ? 'PASS' : 'FAIL', diffPx, totalPx, diffPct: diffPct.toFixed(4), threshold: THRESHOLD_PCT })
  if (!passed) failCount++
  console.log(`${passed ? '✓' : '✗'} ${m.consumerStoryId} ← ${m.baselineStoryId}  diff=${diffPct.toFixed(4)}% (${diffPx}/${totalPx} px)${passed ? '' : '  FAIL'}`)
}

await browser.close()
dsServer?.close()
consumerServer?.close()

const report = { generatedAt: new Date().toISOString(), threshold: THRESHOLD_PCT, mapping, results, summary: { total: results.length, fail: failCount, pass: results.length - failCount } }
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2))

console.log('\n=== Composition fidelity report ===')
console.log(JSON.stringify(report.summary, null, 2))
console.log(`Full report: ${join(OUT, 'report.json')}`)

process.exit(failCount === 0 ? 0 : 1)
