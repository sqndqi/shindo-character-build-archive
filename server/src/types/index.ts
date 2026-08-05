export type ArchiveAccessState =
  | { status: 'signed-out' }
  | {
      status: 'signed-in'
      email: string
      entitlement: 'active' | 'missing' | 'revoked'
      characterIds?: string[]
      fullArchive?: boolean
      highestPackage?: 'starter' | 'plus' | 'full' | null
    }

export const FREE_CHARACTER_IDS = [
  'zack-lee',
  'vasco',
  'gray-yeon',
  'yu',
  'jin-mori',
] as const
