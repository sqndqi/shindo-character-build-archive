export const CHECKOUT_ORDER_KEY = 'shindo-archive:pending-order-id'

export function getStoredOrderId(): string | null {
  try { return sessionStorage.getItem(CHECKOUT_ORDER_KEY) } catch { return null }
}

export function storeOrderId(id: string): void {
  try { sessionStorage.setItem(CHECKOUT_ORDER_KEY, id) } catch { /* private browsing */ }
}

export function clearStoredOrderId(): void {
  try { sessionStorage.removeItem(CHECKOUT_ORDER_KEY) } catch { /* ignore */ }
}

// Validates that a checkout URL is HTTPS from the expected NOWPayments domain.
// Never redirect to an unverified URL — prevents open redirect injection.
export function validateCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'nowpayments.io' || parsed.hostname.endsWith('.nowpayments.io'))
    )
  } catch {
    return false
  }
}
