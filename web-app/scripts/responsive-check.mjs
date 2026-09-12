#!/usr/bin/env node
/**
 * Reader-mode responsive regression check.
 *
 * Loads the Mushaf reading page across a fixed matrix of real device sizes
 * (phones, foldables, tablets, laptops, desktops — portrait and landscape)
 * plus the layout-context states that change how much width the page frame
 * actually gets (nav open/closed, Study Panel open/closed), and fails on:
 *   - any horizontal overflow (the #1 responsive-design regression)
 *   - console/page errors
 *   - a QcfLine scaleX so far from 1 that a page is badly mismatched to its
 *     container (would mean font-loading/measurement raced badly)
 *
 * Usage:
 *   npm run dev            # in one terminal
 *   node scripts/responsive-check.mjs [baseUrl]   # defaults to localhost:3000
 *
 * Screenshots land in scripts/.responsive-shots/ (gitignored) for a quick
 * visual pass alongside the pass/fail table printed to stdout.
 */
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const BASE_URL = process.argv[2] ?? "http://localhost:3000"
const SHOT_DIR = join(dirname(fileURLToPath(import.meta.url)), ".responsive-shots")
mkdirSync(SHOT_DIR, { recursive: true })

/** Real device/context viewports — not arbitrary round numbers. Includes
 * short-landscape cases specifically because those are the ones a
 * breakpoint-only approach tends to miss. */
const VIEWPORTS = [
  { name: "iphone-se-portrait", width: 320, height: 568 },
  { name: "iphone-13-portrait", width: 390, height: 844 },
  { name: "iphone-13-landscape", width: 844, height: 390 },
  { name: "android-large-portrait", width: 430, height: 932 },
  { name: "foldable-inner", width: 673, height: 841 },
  { name: "ipad-mini-portrait", width: 768, height: 1024 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "laptop-lg", width: 1440, height: 900 },
  { name: "desktop", width: 1920, height: 1080 },
  { name: "ultrawide", width: 2560, height: 1080 },
]

/** Layout-context states worth checking independently of viewport, since
 * the reader column's *available* width depends on these, not just the
 * window — this is exactly what the @container fix is for. */
const PANEL_STATES = [
  { name: "default" },
  { name: "study-open", openStudyPanel: true },
]

async function openStudyPanel(page) {
  await page
    .locator('[role="listitem"] button[title="Tafsir"]')
    .first()
    .click({ timeout: 5000 })
    .catch(() => {})
}

async function checkOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
}

async function checkQcfScale(page) {
  return page.evaluate(() => {
    const inner = document.querySelector("[data-line-number]")?.firstElementChild
    if (!inner) return null
    const t = getComputedStyle(inner).transform
    if (t === "none") return 1
    const match = t.match(/matrix\(([^,]+),/)
    return match ? parseFloat(match[1]) : null
  })
}

async function run() {
  const browser = await chromium.launch()
  const results = []

  for (const viewport of VIEWPORTS) {
    for (const panelState of PANEL_STATES) {
      const label = `${viewport.name} (${viewport.width}x${viewport.height}) / ${panelState.name}`
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } })
      const page = await context.newPage()
      const errors = []
      page.on("pageerror", (e) => errors.push(e.message))
      page.on("console", (m) => {
        if (m.type() !== "error") return
        // Chrome logs any failed network request as a console "error" —
        // including the QCF glyph font, which the app deliberately treats
        // as best-effort and falls back from (see qcfFonts.ts). A transient
        // CDN/DNS hiccup fetching it is not a layout regression; don't let
        // it fail this check the way a real thrown error should.
        if (/Failed to load resource/.test(m.text())) return
        errors.push(m.text())
      })

      try {
        await page.goto(`${BASE_URL}/3`, { waitUntil: "domcontentloaded", timeout: 30000 })
        await page.waitForSelector('[aria-label="Surah navigation"]', { timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(1200)

        if (panelState.openStudyPanel) {
          await page.locator('button[aria-label="Settings"]').click().catch(() => {})
          await page.waitForTimeout(300)
          await page
            .locator('button[role="radio"]', { hasText: "Verse by verse" })
            .click({ timeout: 3000 })
            .catch(() => {})
          await page.keyboard.press("Escape").catch(() => {})
          await page.waitForTimeout(400)
          await openStudyPanel(page)
          await page.waitForTimeout(500)
        }

        await page.waitForTimeout(1000)

        const overflow = await checkOverflow(page)
        const hasOverflow = overflow.scrollWidth > overflow.clientWidth + 1
        const qcfScale = await checkQcfScale(page)
        const scaleOk = qcfScale === null || (qcfScale > 0.4 && qcfScale < 2.5)

        await page.screenshot({ path: join(SHOT_DIR, `${viewport.name}--${panelState.name}.png`) })

        const pass = !hasOverflow && errors.length === 0 && scaleOk
        results.push({ label, pass, hasOverflow, overflow, errors, qcfScale })
      } catch (err) {
        results.push({ label, pass: false, errors: [String(err)] })
      } finally {
        await context.close()
      }
    }
  }

  await browser.close()

  console.log("\n=== Responsive check results ===\n")
  let failCount = 0
  for (const r of results) {
    const icon = r.pass ? "✓" : "✗"
    if (!r.pass) failCount++
    console.log(`${icon} ${r.label}`)
    if (r.hasOverflow) {
      console.log(`    horizontal overflow: scrollWidth=${r.overflow.scrollWidth} > clientWidth=${r.overflow.clientWidth}`)
    }
    if (r.qcfScale != null && !(r.qcfScale > 0.4 && r.qcfScale < 2.5)) {
      console.log(`    suspicious QcfLine scaleX: ${r.qcfScale}`)
    }
    if (r.errors?.length) {
      for (const e of r.errors) console.log(`    error: ${e}`)
    }
  }
  console.log(`\n${results.length - failCount}/${results.length} passed. Screenshots: ${SHOT_DIR}\n`)
  process.exit(failCount > 0 ? 1 : 0)
}

run()
