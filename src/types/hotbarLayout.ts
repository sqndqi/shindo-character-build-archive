import type { HotbarKey } from './shindoGame'

export type HotbarAnchorCategory = 'General' | 'Bloodline' | 'Mode' | 'Weapon' | 'Combat Art' | 'Kenjutsu' | 'Utility'
export type ControlMappingStatus = 'Confirmed visual position' | 'Control mapping requires owner confirmation'

export interface HotbarAnchor {
  id: string
  displayedKey: string
  sourceKey: HotbarKey | null
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
  category: HotbarAnchorCategory
  mappingStatus: ControlMappingStatus
}

export interface HotbarLayout {
  id: 'current-249-owner-reference' | 'legacy-archive-layout'
  name: string
  gameVersion: string
  framePath: string | null
  aspectRatio: number
  anchors: HotbarAnchor[]
  notes: string[]
}
