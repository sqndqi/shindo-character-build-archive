export interface PortraitPresentation {
  focalX: number
  focalY: number
  heroScale: number
  cardScale: number
  heroPosition: string
  cardPosition: string
}

const defaultPresentation: PortraitPresentation = {
  focalX: 50,
  focalY: 20,
  heroScale: 1,
  cardScale: 1,
  heroPosition: '50% 20%',
  cardPosition: '50% 22%',
}

const presentations: Record<string, Partial<PortraitPresentation>> = {
  // Free builds — face positions verified against source images
  'zack-lee': { focalX: 50, focalY: 22, heroScale: 1.04, heroPosition: '50% 22%', cardPosition: '50% 18%' },
  'vasco': { focalX: 50, focalY: 28, heroPosition: '50% 28%', cardPosition: '50% 24%' },
  'gray-yeon': { focalX: 50, focalY: 30, heroScale: 1.06, heroPosition: '50% 30%', cardPosition: '50% 26%' },
  'yu': { focalX: 50, focalY: 14, heroPosition: '50% 14%', cardPosition: '50% 10%' },
  'jin-mori': { focalX: 52, focalY: 28, heroScale: 1.04, heroPosition: '52% 28%', cardPosition: '52% 24%' },
  // Priority builds with confirmed crop issues
  'james-lee': { focalX: 50, focalY: 16, heroScale: 1.12, cardScale: 1.06, heroPosition: '50% 16%', cardPosition: '50% 14%' },
  'goo-kim': { focalX: 52, focalY: 18, heroScale: 1.04, cardScale: 1.03, heroPosition: '52% 18%' },
  'anime-sasuke-uchiha': { focalX: 50, focalY: 18, heroPosition: '50% 18%' },
  'anime-ichigo-kurosaki': { focalX: 50, focalY: 17, heroPosition: '50% 17%' },
}

export function portraitPresentation(buildId: string): PortraitPresentation {
  return { ...defaultPresentation, ...presentations[buildId] }
}
