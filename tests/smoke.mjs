import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const artifacts = path.join(root, 'artifacts')
await mkdir(artifacts, { recursive: true })
const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
page.on('pageerror', (error) => errors.push(error.message))
await page.goto(process.env.SMOKE_URL ?? 'http://127.0.0.1:4173', { waitUntil: 'networkidle' })

if (await page.locator('.character-card').count() !== 10) throw new Error('Expected ten reviewed public cards.')
for (const forbidden of ['Add build', 'About', 'Diagnostics', 'Edit build', 'Duplicate', 'Delete']) {
  if (await page.getByText(forbidden, { exact: true }).count()) throw new Error(`Forbidden public control found: ${forbidden}`)
}
await page.screenshot({ path: path.join(artifacts, 'public-desktop.png'), fullPage: true })
await page.getByLabel('Search builds').fill('James Lee')
await page.waitForTimeout(250)
await page.getByRole('button', { name: 'View build' }).click()
await page.getByRole('dialog', { name: 'James Lee build details' }).waitFor()
if (await page.getByText('Recommended Setup', { exact: true }).count() !== 1) throw new Error('Build hierarchy missing.')
await page.getByLabel('Bloodline slots').selectOption('2')
if (await page.locator('.bloodline-detail-grid article').count() !== 2) throw new Error('Two-slot variant is not complete.')
await page.screenshot({ path: path.join(artifacts, 'public-detail-2-slot.png'), fullPage: false })
await page.locator('.detail-close').click()
await page.getByRole('button', { name: 'Tier Lists' }).click()
await page.getByText('Personal community tier list — not an official archive ranking.').first().waitFor()
await page.getByRole('button', { name: 'Suggestions' }).click()
await page.getByLabel('Character name').fill('Test Fighter')
await page.getByRole('button', { name: 'Copy suggestion' }).click()
await page.getByRole('button', { name: 'Builds' }).click()

for (const width of [1366, 1920, 2560, 320, 375, 430]) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 })
  if (width < 500) {
    await page.getByLabel('Toggle navigation').click()
    if (await page.getByRole('button', { name: 'My Inventory' }).count() !== 1) throw new Error(`Mobile navigation incomplete at ${width}px`)
    await page.getByLabel('Toggle navigation').click()
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (overflow) throw new Error(`Horizontal overflow at ${width}px`)
}
await page.setViewportSize({ width: 375, height: 844 })
await page.screenshot({ path: path.join(artifacts, 'public-mobile.png'), fullPage: true })
if (errors.length) throw new Error(`Console errors: ${errors.join(' | ')}`)
console.log(JSON.stringify({ url: page.url(), cards: 10, consoleErrors: 0, viewports: [320, 375, 430, 1366, 1920, 2560], screenshots: ['public-desktop.png', 'public-detail-2-slot.png', 'public-mobile.png'] }))
await browser.close()
