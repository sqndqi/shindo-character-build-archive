import type { CharacterBuild } from '../types'
import { reviewedBuilds } from './reviewedBuilds'

export const animeMangaBuilds: CharacterBuild[] = reviewedBuilds.filter((build) => build.media === 'Manga / Anime')
