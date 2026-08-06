import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, LockKeyhole, MailCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { archiveAccessRepository, archiveAccountApiConfigured, type ArchiveAccessState } from '../repositories/ArchiveAccessRepository'
import { ROBUX_PAYMENT_ENABLED, PREMIUM_PLUS_ENABLED } from '../config/monetization'
import { DiscordLink } from './CommunityLinks'

export type AccountPage = 'signin' | 'signup' | 'account' | 'premium'

export default function AccountPages({ initialPage = 'signin' }: { initialPage?: AccountPage }) {
  const [page, setPage] = useState<AccountPage>(initialPage)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [account, setAccount] = useState<ArchiveAccessState>({ status: 'signed-out' })

  useEffect(() => {
    if (page !== 'account' || !archiveAccountApiConfigured) return
    archiveAccessRepository.getAccessState().then(setAccount).catch(() => setAccount({ status: 'signed-out' }))
  }, [page])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const identifier = String(data.get(page === 'signup' ? 'email' : 'username') ?? '')
    const password = String(data.get('password') ?? '')
    setBusy(true)
    setMessage('')
    try {
      if (page === 'signup') {
        await archiveAccessRepository.signUp(identifier, password)
        setMessage('Check your email to verify the account before signing in.')
      } else {
        setAccount(await archiveAccessRepository.signIn(identifier, password))
        setPage('account')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account request failed.')
    } finally {
      setBusy(false)
    }
  }

  if (page === 'account') {
    const isFullArchive = account.status === 'signed-in' && account.fullArchive
    const ownedCount = account.status === 'signed-in' ? account.characterIds?.length ?? 0 : 0
    const packageName = account.status === 'signed-in' && account.highestPackage ? account.highestPackage.replace(/^./, (letter) => letter.toUpperCase()) : 'Free'
    const characterCount = isFullArchive ? 100 : ownedCount + 5
    const accessSummary = isFullArchive
      ? 'Full Archive access — all characters unlocked'
      : account.status === 'signed-in'
        ? `${ownedCount} paid character grants · ${packageName} access`
        : 'No paid character grants have been issued in local staging.'
    const handleSignOut = () => {
      if (archiveAccountApiConfigured) archiveAccessRepository.signOut().catch(() => {})
      setAccount({ status: 'signed-out' })
      setPage('signin')
    }
    return <main className="account-page"><section className="account-panel account-panel--wide">
    <header><ShieldCheck /><span>Account</span><h1>Your character access</h1><p>Permanent character grants are checked by the server, never by local browser storage.</p></header>
    <div className="account-access-card"><div><span>Permanent access</span><strong>{characterCount} characters</strong><p>{accessSummary}</p></div><div><span>Session security</span><strong>Server-managed</strong><p>HttpOnly cookie sessions with rotation and revocation.</p></div></div>
    <div className="account-entitlement-summary"><article><span>Free</span><strong>5</strong><small>Always available</small></article><article><span>Starter</span><strong>30</strong><small>35 total with free</small></article><article><span>Plus</span><strong>50</strong><small>55 total with free</small></article><article><span>Full Archive</span><strong>95</strong><small>100 total with free</small></article></div>
    <div className="account-actions"><button className="button button--outline">Active sessions</button><button className="button button--outline">Security</button><button className="button button--text" onClick={handleSignOut}>Sign out</button></div>
  </section></main>
  }

  if (page === 'premium') return <main className="account-page"><section className="account-panel account-panel--wide">
    <header><LockKeyhole /><span>Permanent character access</span><h1>Premium build details are protected.</h1><p>Character previews remain public. Exact loadouts require a verified account with a server-side grant for that character or Full Archive access.</p></header>
    <div className="account-callout"><strong>Payments are disabled in staging.</strong><p>Checkout cannot grant access until a configured provider confirms payment through a verified webhook or owner-reviewed manual order.</p></div>
    {ROBUX_PAYMENT_ENABLED ? null : (
      <div className="robux-placeholder">
        <div className="robux-placeholder__badge">Coming Soon</div>
        <div className="robux-placeholder__content">
          <span>Robux payment option</span>
          <p>Pay directly with Robux once connected to a verified Roblox developer product. A product ID and price will be set by the owner — none have been configured yet.</p>
        </div>
      </div>
    )}
    {PREMIUM_PLUS_ENABLED ? null : (
      <div className="premium-plus-placeholder">
        <div className="premium-plus-placeholder__header">
          <Sparkles size={16} aria-hidden="true" />
          <span className="premium-plus-badge">Premium+</span>
          <div className="premium-plus-placeholder__badge">Coming Soon</div>
        </div>
        <p>Premium+ is an upcoming tier with additional benefits. Clothing IDs, pricing, and exact benefits will be provided by the owner before launch.</p>
        <DiscordLink />
      </div>
    )}
    <div className="account-actions"><button className="button button--primary" onClick={() => setPage('signin')}>Sign in</button><button className="button button--outline" onClick={() => setPage('signup')}>Create account</button></div>
  </section></main>

  return <main className="account-page"><section className="account-panel">
    <header>{page === 'signup' ? <MailCheck /> : <KeyRound />}<span>{page === 'signup' ? 'Create account' : 'Welcome back'}</span><h1>{page === 'signup' ? 'Create your archive account.' : 'Sign in securely.'}</h1><p>{page === 'signup' ? 'Verify your email before purchasing permanent access.' : 'Your password and entitlement are validated by the trusted archive server.'}</p></header>
    {!archiveAccountApiConfigured && <div className="account-callout"><strong>Staging architecture preview</strong><p>The account API is intentionally not configured in this static preview.</p></div>}
    <form onSubmit={submit}>{page === 'signup' ? <label>Email<input name="email" type="email" autoComplete="email" required /></label> : <label>Username<input name="username" type="text" autoComplete="username" required /></label>}<label>Password<input name="password" type="password" autoComplete={page === 'signup' ? 'new-password' : 'current-password'} minLength={12} required /></label>{message && <p className="account-message" role="status">{message}</p>}<button className="button button--primary" disabled={busy}>{busy ? 'Please wait…' : page === 'signup' ? 'Create account' : 'Sign in'}</button></form>
    <div className="account-switch"><button onClick={() => setPage(page === 'signup' ? 'signin' : 'signup')}>{page === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</button><button onClick={() => setPage('premium')}>View access requirements</button></div>
  </section></main>
}
