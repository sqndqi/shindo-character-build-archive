import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { publicBuildPreviews } from '../src/data/publicBuildPreviews'
import { freeBuilds } from '../src/data/freeBuilds'

const dist = resolve('dist')
const entry = resolve(dist, 'index.html')
const routes = publicBuildPreviews.flatMap((build) => [
  resolve(dist, 'build', build.id, 'index.html'),
  ...(freeBuilds.find((free) => free.id === build.id)?.variants.map((variant) => resolve(dist, 'build', build.id, variant.id, 'index.html')) ?? []),
])

await Promise.all(routes.map(async (target) => {
  await mkdir(resolve(target, '..'), { recursive: true })
  await copyFile(entry, target)
}))

console.log(`Generated ${routes.length} static build route shells.`)

// Patch 404.html: replace %%SEGMENTS%% with the deployment base-segment count.
// 1 = GitHub project pages (/shindo-character-build-archive/); 0 = root/custom-domain.
const segments = process.env.GITHUB_ACTIONS ? '1' : '0'
const page404 = resolve(dist, '404.html')
const html404 = await readFile(page404, 'utf-8')
await writeFile(page404, html404.replaceAll('%%SEGMENTS%%', segments))
console.log(`Patched 404.html base-segments: ${segments}`)
