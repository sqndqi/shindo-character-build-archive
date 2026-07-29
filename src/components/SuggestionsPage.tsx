import { useEffect, useState } from 'react'
import { Copy, ExternalLink, MessageSquareText } from 'lucide-react'
import { formatSuggestion, type BuildSuggestion } from '../repositories/SuggestionRepository'
import { readStorage, writeStorage } from '../services/storage'

const KEY = 'shindo-build-archive:suggestion-draft:v1'
const empty: BuildSuggestion = { characterName: '', series: '', version: '', reason: '', bloodlines: '', elements: '', mode: '', combatArt: '', notes: '', discord: '' }

type IssueContext = { buildId: string; character: string; variant: string } | null

export default function SuggestionsPage({ issueContext = null }: { issueContext?: IssueContext }) {
  const [draft, setDraft] = useState(() => readStorage(KEY, empty))
  const [copied, setCopied] = useState(false)
  useEffect(() => { writeStorage(KEY, draft) }, [draft])
  useEffect(() => {
    if (!issueContext) return
    setDraft((current) => ({
      ...current,
      characterName: issueContext.character,
      version: issueContext.variant,
      reason: 'Build issue report',
      notes: `Issue type:\nCurrent Bloodline or item:\nSuggested correction:\nExplanation:\n\nArchive build ID: ${issueContext.buildId}`,
    }))
  }, [issueContext])
  const set = (key: keyof BuildSuggestion, value: string) => setDraft((current) => ({ ...current, [key]: value }))
  return <main className="suggestions-page">
    <header className="systems-hero"><span className="eyebrow"><MessageSquareText size={15} /> Suggestions</span><h1>{issueContext ? 'Report a build issue.' : 'Suggest a character or build.'}</h1><p>Suggestions are reviewed before becoming official builds. Nothing is uploaded from this form.</p></header>
    <section className="suggestion-form">
      {([['characterName', 'Character name'], ['series', 'Series'], ['version', 'Arc / version'], ['reason', 'Why should this be added?'], ['bloodlines', 'Suggested Bloodlines'], ['elements', 'Suggested elements'], ['mode', 'Suggested mode'], ['combatArt', 'Suggested Combat Art'], ['notes', 'Additional notes'], ['discord', 'Discord username (optional)']] as [keyof BuildSuggestion, string][]).map(([key, label]) => <label key={key}>{label}{key === 'reason' || key === 'notes' ? <textarea value={draft[key]} onChange={(event) => set(key, event.target.value)} /> : <input value={draft[key]} onChange={(event) => set(key, event.target.value)} />}</label>)}
      <div><button className="button button--primary" onClick={async () => { await navigator.clipboard.writeText(formatSuggestion(draft)); setCopied(true) }}><Copy size={15} /> {copied ? 'Copied' : 'Copy suggestion'}</button><a className="button button--outline" href="https://discord.gg/agarthia" target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open Discord</a></div>
    </section>
  </main>
}
