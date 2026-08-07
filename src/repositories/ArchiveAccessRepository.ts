// ------------------------------------------------------------------ types

export type UserRole = 'owner' | 'user'

export type ArchiveAccessState =
  | {
      status: 'signed-out'
      freeCharacterIds: string[]
      characterIds: string[]
      fullArchive: false
      highestPackage: null
    }
  | {
      status: 'signed-in'
      userId: string
      username: string
      email: string
      role: UserRole
      entitlement: 'active' | 'missing' | 'revoked'
      freeCharacterIds: string[]
      characterIds: string[]
      fullArchive: boolean
      highestPackage: 'starter' | 'plus' | 'full' | null
    }

export type ApiErrorCode =
  | 'validation_failure'
  | 'invalid_credentials'
  | 'suspended_account'
  | 'unauthorized'
  | 'forbidden'
  | 'backend_waking'
  | 'unavailable'
  | 'payment_provider_unavailable'
  | 'conflict'
  | 'unknown'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export type EntitlementSummary = {
  id: string
  type: 'character' | 'pack' | 'full_archive'
  status: 'active' | 'revoked' | 'expired'
  source: 'payment' | 'redemption' | 'admin'
  grantedAt: string
  expiresAt: string | null
  resourceMapping: Record<string, unknown>
}

export type OrderSummary = {
  id: string
  productName: string
  orderStatus: 'pending' | 'completed' | 'failed' | 'expired' | 'processing'
  expectedAmount: string
  expectedCurrency: string
  checkoutUrl: string | null
  createdAt: string
  fulfilledAt: string | null
}

export type Product = {
  id: string
  slug: string
  name: string
  description: string
  product_type: 'single_character' | 'character_pack' | 'full_archive'
  price_amount: string
  price_currency: string
  active: boolean
}

export type CheckoutResult = {
  orderId: string
  checkoutUrl: string | null
  productName: string
  priceAmount: number
  priceCurrency: string
}

// ------------------------------------------------------------------ CSRF token cache

const apiBase = (import.meta.env.VITE_ARCHIVE_API_URL as string | undefined)?.replace(/\/$/, '')

export const archiveAccountApiConfigured = Boolean(apiBase)

let csrfTokenCache: string | null = null

function invalidateCsrfToken() {
  csrfTokenCache = null
}

async function fetchCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache
  if (!apiBase) throw new ApiError('unavailable', 'The archive API is not configured.')
  const res = await fetch(`${apiBase}/v1/auth/csrf`, { credentials: 'include' })
  if (!res.ok) throw new ApiError('unavailable', 'Failed to initialize session.')
  const data = await res.json() as { csrfToken: string }
  csrfTokenCache = data.csrfToken
  return csrfTokenCache
}

// ------------------------------------------------------------------ core fetch

async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  opts: { skipCsrf?: boolean; _isRetry?: boolean } = {},
): Promise<T> {
  if (!apiBase) throw new ApiError('unavailable', 'The archive API is not configured.')

  const method = (init.method ?? 'GET').toUpperCase()
  const needsCsrf = !opts.skipCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  }

  if (needsCsrf) {
    headers['x-csrf-token'] = await fetchCsrfToken()
  }

  let res: Response
  try {
    res = await fetch(`${apiBase}${path}`, { ...init, credentials: 'include', headers })
  } catch {
    throw new ApiError('backend_waking', 'The archive server is waking up. Please wait a moment and try again.')
  }

  if (res.status === 403 && needsCsrf && !opts._isRetry) {
    invalidateCsrfToken()
    return apiRequest<T>(path, init, { ...opts, _isRetry: true })
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({})) as { error?: string }
    const msg = payload.error ?? 'Request failed.'
    throw new ApiError(statusToCode(res.status, msg), msg, res.status)
  }

  return res.json() as Promise<T>
}

