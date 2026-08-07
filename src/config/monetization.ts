export const AUTH_ENABLED = true
export const PAYMENTS_ENABLED = false

export interface DonationConfig {
  current: number
  target: number
  currency: string
  label: string
}

/** Set to a real config object once donation tracking is wired. */
export const DONATION_CONFIG: DonationConfig | null = null

export const COMMUNITY_LINKS = {
  discord: 'https://discord.gg/agarthia',
  robloxGroup: 'https://www.roblox.com/communities/33793413/Agarthia#!/about',
} as const
