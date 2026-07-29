import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const artifacts = path.join(root, 'artifacts')
const baseUrl = process.env.CENTERING_URL ?? 'http://127.0.0.1:4180/shindo-character-build-archive/'
const viewports = [320, 375, 430, 768, 1024, 1366, 1920, 2560]
const pages = ['Builds', 'Database', 'Tier Lists', 'My Inventory', 'Compare', 'Suggestions']
const screenshots = new Map([
  ['Builds:1366', 'home-1366-centered.png'],
  ['Builds:1920', 'home-1920-centered.png'],
  ['Database:1366', 'database-1366-centered.png'],
  ['My Inventory:1366', 'inventory-1366-centered.png'],
  ['Builds:375', 'mobile-home-375-centered.png'],
  ['Goo Kim:1024', 'goo-1024-centered.png'],
  ['Goo Kim:1366', 'goo-1366-centered.png'],
  ['Goo Kim:1920', 'goo-1920-centered.png'],
  ['Goo Kim:375', 'mobile-goo-375-centered.png'],
])

await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()))
page.on('pageerror', (error) => consoleErrors.push(error.message))

async function navigate(label) {
  const menu = page.getByLabel('Toggle navigation')
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click()
  await page.getByRole('button', { name: label, exact: true }).click()
  await page.locator('main').waitFor()
  if (label === 'My Inventory') await page.locator('.workshop-page .inventory-grid').waitFor()
  if (label === 'Tier Lists') await page.locator('.tier-lab').waitFor()
  if (label === 'Suggestions') await page.locator('.suggestions-page').waitFor()
  if (label === 'Compare') await page.locator('.compare-page').waitFor()
}

async function measure(label, width) {
  const result = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) throw new Error('Main page container is missing.')
    const viewportWidth = document.documentElement.clientWidth
    const rect = main.getBoundingClientRect()
    const leftGutter = rect.left
    const rightGutter = viewportWidth - rect.right
    const topLevelOverflow = [...main.children].filter((child) => {
      const childRect = child.getBoundingClientRect()
      const style = getComputedStyle(child)
      return style.display !== 'none' && childRect.width > 0
        && (childRect.left < rect.left - 2 || childRect.right > rect.right + 2)
    }).map((child) => ({ tag: child.tagName, className: child.className, rect: child.getBoundingClientRect().toJSON() }))
    const hero = main.querySelector('.build-hero')
    const sticky = main.querySelector('.build-section-nav')
    const actions = main.querySelector('.build-hero__actions')
    const title = main.querySelector('.build-hero__content h1')
    const heroRect = hero?.getBoundingClientRect()
    const stickyRect = sticky?.getBoundingClientRect()
    const actionsRect = actions?.getBoundingClientRect()
    const titleRect = title?.getBoundingClientRect()
    const overlaps = actionsRect && titleRect
      ? actionsRect.left < titleRect.right && actionsRect.right > titleRect.left && actionsRect.top < titleRect.bottom && actionsRect.bottom > titleRect.top
      : false
    return {
      leftGutter,
      rightGutter,
      gutterDifference: Math.abs(leftGutter - rightGutter),
      mainWidth: rect.width,
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      topLevelOverflow,
      heroContained: !heroRect || (heroRect.left >= rect.left - 2 && heroRect.right <= rect.right + 2),
      stickyWidthDifference: stickyRect ? Math.abs(stickyRect.width - rect.width) : 0,
      actionsContained: !actionsRect || !heroRect || (actionsRect.left >= heroRect.left - 2 && actionsRect.right <= heroRect.right + 2),
      actionsOverlapTitle: overlaps,
    }
  })
  const failures = []
  if (result.gutterDifference > 2) failures.push(`unequal gutters (${result.leftGutter.toFixed(2)}px / ${result.rightGutter.toFixed(2)}px)`)
  if (result.horizontalOverflow) failures.push('horizontal document overflow')
  if (result.topLevelOverflow.length) failures.push(`${result.topLevelOverflow.length} top-level sections exceed main`)
  if (!result.heroContained) failures.push('hero exceeds full-build-page')
  if (result.stickyWidthDifference > 2) failures.push(`sticky navigation differs by ${result.stickyWidthDifference.toFixed(2)}px`)
  if (!result.actionsContained) failures.push('hero actions exceed hero')
  if (result.actionsOverlapTitle) failures.push('hero actions overlap title')
  if (failures.length) throw new Error(`${label} at ${width}px: ${failures.join('; ')}`)
  return { label, width, url: page.url(), ...result }
}

const results = []
for (const width of viewports) {
  await page.setViewportSize({ width, height: width <= 430 ? 844 : 960 })
  for (const label of pages) {
    await page.goto(baseUrl, { waitUntil: 'networkidle' })
    if (label !== 'Builds') await navigate(label)
    results.push(await measure(label, width))
    const screenshot = screenshots.get(`${label}:${width}`)
    if (screenshot) await page.screenshot({ path: path.join(artifacts, screenshot), fullPage: true })
  }
  for (const [name, id] of [['Goo Kim', 'goo-kim'], ['James Lee', 'james-lee']]) {
    await page.goto(new URL(`build/${id}/`, baseUrl).toString(), { waitUntil: 'networkidle' })
    await page.locator('.full-build-page').waitFor()
    results.push(await measure(name, width))
    const screenshot = screenshots.get(`${name}:${width}`)
    if (screenshot) await page.screenshot({ path: path.join(artifacts, screenshot), fullPage: true })
  }
}

if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(' | ')}`)
const report = { baseUrl, createdAt: new Date().toISOString(), viewports, results, consoleErrors }
await writeFile(path.join(artifacts, 'centering-audit.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ checks: results.length, viewports, maximumGutterDifference: Math.max(...results.map((result) => result.gutterDifference)), screenshots: screenshots.size, consoleErrors: 0 }))
await browser.close()
