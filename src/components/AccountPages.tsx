import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  KeyRound,
  Loader,
  MailCheck,
  Shield,
  ShieldCheck,
  Ticket,
  ChevronRight,
} from 'lucide-react'
import {
  archiveAccountApiConfigured,
  getAccessState,
  signIn,
  signUp,
  signOut,
  getEntitlements,
  getOrders,
  redeemCode,
  ApiError,
  type ArchiveAccessState,
  type EntitlementSummary,
  type OrderSummary,
} from '../repositories/ArchiveAccessRepository'

export type AccountPage = 'signin' | 'signup' | 'account'

type BackendStatus = 'checking' | 'up' | 'waking' | 'unavailable'

// ------------------------------------------------------------------ BackendBanner

function BackendBanner({ status }: { status: BackendStatus }) {
  if (status === 'checking' && archiveAccountApiConfigured) {
    return (
      <div className="account-callout account-callout--loading" aria-live="polite">
        <Loader size={15} className="spin" aria-hidden="true" />
        <strong>Connecting to archive server…</strong>
      </div>
    )
  }
  if (status === 'waking') {
    return (
      <div className="account-callout account-callout--warn" role="alert">
        <strong>Server waking up</strong>
        <p>The archive server is starting up (cold-start takes ~30–60 s). Please wait a moment and try again.</p>
      </div>
    )
  }
  if (status === 'unavailable') {
    return (
      <div className="account-callout account-callout--warn" role="alert">
        <strong>Server unavailable</strong>
        <p>The archive server is temporarily unavailable. Try again later.</p>
      </div>
    )
  }
  if (!archiveAccountApiConfigured) {
    return (
      <div className="account-callout">
        <strong>Staging preview</strong>
        <p>The account API is not configured in this static preview.</p>
      </div>
    )
  }
  return null
}

// ------------------------------------------------------------------ SignInForm

