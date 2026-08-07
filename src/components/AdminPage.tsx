import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  BarChart3,
  Check,
  ChevronLeft,
  ClipboardCopy,
  FileText,
  Loader,
  Package,
  Plus,
  ShieldAlert,
  Ticket,
  Tags,
  Users,
} from 'lucide-react'
import {
  ApiError,
  adminGetDashboard,
  adminGetUsers,
  adminSuspendUser,
  adminReactivateUser,
  adminGetUserEntitlements,
  adminGrantEntitlement,
  adminRevokeEntitlement,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminGetPayments,
  adminReconcilePayment,
  adminGetCodes,
  adminCreateCode,
  adminDeactivateCode,
  adminGetAudit,
  type AdminDashboard,
  type AdminUser,
  type AdminProduct,
  type AdminPayment,
  type AdminCode,
  type AuditLog,
  type EntitlementSummary,
} from '../repositories/ArchiveAccessRepository'
import { completeRoster } from '../data/restoredRoster'

type AdminTab = 'dashboard' | 'users' | 'products' | 'payments' | 'codes' | 'audit'

function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[],
): { data: T | null; loading: boolean; error: string } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const fnRef = useRef(fn)
  fnRef.current = fn
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fnRef.current()
      .then((v) => { if (!cancelled) setData(v) })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof ApiError ? e.message : 'Failed to load.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, deps) // oxlint-disable-line react-hooks/exhaustive-deps
  return { data, loading, error }
}

function AsyncSection({
  loading,
  error,
  children,
}: {
  loading: boolean
  error: string
  children: React.ReactNode
}) {
  if (loading) return <div className="admin-loading"><Loader size={16} className="spin" aria-hidden="true" /> Loading…</div>
  if (error) return <div className="admin-error" role="alert">{error}</div>
  return <>{children}</>
}

// ------------------------------------------------------------------ Dashboard

