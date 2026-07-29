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
    sourceCommit: 'f1ecefdad49ac976fbdc3e6d8b841a109373cc62',
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
console.log(JSON.stringify({ rosterCount: report.rosterCount, buildsWithIssues: report.buildsWithIssues, issueCounts: report.issueCounts }, null, 2))
