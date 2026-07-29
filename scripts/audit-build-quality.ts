import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { completeRoster } from '../src/data/restoredRoster'
import { auditBuild } from '../src/lib/buildQuality'

const builds = completeRoster.map((build) => ({ id: build.id, name: build.name, issues: auditBuild(build) }))
const issues = builds.flatMap((build) => build.issues.map((issue) => ({ buildId: build.id, character: build.name, ...issue })))
const primaryVariants = completeRoster.map((build) => build.variants.find((variant) => variant.type === 'Primary') ?? build.variants[0])
const mentorSelections = Object.entries(primaryVariants.reduce<Record<string, number>>((counts, variant) => {
  counts[variant.mentor] = (counts[variant.mentor] ?? 0) + 1
  return counts
}, {})).sort((a, b) => b[1] - a[1]).map(([mentor, count]) => ({ mentor, count }))
const report = {
  generatedAt: new Date().toISOString(),
  baseline: {
    sourceCommit: '468d8f917d5073ce02a102696aae6816bbe3db09',
    rosterCount: 100,
    seriesCount: 37,
    mainBundleBytes: 398_950,
    mainBundleGzipBytes: 108_490,
    cssBytes: 52_604,
    cssGzipBytes: 11_470,
    uniqueBloodlines: 53,
    uniqueElements: 11,
    primaryBloodlineFamilyPairs: 11,
    primaryBuildsUsingDagai: 14,
    primaryBuildsUsingChiPot: 20,
    primaryBuildsUsingBasicCombat: 5,
    primaryBuildsWithNoMeaningfulZMode: 17,
    repeatedEquipmentPackages: 11,
    generatedEvidenceRecords: 40,
    editorialReferencePendingRecords: 10,
    unverifiedMoveSlots: 960,
    primaryBuildsWithBothCAndZModes: 83,
    primaryBuildsWithNoDefensiveMove: 80,
    primaryBuildsWithNoGuardPressure: 98,
    artificiallyFilledTwelveControlBars: 0,
    mentorSelections,
  },
  disclaimer: 'Static editorial audit. Warnings are not live-game verification results.',
  rosterCount: completeRoster.length,
  buildsWithIssues: builds.filter((build) => build.issues.length).length,
  issueCounts: issues.reduce<Record<string, number>>((counts, issue) => {
    counts[issue.severity] = (counts[issue.severity] ?? 0) + 1
    return counts
  }, {}),
  currentEquipmentCounts: {
    dagai: primaryVariants.filter((variant) => /dagai/i.test(`${variant.weapon} ${variant.ninjaTool}`)).length,
    chiPot: primaryVariants.filter((variant) => /chi pot/i.test(variant.consumable)).length,
    basicCombat: primaryVariants.filter((variant) => /basic combat/i.test(variant.combatArt)).length,
  },
  issues,
}

mkdirSync(path.join(process.cwd(), 'artifacts'), { recursive: true })
writeFileSync(path.join(process.cwd(), 'artifacts', 'build-quality-audit.json'), `${JSON.stringify(report, null, 2)}\n`)
const reviewed = completeRoster.filter((build) => build.publicationStatus === 'Reviewed')
const requiredSlots = [2, 3, 4]
const weaponIdentityIds = new Set(['goo-kim', 'anime-sasuke-uchiha', 'anime-boruto-uzumaki', 'anime-ichigo-kurosaki', 'anime-sosuke-aizen'])
const consistency = reviewed.map((build) => {
  const editorialIssues: { category: string; severity: string; variantId?: string; message: string }[] = []
  for (const count of requiredSlots) if (!build.variants.some((variant) => variant.bloodlineSlotCount === count)) {
    editorialIssues.push({ category: 'Inventory-alternative missing', severity: 'Major', message: `No prepared ${count}-slot variant.` })
  }
  if (!build.variants.some((variant) => variant.type === 'Beginner' || /accessible/i.test(variant.name))) {
    editorialIssues.push({ category: 'Inventory-alternative missing', severity: 'Major', message: 'No prepared accessible variant.' })
  }
  for (const variant of build.variants) {
    if (weaponIdentityIds.has(build.id) && (variant.weapon === 'None' || (variant.kenjutsu ?? 'None') === 'None')) {
      editorialIssues.push({ category: 'Weapon mismatch', severity: 'Major', variantId: variant.id, message: 'A weapon-identity profile is missing its weapon or Kenjutsu selection.' })
    }
    if (weaponIdentityIds.has(build.id) && (!variant.qAction || variant.qAction.source === 'None')) {
      editorialIssues.push({ category: 'Weapon mismatch', severity: 'Major', variantId: variant.id, message: 'Weapon profile has no prepared Q action.' })
    }
    if (variant.hotbar.some((slot) => slot.sourceType === undefined && !/not used/i.test(slot.ability))) {
      editorialIssues.push({ category: 'Move-source error', severity: 'Minor', variantId: variant.id, message: 'One or more active controls still need a source-type review.' })
    }
    editorialIssues.push(...auditBuild({ ...build, variants: [variant] }).map((issue) => ({
      category: issue.code.includes('family') ? 'Duplicate-family issue'
        : issue.code.includes('source') || issue.code.includes('move') ? 'Move-source error'
          : issue.code.includes('mode') ? 'Mode conflict'
            : issue.code.includes('filler') ? 'Equipment filler'
              : issue.code.includes('defense') || issue.code.includes('guard') ? 'Fighting-style mismatch'
                : 'Live testing required',
      severity: issue.severity,
      variantId: variant.id,
      message: issue.message,
    })))
  }
  return {
    id: build.id,
    character: build.name,
    variants: build.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      slots: `${variant.bloodlineSlotCount}x${variant.elementSlotCount}`,
      bloodlines: variant.bloodlines.map((slot) => slot.name),
      combatArt: variant.combatArt,
      kenjutsu: variant.kenjutsu ?? 'None',
      weapon: variant.weapon,
      qAction: variant.qAction,
      ownerTesting: build.testing.status,
    })),
    issues: editorialIssues,
  }
})
writeFileSync(path.join(process.cwd(), 'artifacts', 'reviewed-build-consistency.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  disclaimer: 'Static consistency review only. Gameplay behavior and combo timing still require live owner testing.',
  rosterCount: completeRoster.length,
  reviewedCount: reviewed.length,
  reviewedVariants: reviewed.reduce((sum, build) => sum + build.variants.length, 0),
  builds: consistency,
}, null, 2)}\n`)
console.log(JSON.stringify({ rosterCount: report.rosterCount, buildsWithIssues: report.buildsWithIssues, issueCounts: report.issueCounts }, null, 2))