function SignInForm({
  onSuccess,
  onSwitch,
  backendStatus,
}: {
  onSuccess: (state: ArchiveAccessState) => void
  onSwitch: () => void
  backendStatus: BackendStatus
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const username = String(data.get('username') ?? '').trim()
    const password = String(data.get('password') ?? '')
    if (!username || !password) { setError('Please fill in all fields.'); return }
    setBusy(true)
    setError('')
    try {
      const state = await signIn(username, password)
      onSuccess(state)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="account-panel">
      <header>
        <KeyRound />
        <span>Welcome back</span>
        <h1>Sign in securely.</h1>
        <p>Your password and entitlements are validated server-side.</p>
      </header>
      <BackendBanner status={backendStatus} />
      <form onSubmit={submit}>
        <label>
          Username
          <input name="username" type="text" autoComplete="username" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="current-password" minLength={12} required />
        </label>
        {error && <p className="account-message account-message--error" role="alert">{error}</p>}
        <button className="button button--primary" disabled={busy || backendStatus === 'checking'}>
          {busy ? <><Loader size={14} className="spin" aria-hidden="true" />{' '}Please wait…</> : 'Sign in'}
        </button>
      </form>
      <div className="account-switch">
        <button onClick={onSwitch}>Create an account</button>
        <span className="account-switch__note">Forgot your password? Contact the archive owner on Discord.</span>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ SignUpForm

function SignUpForm({
  onSuccess,
  onSwitch,
  backendStatus,
}: {
  onSuccess: () => void
  onSwitch: () => void
  backendStatus: BackendStatus
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const username = String(data.get('username') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const confirm = String(data.get('confirm') ?? '')

    if (!username || !email || !password) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 12) { setError('Password must be at least 12 characters.'); return }

    setBusy(true)
    setError('')
    try {
      await signUp(username, email, password)
      setDone(true)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with that username or email already exists.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <section className="account-panel">
        <header>
          <MailCheck />
          <span>Account created</span>
          <h1>Sign in to your new account.</h1>
        </header>
        <div className="account-callout">
          <strong>Account created successfully.</strong>
          <p>You can now sign in with your username and password.</p>
        </div>
        <div className="account-actions">
          <button className="button button--primary" onClick={onSwitch}>Sign in</button>
        </div>
      </section>
    )
  }

  return (
    <section className="account-panel">
      <header>
        <MailCheck />
        <span>Create account</span>
        <h1>Create your archive account.</h1>
        <p>Access is granted server-side. Never stored in your browser.</p>
      </header>
      <BackendBanner status={backendStatus} />
      <form onSubmit={submit}>
        <label>
          Username
          <input name="username" type="text" autoComplete="username" minLength={3} maxLength={30} required />
        </label>
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autoComplete="new-password" minLength={12} required />
          <small className="account-field-hint">At least 12 characters.</small>
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" autoComplete="new-password" minLength={12} required />
        </label>
        {error && <p className="account-message account-message--error" role="alert">{error}</p>}
        <button
          className="button button--primary"
          disabled={busy || backendStatus === 'checking' || !archiveAccountApiConfigured}
        >
          {busy ? <><Loader size={14} className="spin" aria-hidden="true" />{' '}Please wait…</> : 'Create account'}
        </button>
      </form>
      <div className="account-switch">
        <button onClick={onSwitch}>Already have an account? Sign in</button>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ RedeemForm

function RedeemForm({ onRedeemed }: { onRedeemed: (state: ArchiveAccessState) => void }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const submitted = useRef(false)

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitted.current || busy) return
    const trimmed = code.trim()
    if (!trimmed) return
    submitted.current = true
    setBusy(true)
    setMessage(null)
    try {
      const result = await redeemCode(trimmed)
      setMessage({ type: 'success', text: 'Code redeemed. Your access has been updated.' })
      setCode('')
      onRedeemed(result.access)
    } catch (err) {
      submitted.current = false
      setMessage({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Redemption failed. Please try again.',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-redeem">
      <h2><Ticket size={16} aria-hidden="true" /> Redeem a code</h2>
      <form onSubmit={submit} className="account-redeem__form">
        <input
          type="text"
          placeholder="Enter redemption code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={busy}
          maxLength={128}
          aria-label="Redemption code"
        />
        <button className="button button--primary" disabled={busy || !code.trim()}>
          {busy ? <Loader size={14} className="spin" aria-hidden="true" /> : 'Redeem'}
        </button>
      </form>
      {message && (
        <p
          className={`account-message ${message.type === 'error' ? 'account-message--error' : 'account-message--success'}`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------------ AccountView

type SignedIn = Extract<ArchiveAccessState, { status: 'signed-in' }>

function AccountView({
  state,
  onSignOut,
  onNavigateAdmin,
}: {
  state: SignedIn
  onSignOut: () => void
  onNavigateAdmin?: () => void
}) {
  const [entitlements, setEntitlements] = useState<EntitlementSummary[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [currentState, setCurrentState] = useState(state)
  const [loadingDetails, setLoadingDetails] = useState(archiveAccountApiConfigured)

  useEffect(() => {
    if (!archiveAccountApiConfigured) return
    Promise.all([getEntitlements(), getOrders()])
      .then(([ents, ords]) => { setEntitlements(ents); setOrders(ords) })
      .catch(() => undefined)
      .finally(() => setLoadingDetails(false))
  }, [])

  const handleSignOut = async () => {
    if (archiveAccountApiConfigured) {
      try { await signOut() } catch { /* best effort */ }
    }
    onSignOut()
  }

  const isOwner = currentState.role === 'owner'
  const characterCount = currentState.fullArchive
    ? 100
    : currentState.freeCharacterIds.length + currentState.characterIds.length
  const accessLabel = currentState.fullArchive
    ? 'Full Archive'
    : currentState.highestPackage
      ? currentState.highestPackage.charAt(0).toUpperCase() + currentState.highestPackage.slice(1)
      : 'Free'

  return (
    <section className="account-panel account-panel--wide">
      <header>
        <ShieldCheck />
        <span>
          {isOwner && <span className="account-owner-badge"><Shield size={12} /> Owner</span>}
          {' '}{currentState.username}
        </span>
        <h1>Your character access</h1>
        <p>Entitlements are validated server-side. Never stored in your browser.</p>
      </header>

      <div className="account-access-card">
        <div>
          <span>Access level</span>
          <strong>{accessLabel}</strong>
          <p>{characterCount} characters accessible</p>
        </div>
        <div>
          <span>Email</span>
          <strong>{currentState.email}</strong>
          <p>Entitlement status: {currentState.entitlement}</p>
        </div>
      </div>

      {loadingDetails ? (
        <div className="account-callout account-callout--loading" aria-live="polite">
          <Loader size={15} className="spin" aria-hidden="true" />
          <strong>Loading account details…</strong>
        </div>
      ) : (
        <>
          {entitlements.filter((e) => e.status === 'active').length > 0 && (
            <div className="account-entitlements">
              <h2>Active entitlements</h2>
              <ul>
                {entitlements.filter((e) => e.status === 'active').map((ent) => (
                  <li key={ent.id} className="account-entitlement-row">
                    <span className="account-entitlement-type">{ent.type.replace('_', ' ')}</span>
                    <span className="account-entitlement-source">{ent.source}</span>
                    <span className="account-entitlement-date">{new Date(ent.grantedAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {orders.length > 0 && (
            <div className="account-orders">
              <h2>Order history</h2>
              <ul>
                {orders.map((order) => (
                  <li key={order.id} className="account-order-row">
                    <span className="account-order-product">{order.productName}</span>
                    <span className={`account-order-status account-order-status--${order.orderStatus}`}>
                      {order.orderStatus}
                    </span>
                    <span className="account-order-amount">
                      {order.expectedAmount} {order.expectedCurrency.toUpperCase()}
                    </span>
                    <span className="account-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {archiveAccountApiConfigured && (
        <RedeemForm onRedeemed={(newState) => {
          if (newState.status === 'signed-in') setCurrentState(newState)
        }} />
      )}

      <div className="account-actions">
        {isOwner && onNavigateAdmin && (
          <button className="button button--outline" onClick={onNavigateAdmin}>
            Admin panel <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
        <button className="button button--text" onClick={handleSignOut}>Sign out</button>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ AccountPages (main export)

export default function AccountPages({
  initialPage = 'signin',
  onNavigateAdmin,
}: {
  initialPage?: AccountPage
  onNavigateAdmin?: () => void
}) {
  const [page, setPage] = useState<AccountPage>(initialPage)
  const [signedInState, setSignedInState] = useState<SignedIn | null>(null)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(
    archiveAccountApiConfigured ? 'checking' : 'up',
  )

  useEffect(() => {
    if (!archiveAccountApiConfigured) return
    getAccessState()
      .then((state) => {
        setBackendStatus('up')
        if (state.status === 'signed-in') {
          setSignedInState(state)
          setPage('account')
        }
      })
      .catch((err: unknown) => {
        setBackendStatus(
          err instanceof ApiError && err.code === 'backend_waking' ? 'waking' : 'unavailable',
        )
      })
  }, [])

  if (page === 'account' && signedInState) {
    return (
      <main className="account-page">
        <AccountView
          state={signedInState}
          onSignOut={() => {
            setSignedInState(null)
            setPage('signin')
            window.location.href = import.meta.env.BASE_URL as string
          }}
          onNavigateAdmin={onNavigateAdmin}
        />
      </main>
    )
  }

  if (page === 'signup') {
    return (
      <main className="account-page">
        <SignUpForm
          onSuccess={() => setPage('signin')}
          onSwitch={() => setPage('signin')}
          backendStatus={backendStatus}
        />
      </main>
    )
  }

  return (
    <main className="account-page">
      <SignInForm
        onSuccess={(state) => {
          if (state.status === 'signed-in') {
            setSignedInState(state)
            setPage('account')
          }
        }}
        onSwitch={() => setPage('signup')}
        backendStatus={backendStatus}
      />
    </main>
  )
}
