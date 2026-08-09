import { originalCharacters } from './characters'

// Anime/manga characters only exist in reviewedBuilds.ts, which contains full premium
// build data. To avoid bundling that data publicly, we list just their id/name here.
// This file MUST NOT import from reviewedBuilds, curatedBuilds, or animeMangaBuilds.
const ANIME_MANGA_INDEX: { id: string; name: string }[] = [
  { id: 'anime-naruto-uzumaki', name: 'Naruto Uzumaki' },
  { id: 'anime-sasuke-uchiha', name: 'Sasuke Uchiha' },
  { id: 'anime-madara-uchiha', name: 'Madara Uchiha' },
  { id: 'anime-minato-namikaze', name: 'Minato Namikaze' },
  { id: 'anime-itachi-uchiha', name: 'Itachi Uchiha' },
  { id: 'anime-boruto-uzumaki', name: 'Boruto Uzumaki' },
  { id: 'anime-ichigo-kurosaki', name: 'Ichigo Kurosaki' },
  { id: 'anime-sosuke-aizen', name: 'Sōsuke Aizen' },
  { id: 'anime-monkey-d-luffy-snakeman', name: 'Monkey D. Luffy' },
  { id: 'anime-jotaro-kujo', name: 'Jotaro Kujo' },
]

export const rosterIndex: { id: string; name: string }[] = [
  ...originalCharacters.map((c) => ({ id: c.id, name: c.name })),
  ...ANIME_MANGA_INDEX,
]
