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
  'james-lee': { focalX: 50, focalY: 16, heroScale: 1.12, cardScale: 1.06, heroPosition: '50% 16%', cardPosition: '50% 14%' },
  'goo-kim': { focalX: 52, focalY: 18, heroScale: 1.04, cardScale: 1.03, heroPosition: '52% 18%' },
  'anime-sasuke-uchiha': { focalX: 50, focalY: 18, heroPosition: '50% 18%' },
  'anime-ichigo-kurosaki': { focalX: 50, focalY: 17, heroPosition: '50% 17%' },
}

export function portraitPresentation(buildId: string): PortraitPresentation {
  return { ...defaultPresentation, ...presentations[buildId] }
}
