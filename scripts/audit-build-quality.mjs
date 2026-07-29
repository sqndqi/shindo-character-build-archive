import { spawnSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const runner = path.join(process.cwd(), 'scripts', 'audit-build-quality.ts')
const tsx = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs')
const result = spawnSync(process.execPath, [tsx, runner], {
  cwd: process.cwd(),
  encoding: 'utf8',
})
if (result.stdout) process.stdout.write(result.stdout)
if (result.stderr) process.stderr.write(result.stderr)
process.exitCode = result.status ?? 1
