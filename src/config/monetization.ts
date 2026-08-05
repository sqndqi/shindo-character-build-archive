/**
 * Phase 3B monetization feature flags.
 * Set ROBUX_PRODUCT_ID and ROBUX_PRODUCT_PRICE via environment variables or
 * a future admin config. Do not hardcode real prices or developer-product IDs.
 */

export const ROBUX_PAYMENT_ENABLED = false
export const PREMIUM_PLUS_ENABLED = false

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