function statusToCode(status: number, message: string): ApiErrorCode {
  if (status === 401) {
    if (message.toLowerCase().includes('suspend')) return 'suspended_account'
    return 'invalid_credentials'
  }
  if (status === 403) return 'forbidden'
  if (status === 409) return 'conflict'
  if (status === 400) return 'validation_failure'
  if (status === 503) {
    if (message.toLowerCase().includes('payment')) return 'payment_provider_unavailable'
    return 'unavailable'
  }
  if (status === 429) return 'unavailable'
  if (status >= 500) return 'unavailable'
  return 'unknown'
}

// ------------------------------------------------------------------ auth

export async function signIn(username: string, password: string): Promise<ArchiveAccessState> {
  const state = await apiRequest<ArchiveAccessState>('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  invalidateCsrfToken()
  return state
}

export async function signUp(
  username: string,
  email: string,
  password: string,
): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>('/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export async function signOut(): Promise<void> {
  await apiRequest('/v1/auth/logout', { method: 'POST' })
  invalidateCsrfToken()
}

export async function getAccessState(): Promise<ArchiveAccessState> {
  return apiRequest<ArchiveAccessState>('/v1/auth/me', {}, { skipCsrf: true })
}

// ------------------------------------------------------------------ account

export async function getEntitlements(): Promise<EntitlementSummary[]> {
  const data = await apiRequest<{ entitlements: EntitlementSummary[] }>('/v1/account/entitlements', {}, { skipCsrf: true })
  return data.entitlements
}

export async function getOrders(): Promise<OrderSummary[]> {
  const data = await apiRequest<{ orders: OrderSummary[] }>('/v1/account/orders', {}, { skipCsrf: true })
  return data.orders
}

export async function redeemCode(code: string): Promise<{ ok: true; access: ArchiveAccessState }> {
  return apiRequest<{ ok: true; access: ArchiveAccessState }>('/v1/account/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

// ------------------------------------------------------------------ products

export async function getProducts(): Promise<Product[]> {
  const data = await apiRequest<{ products: Product[] }>('/v1/products', {}, { skipCsrf: true })
  return data.products
}

// ------------------------------------------------------------------ payments

export async function createCheckout(productId: string): Promise<CheckoutResult> {
  return apiRequest<CheckoutResult>('/v1/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  })
}

export async function getOrder(id: string): Promise<OrderSummary> {
  return apiRequest<OrderSummary>(`/v1/payments/orders/${id}`, {}, { skipCsrf: true })
}

// ------------------------------------------------------------------ admin types

export type AdminDashboard = {
  users: { total: string; active: string; suspended: string }
  entitlements: { active_count: string }
  payments: { pending: string; completed: string; failed: string }
  recentRedemptions: string
  recentAudit: Array<{ id: string; action: string; target_type: string | null; created_at: string }>
}

export type AdminUser = {
  id: string; username: string; email: string; role: string
  status: string; created_at: string; last_login_at: string | null
}

export type AdminProduct = {
  id: string; slug: string; name: string; description: string
  product_type: string; price_amount: string; price_currency: string
  active: boolean; created_at: string
}

export type AdminPayment = {
  id: string; order_status: string; expected_amount: string; expected_currency: string
  provider_payment_id: string | null; created_at: string; fulfilled_at: string | null
  username: string; product_name: string
}

export type AdminCode = {
  id: string; max_uses: number; uses: number; active: boolean
  expires_at: string | null; created_at: string; product_name: string | null
}

export type AuditLog = {
  id: string; action: string; target_type: string | null; target_id: string | null
  metadata: Record<string, unknown>; created_at: string; actor_username: string | null
}

// ------------------------------------------------------------------ admin API

export async function adminGetDashboard(): Promise<AdminDashboard> {
  return apiRequest<AdminDashboard>('/v1/admin/dashboard', {}, { skipCsrf: true })
}

export async function adminGetUsers(q?: string): Promise<AdminUser[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : ''
  const data = await apiRequest<{ users: AdminUser[] }>(`/v1/admin/users${qs}`, {}, { skipCsrf: true })
  return data.users
}

export async function adminSuspendUser(id: string): Promise<void> {
  await apiRequest(`/v1/admin/users/${id}/suspend`, { method: 'POST', body: '{}' })
}

export async function adminReactivateUser(id: string): Promise<void> {
  await apiRequest(`/v1/admin/users/${id}/reactivate`, { method: 'POST', body: '{}' })
}

export async function adminGetUserEntitlements(userId: string): Promise<EntitlementSummary[]> {
  const data = await apiRequest<{ entitlements: EntitlementSummary[] }>(`/v1/admin/users/${userId}/entitlements`, {}, { skipCsrf: true })
  return data.entitlements
}

export async function adminGrantEntitlement(
  userId: string,
  entitlementType: 'character' | 'pack' | 'full_archive',
  resourceMapping?: Record<string, unknown>,
): Promise<void> {
  await apiRequest(`/v1/admin/users/${userId}/entitlements`, {
    method: 'POST',
    body: JSON.stringify({ entitlementType, resourceMapping }),
  })
}

export async function adminRevokeEntitlement(entitlementId: string): Promise<void> {
  await apiRequest(`/v1/admin/entitlements/${entitlementId}`, { method: 'DELETE' })
}

export async function adminGetProducts(): Promise<AdminProduct[]> {
  const data = await apiRequest<{ products: AdminProduct[] }>('/v1/admin/products', {}, { skipCsrf: true })
  return data.products
}

export async function adminCreateProduct(body: {
  slug: string; name: string; productType: string
  priceAmount: number; priceCurrency: string; description?: string
  resourceMapping?: Record<string, unknown>; active?: boolean
}): Promise<{ id: string }> {
  return apiRequest<{ id: string }>('/v1/admin/products', { method: 'POST', body: JSON.stringify(body) })
}

export async function adminUpdateProduct(
  id: string,
  patch: { name?: string; priceAmount?: number; priceCurrency?: string; active?: boolean },
): Promise<void> {
  await apiRequest(`/v1/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export async function adminGetPayments(q?: string, status?: string): Promise<AdminPayment[]> {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (status) params.set('status', status)
  const qs = params.toString() ? `?${params.toString()}` : ''
  const data = await apiRequest<{ payments: AdminPayment[] }>(`/v1/admin/payments${qs}`, {}, { skipCsrf: true })
  return data.payments
}

export async function adminReconcilePayment(id: string): Promise<{ ok: boolean; message: string }> {
  return apiRequest<{ ok: boolean; message: string }>(`/v1/admin/payments/${id}/reconcile`, {
    method: 'POST', body: '{}',
  })
}

export async function adminGetCodes(): Promise<AdminCode[]> {
  const data = await apiRequest<{ codes: AdminCode[] }>('/v1/admin/codes', {}, { skipCsrf: true })
  return data.codes
}

export async function adminCreateCode(body: {
  maxUses: number; productId?: string; expiresAt?: string
}): Promise<{ id: string; code: string }> {
  return apiRequest<{ id: string; code: string }>('/v1/admin/codes', { method: 'POST', body: JSON.stringify(body) })
}

export async function adminDeactivateCode(id: string): Promise<void> {
  await apiRequest(`/v1/admin/codes/${id}/deactivate`, { method: 'POST', body: '{}' })
}

export async function adminGetAudit(limit = 50, offset = 0): Promise<AuditLog[]> {
  const data = await apiRequest<{ logs: AuditLog[] }>(
    `/v1/admin/audit?limit=${limit}&offset=${offset}`,
    {},
    { skipCsrf: true },
  )
  return data.logs
}

// ------------------------------------------------------------------ legacy compat (AccountPages.tsx + CharacterPackPicker.tsx)

export const archiveAccessRepository = {
  signIn,
  signOut,
  getAccessState,
  requestPasswordReset: (_email: string) => Promise.reject(new ApiError('forbidden', 'Password reset is not available.')),
}
