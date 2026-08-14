/// <reference types="node" />
// Tests for public/404.html source integrity.
// These run against the source file (pre-build) to catch regressions early.
// Build-time injection (%%SEGMENTS%% → 0 or 1) is verified by inspecting dist/404.html
// after `npm run build`, not in the test suite.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const html = readFileSync(resolve('public/404.html'), 'utf-8')

describe('public/404.html', () => {
  it('contains %%SEGMENTS%% build-time placeholder', () => {
    expect(html).toContain('%%SEGMENTS%%')
  })

  it('has no hardcoded localhost URL', () => {
    expect(html).not.toMatch(/localhost:\d+/)
  })

  it('has no hardcoded GitHub subpath', () => {
    expect(html).not.toContain('/shindo-character-build-archive/')
  })

  it('uses shindo-build-archive:deep-link sessionStorage key', () => {
    expect(html).toContain('shindo-build-archive:deep-link')
  })

  it('redirects /build/ paths to SPA root', () => {
    expect(html).toMatch(/\/build\(\\\//)
  })

  it('has no duplicate id attributes', () => {
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
    expect(ids.length).toBe(new Set(ids).size)
  })

  it('has aria-hidden on decorative 404 glyph', () => {
    expect(html).toContain('aria-hidden="true"')
  })

  it('has role="main" landmark', () => {
    expect(html).toContain('role="main"')
  })

  it('has aria-labelledby on main', () => {
    expect(html).toContain('aria-labelledby=')
  })

  it('has prefers-reduced-motion style rule', () => {
    expect(html).toContain('prefers-reduced-motion')
  })

  it('has viewport meta tag', () => {
    expect(html).toContain('name="viewport"')
  })
})
