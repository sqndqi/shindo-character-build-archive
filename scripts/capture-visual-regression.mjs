import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const artifacts = path.join(root, 'artifacts')
const baseUrl = process.env.VISUAL_URL ?? 'http://127.0.0.1:4173'
await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
const checks = []
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
page.on('pageerror', (error) => errors.push(error.message))

async function openNav(label) {
  const menu = page.getByLabel('Toggle navigation')
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click()
  await page.getByRole('button', { name: label, exact: true }).click()
}
async function archive() {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
}
async function fullBuild(name) {
  await openNav('Builds')
  await page.getByLabel('Search builds').fill(name)
  await page.waitForTimeout(260)
  await page.getByRole('button', { name: 'Quick view' }).click()
  await page.getByRole('button', { name: 'Open full build' }).click()
  await page.locator('.full-build-page').waitFor()
}
async function assertLayout(label) {
  const result = await page.evaluate(() => {
    const width = document.documentElement.clientWidth
    const visible = [...document.querySelectorAll('button, input, select, img, .character-card, .loadout-group article, .move-row')]
      .filter((node) => {
        const rect = node.getBoundingClientRect()
        const style = getComputedStyle(node)
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
      })
    const outside = visible.filter((node) => {
      const rect = node.getBoundingClientRect()
      return rect.left < -1 || rect.right > width + 1
    }).map((node) => ({ tag: node.tagName, className: String(node.className).slice(0, 80), text: node.textContent?.trim().slice(0, 70) }))
    const cardButtonsOutside = [...document.querySelectorAll('.character-card button')].filter((button) => {
      const card = button.closest('.character-card')
      if (!card) return false
      const a = button.getBoundingClientRect()
      const b = card.getBoundingClientRect()
      return a.left < b.left - 1 || a.right > b.right + 1 || a.top < b.top - 1 || a.bottom > b.bottom + 1
    }).length
    const sticky = document.querySelector('.build-section-nav')
    const firstSection = document.querySelector('.build-section')
    const stickyCoversSection = sticky && firstSection
      ? Number.parseFloat(getComputedStyle(firstSection).scrollMarginTop) < 120
      : false
    return {
      overflow: document.documentElement.scrollWidth > width + 1,
      outside,
      cardButtonsOutside,
      stickyCoversSection,
    }
  })
  checks.push({ label, viewport: page.viewportSize(), url: page.url(), ...result })
  if (result.overflow || result.outside.length || result.cardButtonsOutside || result.stickyCoversSection) {
    throw new Error(`${label} layout failure: ${JSON.stringify(result)}`)
  }
}
async function loadVisibleImages() {
  await page.evaluate(() => document.querySelectorAll('img').forEach((image) => { image.loading = 'eager' }))
  await page.waitForTimeout(450)
}

await archive()
await assertLayout('desktop-home')
await loadVisibleImages()
await page.screenshot({ path: path.join(artifacts, 'desktop-home.png'), fullPage: true })
await fullBuild('Goo Kim')
await assertLayout('desktop-goo-build')
if (await page.getByText('Wind-Kenjutsu', { exact: true }).count() < 1) throw new Error('Goo Kenjutsu is not visible.')
if (await page.getByText('Bankai Blade', { exact: true }).count() < 1) throw new Error('Goo weapon is not visible.')
await page.screenshot({ path: path.join(artifacts, 'desktop-goo-build.png'), fullPage: true })
await page.getByLabel('Prepared variant').selectOption('goo-kim-3x2')
await page.locator('.alternative-compare-controls select').selectOption('goo-kim-2x2')
await page.locator('.variant-comparison').scrollIntoViewIfNeeded()
await assertLayout('desktop-alternative-compare')
await page.screenshot({ path: path.join(artifacts, 'desktop-alternative-compare.png'), fullPage: false })
await archive()
await fullBuild('James Lee')
await assertLayout('desktop-james-build')
await page.screenshot({ path: path.join(artifacts, 'desktop-james-build.png'), fullPage: true })
await archive()
await openNav('My Inventory')
await page.locator('.inventory-shell').waitFor()
await assertLayout('desktop-inventory')
await page.screenshot({ path: path.join(artifacts, 'desktop-inventory.png'), fullPage: true })

await page.setViewportSize({ width: 768, height: 1024 })
await archive()
await assertLayout('tablet-home')
await page.screenshot({ path: path.join(artifacts, 'tablet-home.png'), fullPage: true })
await fullBuild('Goo Kim')
await assertLayout('tablet-build')
await page.screenshot({ path: path.join(artifacts, 'tablet-build.png'), fullPage: true })

await page.setViewportSize({ width: 375, height: 844 })
await archive()
await assertLayout('mobile-home')
await page.screenshot({ path: path.join(artifacts, 'mobile-home.png'), fullPage: true })
await fullBuild('Goo Kim')
await assertLayout('mobile-goo-build')
await page.screenshot({ path: path.join(artifacts, 'mobile-goo-build.png'), fullPage: true })
await page.locator('#hotbar').scrollIntoViewIfNeeded()
await assertLayout('mobile-hotbar')
await page.screenshot({ path: path.join(artifacts, 'mobile-hotbar.png'), fullPage: false })

await writeFile(path.join(artifacts, 'layout-audit-after.json'), JSON.stringify({ createdAt: new Date().toISOString(), url: baseUrl, errors, checks }, null, 2))
if (errors.length) throw new Error(`Console errors: ${errors.join(' | ')}`)
console.log(JSON.stringify({ url: baseUrl, checks: checks.length, consoleErrors: 0, screenshots: 10 }))
await browser.close()
