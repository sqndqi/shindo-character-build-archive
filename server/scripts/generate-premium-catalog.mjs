/**
 * Generates the private premium build catalog consumed by the server at runtime.
 *
 * Reads the reviewed build source (currently in the frontend tree) and emits
 * server/generated/premiumBuilds.json. That output is gitignored and must never
 * be committed — it is regenerated on every server build.
 *
 * Runs from the `server/` working directory (Render: rootDir=server, `npm run build`).
 * Fails the build (exit 1) if the source is missing or the catalog would be empty,
 * so production never starts with a silently empty premium catalog.
 *
 * This is a content-move only: build values are copied verbatim, never altered.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url)) // server/scripts
const SERVER_ROOT = resolve(here, '..') // server
const SOURCE = resolve(SERVER_ROOT, '..', 'src', 'data', 'reviewedBuilds.ts')
const OUT_DIR = resolve(SERVER_ROOT, 'generated')
const OUT_FILE = resolve(OUT_DIR, 'premiumBuilds.json')

function fail(msg) {
  console.error(`[premium-catalog] BUILD FAILED: ${msg}`)
  process.exit(1)
}

let raw
try {
  raw = readFileSync(SOURCE, 'utf8')
} catch {
  fail(`reviewed build source not found at ${SOURCE}`)
}

// The source is `export const reviewedBuilds = [ <JSON-compatible array> ] as ...`.
// Extract the top-level array by bracket matching, then JSON.parse it.
const start = raw.indexOf('[')
if (start === -1) fail('could not locate the build array in the source file')
let depth = 0
let end = -1
for (let i = start; i < raw.length; i++) {
  if (raw[i] === '[') depth++
  else if (raw[i] === ']') { depth--; if (depth === 0) { end = i + 1; break } }
}
if (end === -1) fail('unbalanced brackets while parsing the build array')

let builds
try {
  builds = JSON.parse(raw.slice(start, end))
} catch (err) {
  fail(`build array is not valid JSON: ${err instanceof Error ? err.message : String(err)}`)
}

if (!Array.isArray(builds) || builds.length === 0) fail('parsed catalog is empty')

// Index by canonical id for O(1) server lookup. Reject missing/duplicate ids.
const byId = {}
for (const b of builds) {
  if (!b || typeof b.id !== 'string' || !b.id) fail('a build is missing a string id')
  if (byId[b.id]) fail(`duplicate build id: ${b.id}`)
  byId[b.id] = b
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), builds: byId }), 'utf8')
console.log(`[premium-catalog] wrote ${Object.keys(byId).length} builds to ${OUT_FILE}`)
