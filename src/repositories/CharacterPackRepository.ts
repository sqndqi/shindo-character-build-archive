import type { PackDraft, PackType } from '../hooks/useCharacterPackDraft'

type ConfirmedPackOrder = {
  order: { id: string }
  quote: { displayPrice: string; newSelectionsRequired: number }
}

type CheckoutResult = {
  checkoutUrl: string
  providerOrderId: string
}

const apiBase = (import.meta.env.VITE_ARCHIVE_API_URL as string | undefined)?.replace(/\/$/, '')

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!apiBase) throw new Error('Secure checkout is disabled in local staging.')
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...init.headers },
  })
  if (!response.ok) throw new Error('The character-pack service could not complete this request.')
  return response.json() as Promise<T>
}

export interface CharacterPackRepository {
  confirmSelection(packageType: PackType, draft: PackDraft, effectiveIds: string[]): Promise<ConfirmedPackOrder>
  createCheckout(orderId: string, provider: 'stripe' | 'manual_crypto'): Promise<CheckoutResult>
}

class HttpCharacterPackRepository implements CharacterPackRepository {
  confirmSelection(packageType: PackType, draft: PackDraft, effectiveIds: string[]) {
    return request<ConfirmedPackOrder>('/v1/archive/packs/selection', {
      method: 'POST',
      body: JSON.stringify({
        packageType,
        selections: effectiveIds.map((characterId) => ({
          characterId,
          selectionType: draft.selections[characterId] ?? 'manual',
        })),
      }),
    })
  }

  createCheckout(orderId: string, provider: 'stripe' | 'manual_crypto') {
    return request<CheckoutResult>(`/v1/archive/packs/${encodeURIComponent(orderId)}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ provider }),
    })
  }
}

export const characterPackRepository: CharacterPackRepository = new HttpCharacterPackRepository()
