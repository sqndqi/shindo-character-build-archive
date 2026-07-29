import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const sources = [
  ['naruto-uzumaki', 'https://static.wikia.nocookie.net/naruto/images/d/dc/Naruto%27s_Sage_Mode.png/revision/latest?cb=20150124180545'],
  ['sasuke-uchiha', 'https://static.wikia.nocookie.net/naruto/images/6/6a/Sasuke_The_Last.png/revision/latest?cb=20150711121636'],
  ['madara-uchiha', 'https://static.wikia.nocookie.net/naruto/images/7/7f/Madara_Jinchuriki_anime.png/revision/latest?cb=20260108183827'],
  ['minato-namikaze', 'https://static.wikia.nocookie.net/naruto/images/1/1f/Minato_KCM_Naruto_Mobile.png/revision/latest?cb=20251121212201'],
  ['itachi-uchiha', 'https://static.wikia.nocookie.net/naruto/images/5/5e/Itachi_Akatsuki.png/revision/latest?cb=20260212215738'],
  ['boruto-uzumaki', 'https://static.wikia.nocookie.net/naruto/images/4/4a/Boruto-TBV.png/revision/latest?cb=20260528223214'],
  ['ichigo-kurosaki', 'https://static.wikia.nocookie.net/bleach/images/5/52/591Ichigo_profile.png/revision/latest?cb=20190129174528&path-prefix=en'],
  ['sosuke-aizen', 'https://static.wikia.nocookie.net/bleach/images/5/5f/Ep300AizenSecondFusion.png/revision/latest?cb=20220916173647&path-prefix=en', 'north'],
  ['monkey-d-luffy-snakeman', 'https://static.wikia.nocookie.net/onepiece/images/6/6a/Luffy_Snakeman_Pirate_Warriors_4.png/revision/latest?cb=20191216211506'],
  ['jotaro-kujo', 'https://static.wikia.nocookie.net/jjba/images/0/01/JotaroProfile.png/revision/latest?cb=20191125014406'],
]

const root = process.cwd()
const portraitDir = join(root, 'public', 'characters', 'anime')
const thumbnailDir = join(root, 'public', 'characters', 'thumbs')

await mkdir(portraitDir, { recursive: true })
await mkdir(thumbnailDir, { recursive: true })

for (const [id, url, thumbnailPosition = sharp.strategy.attention] of sources) {
  const response = await fetch(url, { headers: { 'user-agent': 'ShindoCharacterBuildArchive/1.0' } })
  if (!response.ok) throw new Error(`${id}: image download returned ${response.status}`)
  const source = Buffer.from(await response.arrayBuffer())
  await sharp(source)
    .rotate()
    .resize(900, 1200, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 86, progressive: true })
    .toFile(join(portraitDir, `${id}.jpg`))
  await sharp(source)
    .rotate()
    .resize(480, 300, { fit: 'cover', position: thumbnailPosition })
    .webp({ quality: 80 })
    .toFile(join(thumbnailDir, `${id}.webp`))
}

console.log(`Wrote ${sources.length} portraits and ${sources.length} thumbnails.`)