function DashboardTab() {
  const { data, loading, error } = useAsync<AdminDashboard>(adminGetDashboard, [])
  return (
    <div className="admin-section">
      <h2>Dashboard</h2>
      <AsyncSection loading={loading} error={error}>
        {data && (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <span>Users</span>
                <strong>{data.users.total}</strong>
                <small>{data.users.active} active · {data.users.suspended} suspended</small>
              </div>
              <div className="admin-stat">
                <span>Active entitlements</span>
                <strong>{data.entitlements.active_count}</strong>
              </div>
              <div className="admin-stat">
                <span>Payments</span>
                <strong>{data.payments.completed} completed</strong>
                <small>{data.payments.pending} pending · {data.payments.failed} failed</small>
              </div>
              <div className="admin-stat">
                <span>Redemptions (7d)</span>
                <strong>{data.recentRedemptions}</strong>
              </div>
            </div>
            {data.recentAudit.length > 0 && (
              <div className="admin-audit-preview">
                <h3>Recent activity</h3>
                <ul>
                  {data.recentAudit.map((log) => (
                    <li key={log.id} className="admin-audit-row">
                      <code>{log.action}</code>
                      <span>{log.target_type}</span>
                      <time>{new Date(log.created_at).toLocaleString()}</time>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ Users

function UsersTab() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [entitlements, setEntitlements] = useState<EntitlementSummary[]>([])
  const [busy, setBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState('')
  const { data: users, loading, error } = useAsync<AdminUser[]>(() => adminGetUsers(search), [search])

  const selectUser = async (user: AdminUser) => {
    setSelected(user)
    setActionMsg('')
    try {
      const ents = await adminGetUserEntitlements(user.id)
      setEntitlements(ents)
    } catch {
      setEntitlements([])
    }
  }

  const doSuspend = async () => {
    if (!selected || busy) return
    setBusy(true)
    try {
      await adminSuspendUser(selected.id)
      setActionMsg('User suspended.')
      setSelected({ ...selected, status: 'suspended' })
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  const doReactivate = async () => {
    if (!selected || busy) return
    setBusy(true)
    try {
      await adminReactivateUser(selected.id)
      setActionMsg('User reactivated.')
      setSelected({ ...selected, status: 'active' })
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  const doRevoke = async (entId: string) => {
    if (busy) return
    setBusy(true)
    try {
      await adminRevokeEntitlement(entId)
      setEntitlements((prev) => prev.map((e) => e.id === entId ? { ...e, status: 'revoked' as const } : e))
      setActionMsg('Entitlement revoked.')
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  const doGrantFullArchive = async () => {
    if (!selected || busy) return
    setBusy(true)
    try {
      await adminGrantEntitlement(selected.id, 'full_archive')
      const ents = await adminGetUserEntitlements(selected.id)
      setEntitlements(ents)
      setActionMsg('Full archive access granted.')
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  if (selected) {
    return (
      <div className="admin-section">
        <button className="admin-back" onClick={() => { setSelected(null); setActionMsg('') }}>
          <ChevronLeft size={14} /> Back to users
        </button>
        <h2>{selected.username}</h2>
        <dl className="admin-dl">
          <dt>Email</dt><dd>{selected.email}</dd>
          <dt>Role</dt><dd>{selected.role}</dd>
          <dt>Status</dt><dd>{selected.status}</dd>
          <dt>Created</dt><dd>{new Date(selected.created_at).toLocaleDateString()}</dd>
          {selected.last_login_at && <><dt>Last login</dt><dd>{new Date(selected.last_login_at).toLocaleString()}</dd></>}
        </dl>
        {actionMsg && <p className="admin-action-msg" role="status">{actionMsg}</p>}
        <div className="admin-actions">
          {selected.role !== 'owner' && selected.status === 'active' && (
            <button className="button button--danger" onClick={doSuspend} disabled={busy}>Suspend</button>
          )}
          {selected.status === 'suspended' && (
            <button className="button button--outline" onClick={doReactivate} disabled={busy}>Reactivate</button>
          )}
          <button className="button button--outline" onClick={doGrantFullArchive} disabled={busy}>
            Grant Full Archive
          </button>
        </div>
        <h3>Entitlements</h3>
        <ul className="admin-entitlement-list">
          {entitlements.map((ent) => (
            <li
              key={ent.id}
              className={`admin-entitlement-row${ent.status !== 'active' ? ' admin-entitlement-row--inactive' : ''}`}
            >
              <span>{ent.type.replace('_', ' ')}</span>
              <span>{ent.source}</span>
              <span>{ent.status}</span>
              {ent.status === 'active' && (
                <button className="button button--text" onClick={() => doRevoke(ent.id)} disabled={busy}>
                  Revoke
                </button>
              )}
            </li>
          ))}
          {entitlements.length === 0 && <li className="admin-empty">No entitlements.</li>}
        </ul>
      </div>
    )
  }

  return (
    <div className="admin-section">
      <h2>Users</h2>
      <div className="admin-search">
        <input
          type="search"
          placeholder="Search by username or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(q)}
        />
        <button className="button button--outline" onClick={() => setSearch(q)}>Search</button>
      </div>
      <AsyncSection loading={loading} error={error}>
        <ul className="admin-user-list">
          {(users ?? []).map((u) => (
            <li key={u.id} className="admin-user-row">
              <button className="admin-user-row__name" onClick={() => selectUser(u)}>{u.username}</button>
              <span>{u.email}</span>
              <span className={`admin-badge admin-badge--${u.status}`}>{u.status}</span>
              <span>{u.role}</span>
            </li>
          ))}
          {(users ?? []).length === 0 && !loading && <li className="admin-empty">No users found.</li>}
        </ul>
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ Products

const CHARACTER_OPTIONS = completeRoster.map((c) => ({ id: c.id, name: c.name }))

type ProductType = 'single_character' | 'character_pack' | 'full_archive'

function ProductsTab() {
  const { data: products, loading, error } = useAsync<AdminProduct[]>(adminGetProducts, [])
  const [editing, setEditing] = useState<string | null>(null)
  const [patchMsg, setPatchMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // creation form state
  const [showCreate, setShowCreate] = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [formType, setFormType] = useState<ProductType>('single_character')
  const [packCharIds, setPackCharIds] = useState<string[]>([])

  const doToggleActive = async (product: AdminProduct) => {
    if (busy) return
    setBusy(true)
    try {
      await adminUpdateProduct(product.id, { active: !product.active })
      setPatchMsg(`${product.name} ${product.active ? 'deactivated' : 'activated'}.`)
      setEditing(null)
    } catch (e) {
      setPatchMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  const doCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const slug = String(fd.get('slug') ?? '').trim()
    const name = String(fd.get('name') ?? '').trim()
    const description = String(fd.get('description') ?? '').trim()
    const productType = formType
    const priceAmount = Number(fd.get('priceAmount') ?? 0)
    const priceCurrency = String(fd.get('priceCurrency') ?? 'USD').trim().toUpperCase()
    const active = fd.get('active') === 'on'

    if (!slug) { setCreateMsg('Slug is required.'); return }
    if (!name) { setCreateMsg('Name is required.'); return }
    if (priceAmount < 0.01) { setCreateMsg('Price must be at least 0.01.'); return }
    if (!priceCurrency) { setCreateMsg('Currency is required.'); return }

    let resourceMapping: Record<string, unknown> | undefined
    if (productType === 'single_character') {
      const characterId = String(fd.get('characterId') ?? '').trim()
      if (!characterId) { setCreateMsg('Select a character for single_character product.'); return }
      resourceMapping = { characterId }
    } else if (productType === 'character_pack') {
      if (packCharIds.length === 0) { setCreateMsg('Select at least one character for character_pack.'); return }
      resourceMapping = { characterIds: packCharIds }
    }

    setCreateBusy(true)
    setCreateMsg('')
    try {
      await adminCreateProduct({ slug, name, description, productType, priceAmount, priceCurrency, resourceMapping, active })
      setCreateMsg('Product created.')
      setShowCreate(false)
      setPackCharIds([])
      setFormType('single_character')
    } catch (err) {
      setCreateMsg(err instanceof ApiError ? err.message : 'Failed.')
    } finally {
      setCreateBusy(false)
    }
  }

  const togglePackChar = (id: string) => {
    setPackCharIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  return (
    <div className="admin-section">
      <h2>Products</h2>

      {!showCreate && (
        <button
          className="button button--outline"
          onClick={() => { setShowCreate(true); setCreateMsg(''); setPatchMsg('') }}
        >
          <Plus size={14} aria-hidden="true" /> New product
        </button>
      )}

      {showCreate && (
        <form className="admin-product-form" onSubmit={doCreate}>
          <h3>New product</h3>
          <label>
            Slug
            <input name="slug" type="text" required placeholder="e.g. full-archive-access" />
          </label>
          <label>
            Name
            <input name="name" type="text" required placeholder="Display name" />
          </label>
          <label>
            Description
            <input name="description" type="text" placeholder="Short description (optional)" />
          </label>
          <label>
            Type
            <select name="productType" value={formType} onChange={(e) => setFormType(e.target.value as ProductType)}>
              <option value="single_character">single_character</option>
              <option value="character_pack">character_pack</option>
              <option value="full_archive">full_archive</option>
            </select>
          </label>
          <div className="admin-product-form__price">
            <label>
              Price
              <input name="priceAmount" type="number" min="0.01" step="0.01" required defaultValue="9.99" />
            </label>
            <label>
              Currency
              <input name="priceCurrency" type="text" maxLength={10} defaultValue="USD" />
            </label>
          </div>
          {formType === 'single_character' && (
            <label>
              Character
              <select name="characterId">
                <option value="">— select character —</option>
                {CHARACTER_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          )}
          {formType === 'character_pack' && (
            <div className="admin-character-picker">
              <span>Characters ({packCharIds.length} selected)</span>
              <div className="admin-character-picker__list">
                {CHARACTER_OPTIONS.map((c) => (
                  <label key={c.id} className="admin-character-option">
                    <input
                      type="checkbox"
                      checked={packCharIds.includes(c.id)}
                      onChange={() => togglePackChar(c.id)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <label className="admin-product-form__active">
            <input name="active" type="checkbox" defaultChecked />
            Active (visible to users)
          </label>
          {createMsg && (
            <p className="admin-action-msg" role={createMsg.startsWith('Product') ? 'status' : 'alert'}>
              {createMsg}
            </p>
          )}
          <div className="admin-actions">
            <button className="button button--primary" disabled={createBusy}>Create</button>
            <button type="button" className="button button--text" onClick={() => { setShowCreate(false); setCreateMsg('') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {patchMsg && <p className="admin-action-msg" role="status">{patchMsg}</p>}
      <AsyncSection loading={loading} error={error}>
        <ul className="admin-product-list">
          {(products ?? []).map((p) => (
            <li key={p.id} className="admin-product-row">
              <div className="admin-product-row__info">
                <strong>{p.name}</strong>
                <span>{p.slug}</span>
                <span>{p.product_type.replace(/_/g, ' ')}</span>
                <span>{p.price_amount} {p.price_currency.toUpperCase()}</span>
                <span className={`admin-badge admin-badge--${p.active ? 'active' : 'inactive'}`}>
                  {p.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="admin-product-row__actions">
                {editing === p.id ? (
                  <>
                    <button className="button button--outline" onClick={() => doToggleActive(p)} disabled={busy}>
                      {p.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="button button--text" onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <button
                    className="button button--text"
                    onClick={() => { setEditing(p.id); setPatchMsg('') }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </li>
          ))}
          {(products ?? []).length === 0 && !loading && <li className="admin-empty">No products.</li>}
        </ul>
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ Payments

function PaymentsTab() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const { data: payments, loading, error } = useAsync<AdminPayment[]>(
    () => adminGetPayments(search, statusFilter),
    [search, statusFilter],
  )

  const doReconcile = async (id: string) => {
    if (!confirm('Manually reconcile this payment and grant entitlement?')) return
    setBusy(id)
    setMsg('')
    try {
      const result = await adminReconcilePayment(id)
      setMsg(result.message)
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="admin-section">
      <h2>Payments</h2>
      <div className="admin-search">
        <input
          type="search"
          placeholder="Search username or payment ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(q)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
        <button className="button button--outline" onClick={() => setSearch(q)}>Search</button>
      </div>
      {msg && <p className="admin-action-msg" role="status">{msg}</p>}
      <AsyncSection loading={loading} error={error}>
        <ul className="admin-payment-list">
          {(payments ?? []).map((p) => (
            <li key={p.id} className="admin-payment-row">
              <span className="admin-payment-row__user">{p.username}</span>
              <span>{p.product_name}</span>
              <span>{p.expected_amount} {p.expected_currency.toUpperCase()}</span>
              <span className={`admin-badge admin-badge--${p.order_status}`}>{p.order_status}</span>
              <time>{new Date(p.created_at).toLocaleDateString()}</time>
              {p.order_status === 'completed' && (
                <button
                  className="button button--text"
                  onClick={() => doReconcile(p.id)}
                  disabled={busy === p.id}
                >
                  {busy === p.id ? <Loader size={12} className="spin" aria-hidden="true" /> : 'Reconcile'}
                </button>
              )}
            </li>
          ))}
          {(payments ?? []).length === 0 && !loading && <li className="admin-empty">No payments found.</li>}
        </ul>
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ Codes

function CodesTab() {
  const [codes, setCodes] = useState<AdminCode[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [newCode, setNewCode] = useState<{ id: string; code: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const loadCodes = () => {
    setLoading(true)
    adminGetCodes()
      .then(setCodes)
      .catch((e: unknown) => setLoadError(e instanceof ApiError ? e.message : 'Failed.'))
      .finally(() => setLoading(false))
  }

  useEffect(loadCodes, [])

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const maxUses = Number(data.get('maxUses') ?? 1)
    setBusy(true)
    setMsg('')
    setNewCode(null)
    try {
      const result = await adminCreateCode({ maxUses })
      setNewCode(result)
      loadCodes()
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  const copyCode = async () => {
    if (!newCode) return
    await navigator.clipboard.writeText(newCode.code).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const doDeactivate = async (id: string) => {
    if (busy) return
    setBusy(true)
    try {
      await adminDeactivateCode(id)
      loadCodes()
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : 'Failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-section">
      <h2>Redemption Codes</h2>
      <form className="admin-code-form" onSubmit={handleGenerate}>
        <label>
          Max uses
          <input name="maxUses" type="number" min={1} max={10000} defaultValue={1} style={{ width: '5rem' }} />
        </label>
        <button className="button button--primary" disabled={busy}>Generate code</button>
      </form>
      {newCode && (
        <div className="admin-new-code" role="status">
          <strong>New code (shown once):</strong>
          <code className="admin-new-code__value">{newCode.code}</code>
          <button className="button button--outline" onClick={copyCode}>
            {copied ? <Check size={14} aria-hidden="true" /> : <ClipboardCopy size={14} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      {msg && <p className="admin-action-msg" role="alert">{msg}</p>}
      <AsyncSection loading={loading} error={loadError}>
        <ul className="admin-code-list">
          {codes.map((c) => (
            <li key={c.id} className="admin-code-row">
              <span className="admin-code-row__id">{c.id.slice(0, 8)}…</span>
              <span>{c.uses}/{c.max_uses} uses</span>
              {c.product_name && <span>{c.product_name}</span>}
              <span className={`admin-badge admin-badge--${c.active ? 'active' : 'inactive'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              {c.expires_at && <time>Expires {new Date(c.expires_at).toLocaleDateString()}</time>}
              {c.active && (
                <button className="button button--text" onClick={() => doDeactivate(c.id)} disabled={busy}>
                  Deactivate
                </button>
              )}
            </li>
          ))}
          {codes.length === 0 && !loading && <li className="admin-empty">No codes.</li>}
        </ul>
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ Audit

function AuditTab() {
  const [offset, setOffset] = useState(0)
  const limit = 50
  const { data: logs, loading, error } = useAsync<AuditLog[]>(
    () => adminGetAudit(limit, offset),
    [offset],
  )

  return (
    <div className="admin-section">
      <h2>Audit Log</h2>
      <AsyncSection loading={loading} error={error}>
        <ul className="admin-audit-list">
          {(logs ?? []).map((log) => (
            <li key={log.id} className="admin-audit-row">
              <time>{new Date(log.created_at).toLocaleString()}</time>
              <code>{log.action}</code>
              {log.actor_username && <span>{log.actor_username}</span>}
              {log.target_type && <span>{log.target_type}</span>}
              {log.target_id && <span className="admin-audit-row__target">{log.target_id.slice(0, 8)}</span>}
            </li>
          ))}
          {(logs ?? []).length === 0 && !loading && <li className="admin-empty">No audit logs.</li>}
        </ul>
        <div className="admin-pagination">
          <button
            className="button button--outline"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
          >
            Previous
          </button>
          <button
            className="button button--outline"
            disabled={(logs ?? []).length < limit}
            onClick={() => setOffset(offset + limit)}
          >
            Next
          </button>
        </div>
      </AsyncSection>
    </div>
  )
}

// ------------------------------------------------------------------ AdminPage

const tabConfig: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} aria-hidden="true" /> },
  { id: 'users', label: 'Users', icon: <Users size={16} aria-hidden="true" /> },
  { id: 'products', label: 'Products', icon: <Package size={16} aria-hidden="true" /> },
  { id: 'payments', label: 'Payments', icon: <Tags size={16} aria-hidden="true" /> },
  { id: 'codes', label: 'Codes', icon: <Ticket size={16} aria-hidden="true" /> },
  { id: 'audit', label: 'Audit', icon: <FileText size={16} aria-hidden="true" /> },
]

export default function AdminPage({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState<AdminTab>('dashboard')

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-header__title">
          <ShieldAlert size={20} aria-hidden="true" />
          <h1>Admin</h1>
        </div>
        {onBack && (
          <button className="button button--text admin-header__back" onClick={onBack}>
            <ChevronLeft size={14} aria-hidden="true" /> Back to archive
          </button>
        )}
      </header>
      <nav className="admin-tabs" aria-label="Admin sections">
        {tabConfig.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`admin-tab${tab === id ? ' admin-tab--active' : ''}`}
            onClick={() => setTab(id)}
            aria-current={tab === id ? 'page' : undefined}
          >
            {icon} {label}
          </button>
        ))}
      </nav>
      <div className="admin-content">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'codes' && <CodesTab />}
        {tab === 'audit' && <AuditTab />}
      </div>
    </main>
  )
}
