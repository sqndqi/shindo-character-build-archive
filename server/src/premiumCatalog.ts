import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Authoritative server-side premium build catalog.
 *
 * Loaded once at process start from server/generated/premiumBuilds.json, which is
 * produced by scripts/generate-premium-catalog.mjs during the build. The generated
 * file is gitignored and never bundled into the public frontend.
 *
 * Fail-fast: if the catalog is missing or empty the process throws at import time,
 * so production never boots with a silently empty premium catalog.
 */

interface CatalogFile {
  generatedAt: string
  builds: Record<string, unknown>
}

function locateCatalog(): string {
  // CommonJS build: __dirname is server/dist at runtime (or server/src under tsx).
  const here = __dirname
  const candidates = [
    resolve(here, '..', 'generated', 'premiumBuilds.json'),
    resolve(here, '..', '..', 'generated', 'premiumBuilds.json'),
    resolve(process.cwd(), 'generated', 'premiumBuilds.json'),
  ]
  for (const c of candidates) {
    try {
      readFileSync(c)
      return c
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    'Premium build catalog not found. Run the server build (npm run build) to generate ' +
      'server/generated/premiumBuilds.json before starting.',
  )
}

function loadCatalog(): Map<string, unknown> {
  const path = locateCatalog()
  let parsed: CatalogFile
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8')) as CatalogFile
  } catch (err) {
    throw new Error(`Premium build catalog is unreadable: ${err instanceof Error ? err.message : String(err)}`)
  }
  const entries = parsed?.builds ? Object.entries(parsed.builds) : []
  if (entries.length === 0) throw new Error('Premium build catalog is empty — refusing to start.')
  return new Map(entries)
}

const catalog = loadCatalog()

/** Returns the full build for a canonical id, or null if the catalog has no such build. */
export function getPremiumBuild(id: string): unknown | null {
  return catalog.get(id) ?? null
}

/** True if the catalog contains a build for the id (independent of authorization). */
export function hasPremiumBuild(id: string): boolean {
  return catalog.has(id)
}

/** Number of builds loaded — used by health/diagnostics, never exposes content. */
export function premiumCatalogSize(): number {
  return catalog.size
}
