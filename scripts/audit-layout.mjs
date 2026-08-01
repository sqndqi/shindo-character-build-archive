import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const artifacts = path.join(root, 'artifacts')
const mode = process.argv.includes('--after') ? 'after' : 'before'
const baseUrl = process.env.AUDIT_URL ?? 'https://sqndqi.github.io/shindo-character-build-archive/'
const chrome = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const viewports = [320, 375, 430, 768, 1024, 1366, 1920, 2560]
const pages = [
  ['Builds', 'builds'],
  ['Database', 'database'],
  ['Tier Lists', 'tier-lists'],
  ['My Inventory', 'inventory'],
  ['Compare', 'compare'],
  ['Suggestions', 'suggestions'],
]
const builds = ['Zack Lee', 'Vasco', 'Gray Yeon', 'Yu', 'Jin Mori']

await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } })
const consoleErrors = []
page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()))
page.on('pageerror', (error) => consoleErrors.push(error.message))

async function openNavigation(label) {
  const menu = page.getByLabel('Toggle navigation')
  if (await menu.isVisible()) {
    const expanded = await menu.getAttribute('aria-expanded')
    if (expanded !== 'true') await menu.click()
  }
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.waitForTimeout(120)
}

async function inspect(label, width) {
  const issues = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const tolerance = 1
    const visible = [...document.querySelectorAll('button, input, select, textarea, img, [role="dialog"], .character-card, .inventory-card, .tab-list')]
      .filter((node) => {
        const style = getComputedStyle(node)
        const rect = node.getBoundingClientRect()
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
      })
    const outsideViewport = visible.filter((node) => {
      if (node.closest('.table-scroll,.featured-free-builds > div,.recent-builds__list,[data-local-scroll]')) return false
      const rect = node.getBoundingClientRect()
      return rect.right > viewportWidth + tolerance || rect.left < -tolerance
    }).slice(0, 20).map((node) => ({
      tag: node.tagName,
      className: node.className?.toString().slice(0, 100) ?? '',
      text: node.textContent?.trim().slice(0, 80) ?? '',
      rect: node.getBoundingClientRect().toJSON(),
    }))
    const buttonsOutsideCards = [...document.querySelectorAll('.character-card button')].filter((button) => {
      const card = button.closest('.character-card')
      if (!card) return false
      const a = button.getBoundingClientRect()
      const b = card.getBoundingClientRect()
      return a.left < b.left - tolerance || a.right > b.right + tolerance || a.top < b.top - tolerance || a.bottom > b.bottom + tolerance
    }).length
    const cardHeights = [...document.querySelectorAll('.character-card')].map((card) => Math.round(card.getBoundingClientRect().height))
    const dialog = document.querySelector('[role="dialog"]')
    const dialogRect = dialog?.getBoundingClientRect()
    return {
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + tolerance,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth,
      viewportHeight,
      outsideViewport,
      buttonsOutsideCards,
      cardHeightRange: cardHeights.length ? Math.max(...cardHeights) - Math.min(...cardHeights) : 0,
      dialogOffscreen: dialogRect ? dialogRect.left < 0 || dialogRect.right > viewportWidth || dialogRect.top < 0 || dialogRect.bottom > viewportHeight : false,
    }
  })
  return { label, width, url: page.url(), ...issues }
}

const results = []
await page.goto(baseUrl, { waitUntil: 'networkidle' })
for (const [navLabel, slug] of pages) {
  await openNavigation(navLabel)
  results.push(await inspect(slug, 1366))
  await page.screenshot({ path: path.join(artifacts, `${mode}-${slug}-1366.png`), fullPage: true })
}

await openNavigation('Builds')
for (const name of builds) {
  await page.getByLabel('Search builds').fill(name)
  await page.waitForTimeout(260)
  await page.getByRole('button', { name: mode === 'after' ? 'Quick view' : 'View build' }).first().click()
  await page.getByRole('dialog').waitFor()
  if (mode === 'after') {
    await page.getByRole('button', { name: 'Open full build' }).click()
    await page.locator('.full-build-page').waitFor()
  }
  results.push(await inspect(`build-${name}`, 1366))
  await page.screenshot({ path: path.join(artifacts, `${mode}-build-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-1366.png`), fullPage: false })
  if (mode === 'after') await page.getByRole('button', { name: 'Back to archive' }).click()
  else await page.locator('.detail-close').click()
}

await page.getByLabel('Search builds').fill('')
await page.waitForTimeout(260)
for (const width of viewports) {
  await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
  await openNavigation('Builds')
  results.push(await inspect('builds', width))
  if ([320, 375, 430, 768, 1366, 1920].includes(width)) {
    await page.screenshot({ path: path.join(artifacts, `${mode}-builds-${width}.png`), fullPage: true })
  }
}

const report = {
  mode,
  baseUrl,
  createdAt: new Date().toISOString(),
  consoleErrors,
  results,
  issueCounts: {
    horizontalOverflow: results.filter((result) => result.horizontalOverflow).length,
    outsideViewport: results.reduce((sum, result) => sum + result.outsideViewport.length, 0),
    buttonsOutsideCards: results.reduce((sum, result) => sum + result.buttonsOutsideCards, 0),
    dialogOffscreen: results.filter((result) => result.dialogOffscreen).length,
  },
}
await writeFile(path.join(artifacts, `layout-audit-${mode}.json`), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ report: `artifacts/layout-audit-${mode}.json`, consoleErrors: consoleErrors.length, ...report.issueCounts }))
await browser.close()
