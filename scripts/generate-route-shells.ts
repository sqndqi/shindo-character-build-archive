import { copyFile, mkdir } from 'node:fs/promises'
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
