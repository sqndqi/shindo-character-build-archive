export interface BuildSuggestion {
  characterName: string
  series: string
  version: string
  reason: string
  bloodlines: string
  elements: string
  mode: string
  combatArt: string
  notes: string
  discord: string
}

export interface SuggestionRepository {
  submit(suggestion: BuildSuggestion): Promise<void>
}

export function formatSuggestion(s: BuildSuggestion) {
  return [
    '**Shindo Archive Suggestion**',
    `Character: ${s.characterName || 'Not provided'}`,
    `Series: ${s.series || 'Not provided'}`,
    `Arc/version: ${s.version || 'Not provided'}`,
    `Why add it: ${s.reason || 'Not provided'}`,
    `Suggested Bloodlines: ${s.bloodlines || 'None'}`,
    `Suggested elements: ${s.elements || 'None'}`,
    `Suggested mode: ${s.mode || 'None'}`,
    `Suggested Combat Art: ${s.combatArt || 'None'}`,
    `Additional notes: ${s.notes || 'None'}`,
    `Discord: ${s.discord || 'Not provided'}`,
  ].join('\n')
}
