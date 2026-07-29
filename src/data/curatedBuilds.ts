import { reviewedBuilds } from './reviewedBuilds'

export const curatedBuilds = reviewedBuilds.filter((build) => build.media !== 'Manga / Anime')
