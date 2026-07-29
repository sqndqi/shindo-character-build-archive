import { readFile, writeFile } from 'node:fs/promises'
import postcss from 'postcss'

const file = new URL('../src/index.css', import.meta.url)
const marker = '/* Shindo archive visual system */'
const source = await readFile(file, 'utf8')
const [legacySource, greenSource] = source.split(marker)
if (!greenSource) throw new Error('Shindo visual-system marker was not found.')

const legacy = postcss.parse(legacySource)
const green = postcss.parse(greenSource)
const greenSelectors = new Set()
green.walkRules((rule) => greenSelectors.add(rule.selector.replace(/\s+/g, ' ').trim()))

const obsolete = /(?:^|[\s,.])(?:\.about-page|\.about-grid|\.editor-panel|\.editor-scroll|\.editor-warnings|\.form-grid|\.slot-control|\.slot-readout|\.character-card__serial|\.character-card__visual\s*>\s*img|\.compare-toggle|\.favorite-toggle|\.score--compact|\.wheel-panel|\.wheel-pointer|\.wheel-content|\.wheel-stage|\.wheel-number|\.fighter-wheel|\.wheel-result|\.workshop-actions|\.bloodline-vault|\.bloodline-list|\.bloodline-editor|\.hotbar-editor|\.detail-actions|\.analysis-grid|\.analysis-summary|\.analysis-warnings|\.rating-stack|\.difficulty-panel|\.build-notes|\.compare-tray|\.archive-tools|\.toast)(?:[\s:>.,#]|$)/
legacy.walkRules((rule) => {
  const selector = rule.selector.replace(/\s+/g, ' ').trim()
  if (selector === ':root' || selector.includes(':focus-visible') || greenSelectors.has(selector) || obsolete.test(selector)) rule.remove()
})
legacy.walkAtRules('media', (rule) => {
  if (!rule.nodes?.length) rule.remove()
})

let output = `${legacy.toString().trim()}\n\n${marker}\n${green.toString().trim()}\n`
output = output
  .replaceAll('var(--red-dark)', 'var(--accent-dark)')
  .replaceAll('var(--red)', 'var(--accent)')
  .replace(/\n\s*--red:\s*var\(--accent\);/g, '')
  .replace(/\n\s*--red-dark:\s*var\(--accent-dark\);/g, '')
  .replace(/\n{3,}/g, '\n\n')
  .replace('border-color: #64141b; color: #ff6975; background: rgba(119,15,24,.13)', 'border-color: var(--danger); color: var(--danger); background: color-mix(in srgb, var(--danger) 12%, transparent)')
  .replace('background: linear-gradient(90deg, #8b101b, #f32d3d)', 'background: var(--accent)')
  .replaceAll('color: #d94a55', 'color: var(--accent)')
  .replaceAll('color: #db4652', 'color: var(--accent)')
  .replaceAll('color: #ef5360', 'color: var(--accent)')

const consolidated = postcss.parse(output)
const topLevelRules = new Map()
consolidated.walkRules((rule) => {
  if (rule.parent?.type === 'atrule') return
  for (const selector of rule.selectors ?? []) {
    const normalized = selector.replace(/\s+/g, ' ').trim()
    const rules = topLevelRules.get(normalized) ?? []
    rules.push(rule)
    topLevelRules.set(normalized, rules)
  }
})

for (const [selector, rules] of topLevelRules) {
  if (rules.length < 2) continue
  const target = rules.at(-1)
  const declarations = new Map()
  for (const rule of rules) {
    for (const node of rule.nodes ?? []) {
      if (node.type === 'decl') declarations.set(node.prop, node.clone())
    }
  }
  target.removeAll()
  for (const declaration of declarations.values()) target.append(declaration)
  for (const rule of rules.slice(0, -1)) {
    const remaining = (rule.selectors ?? []).filter((candidate) => candidate.replace(/\s+/g, ' ').trim() !== selector)
    if (remaining.length) rule.selectors = remaining
    else rule.remove()
  }
}

output = `${consolidated.toString().trim()}\n`
await writeFile(file, output)
console.log(JSON.stringify({
  previousBytes: Buffer.byteLength(source),
  nextBytes: Buffer.byteLength(output),
  previousLines: source.split(/\r?\n/).length,
  nextLines: output.split(/\r?\n/).length,
}, null, 2))
