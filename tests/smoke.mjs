import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const artifacts = path.join(root, 'artifacts')
await mkdir(artifacts, { recursive: true })

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
})
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('pageerror', (error) => errors.push(error.message))

const expectCount = async (locator, count, label) => {
  if (count > 0) await locator.first().waitFor()
  const actual = await locator.count()
  if (actual !== count) throw new Error(`${label}: expected ${count}, received ${actual}`)
}

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' })
await expectCount(page.locator('.character-card'), 24, 'first paginated character cards')
await page.screenshot({ path: path.join(artifacts, 'desktop-home.png'), fullPage: true })

await page.getByRole('button', { name: 'Spin wheel' }).click()
await page.getByRole('dialog', { name: 'Random character wheel' }).waitFor()
await page.screenshot({ path: path.join(artifacts, 'desktop-wheel.png'), fullPage: false })
await page.locator('.wheel-panel .icon-button').click()

await page.getByLabel('Search builds').fill('James Lee')
await page.waitForTimeout(250)
await expectCount(page.locator('.character-card'), 1, 'search results')
await page.getByRole('button', { name: 'Quick view James Lee' }).click()
await page.getByRole('dialog', { name: 'James Lee build details' }).waitFor()
await page.screenshot({ path: path.join(artifacts, 'desktop-detail.png'), fullPage: false })
await page.getByRole('button', { name: 'Edit build' }).click()
await page.getByLabel('Notes').fill('QA persistence verified.')
await page.getByRole('button', { name: 'Save build' }).click()
await page.waitForTimeout(250)
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('shindo-build-archive:v1') ?? '[]'))
if (!stored.find((build) => build.id === 'james-lee' && build.notes === 'QA persistence verified.')) {
  throw new Error('localStorage edit did not persist')
}
await page.locator('.detail-close').click()
await page.getByRole('button', { name: 'Clear search' }).click()

await page.getByRole('button', { name: 'Add James Lee to comparison' }).click()
await page.getByRole('button', { name: 'Add Seongji Yuk to comparison' }).click()
await page.getByRole('button', { name: 'Open matchup' }).click()
await page.getByRole('dialog', { name: 'Build comparison' }).waitFor()
await expectCount(page.locator('.compare-character'), 2, 'comparison columns')
await page.screenshot({ path: path.join(artifacts, 'desktop-compare.png'), fullPage: false })
await page.locator('.compare-panel .icon-button').click()

await page.getByRole('button', { name: 'Database' }).click()
await expectCount(page.locator('tbody tr'), 24, 'paginated database rows')
await page.getByRole('button', { name: 'Add build' }).click()
await page.getByRole('dialog', { name: 'Add new build' }).waitFor()
await page.locator('.editor-panel .icon-button').click()

await page.getByRole('button', { name: 'Tier Lab' }).click()
await expectCount(page.locator('.tier-chip'), 90, 'tier lab character chips')
await page.screenshot({ path: path.join(artifacts, 'desktop-tier-lab.png'), fullPage: false })

await page.getByRole('button', { name: 'Gallery', exact: true }).click()
for (const width of [1366, 1920, 2560]) {
  await page.setViewportSize({ width, height: 1000 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (overflow) throw new Error(`desktop page has horizontal overflow at ${width}px`)
}

for (const width of [320, 375, 430]) {
  await page.setViewportSize({ width, height: 844 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  if (overflow) throw new Error(`mobile page has horizontal overflow at ${width}px`)
}
await page.setViewportSize({ width: 375, height: 844 })
await page.screenshot({ path: path.join(artifacts, 'mobile-home.png'), fullPage: true })
if (errors.length) throw new Error(`console errors: ${errors.join(' | ')}`)

console.log(JSON.stringify({
  url: page.url(),
  desktopViewport: '1440x1000',
  mobileViewports: ['320x844', '375x844', '430x844'],
  desktopViewports: ['1366x1000', '1920x1000', '2560x1000'],
  cards: 24,
  tableRows: 24,
  tierCharacters: 90,
  consoleErrors: errors.length,
  screenshots: ['desktop-home.png', 'desktop-wheel.png', 'desktop-detail.png', 'desktop-compare.png', 'desktop-tier-lab.png', 'mobile-home.png'],
}, null, 2))

await browser.close()
