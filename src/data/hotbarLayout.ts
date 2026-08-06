import type { HotbarAnchor, HotbarLayout } from '../types/hotbarLayout'
import type { HotbarKey } from '../types/shindoGame'

const ownerReference = (
  id: string,
  displayedKey: string,
  sourceKey: HotbarKey | null,
  centerX: number,
  category: HotbarAnchor['category'],
  confirmed = false,
): HotbarAnchor => ({
  id,
  displayedKey,
  sourceKey,
  xPercent: ((centerX - 22) / 754) * 100,
  yPercent: (24 / 139) * 100,
  widthPercent: (44 / 754) * 100,
  heightPercent: (44 / 139) * 100,
  category,
  mappingStatus: confirmed ? 'Confirmed visual position' : 'Control mapping requires owner confirmation',
})

export const current249OwnerReference: HotbarLayout = {
  id: 'current-249-owner-reference',
  name: 'Current 249 owner reference',
  gameVersion: '249/249.5',
  framePath: '/shindo-ui/hotbar-frame.webp',
  aspectRatio: 754 / 139,
  anchors: [
    ownerReference('owner-1', '1', '1', 48, 'General', true),
    ownerReference('owner-2', '2', '2', 100, 'General', true),
    ownerReference('owner-3', '3', '3', 152, 'General', true),
    ownerReference('owner-4', '4', '4', 204, 'General', true),
    ownerReference('owner-5', '5', '5', 255, 'General', true),
    ownerReference('owner-t', 'T', 'T', 307, 'General', true),
    ownerReference('owner-z', 'Z', 'Z', 374, 'Mode', true),
    ownerReference('owner-f', 'F', 'V', 425, 'Bloodline'),
    ownerReference('owner-rmb-g', 'RMB+G', 'B', 477, 'Bloodline'),
    ownerReference('owner-g', 'G', 'N', 529, 'Bloodline'),
    ownerReference('owner-q', 'Q', 'Q', 581, 'Weapon', true),
    ownerReference('owner-e', 'E', 'C', 633, 'Mode'),
    ownerReference('owner-r', 'R', null, 685, 'Utility'),
  ],
  notes: [
    'The screenshot confirms visual key positions, not the mechanical source assigned to each control.',
    'F, RMB+G, G, and E translations from the archive V/B/N/C model require owner confirmation.',
    'R is visible in the owner HUD but has no canonical archive mapping yet.',
  ],
}

export const legacyArchiveLayout: HotbarLayout = {
  id: 'legacy-archive-layout',
  name: 'Legacy archive technical layout',
  gameVersion: '249/249.5 research model',
  framePath: null,
  aspectRatio: 6,
  anchors: [],
  notes: ['Uses canonical archive keys 1–5, T, V, B, N, C, Z, and Q for legality review.'],
}

export const hotbarLayouts = [current249OwnerReference, legacyArchiveLayout] as const
