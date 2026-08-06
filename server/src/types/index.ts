export type UserRole = 'user' | 'moderator' | 'admin' | 'owner'
export type UserStatus = 'active' | 'suspended' | 'deleted'
export type EntitlementType = 'character' | 'pack' | 'full_archive'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'refunded'

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

export interface EntitlementSummary {
  id: string
  type: EntitlementType
  status: 'active' | 'revoked' | 'expired'
  source: 'payment' | 'redemption' | 'admin' | 'owner'
  grantedAt: string
  expiresAt: string | null
  resourceMapping: Record<string, unknown>
}

export interface OrderSummary {
  id: string
  productName: string
  orderStatus: OrderStatus
  expectedAmount: string
  expectedCurrency: string
  checkoutUrl: string | null
  createdAt: string
  fulfilledAt: string | null
}

export const FREE_CHARACTER_IDS = [
  'zack-lee',
  'vasco',
  'gray-yeon',
  'yu',
  'jin-mori',
] as const
