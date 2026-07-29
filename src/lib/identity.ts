let fallbackCounter = 0

export function createPermanentId(prefix = 'build'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  fallbackCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${fallbackCounter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function stripGeneratedCopySuffix(name: string): string {
  return name.replace(/(?:\s+copy(?:\s+\d+)?)+\s*$/i, '').trim()
}

export function createDuplicateName(originalName: string, existingNames: Iterable<string>): string {
  const base = stripGeneratedCopySuffix(originalName) || 'Untitled Build'
  const used = new Set([...existingNames].map((name) => name.trim().toLocaleLowerCase()))
  const first = `${base} Copy`
  if (!used.has(first.toLocaleLowerCase())) return first

  let number = 2
  while (used.has(`${first} ${number}`.toLocaleLowerCase())) number += 1
  return `${first} ${number}`
}
