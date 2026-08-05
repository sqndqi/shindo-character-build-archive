#!/usr/bin/env node
// Run: node scripts/gen-password-hash.mjs
// Reads the password from stdin, prints OWNER_PASSWORD_HASH=<hash> to stdout.
import { createInterface } from 'readline'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bcrypt = require('bcryptjs')

process.stderr.write('Password (input hidden — paste and press Enter): ')

const rl = createInterface({ input: process.stdin, output: null, terminal: false })
rl.once('line', async (password) => {
  rl.close()
  if (!password.trim()) {
    process.stderr.write('Error: password cannot be empty\n')
    process.exit(1)
  }
  const hash = await bcrypt.hash(password.trim(), 12)
  process.stdout.write(`OWNER_PASSWORD_HASH=${hash}\n`)
})
