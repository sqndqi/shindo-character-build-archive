import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const outputDirectory = path.join(root, 'public', 'characters')

const portraits = [
  ['james-lee', 'James Lee', 'https://lookism.fandom.com', 'Diego Kang'],
  ['seongji-yuk', 'Seongji Yuk', 'https://lookism.fandom.com', 'Seongji Yuk'],
  ['gun-park', 'Gun Park', 'https://lookism.fandom.com', 'Gun Park'],
  ['little-daniel-park', 'Little Daniel Park', 'https://lookism.fandom.com', 'Daniel Park'],
  ['johan-seong', 'Johan Seong', 'https://lookism.fandom.com', 'Johan Seong'],
  ['kitae-kim', 'Kitae Kim', 'https://lookism.fandom.com', 'Kitae Kim'],
  ['goo-kim', 'Goo Kim', 'https://lookism.fandom.com', 'Goo Kim'],
  ['jake-kim', 'Jake Kim', 'https://lookism.fandom.com', 'Jake Kim'],
  ['eli-jang', 'Eli Jang', 'https://lookism.fandom.com', 'Eli Jang'],
  ['zack-lee', 'Zack Lee', 'https://lookism.fandom.com', 'Zack Lee'],
  ['jin-mori', 'Jin Mori', 'https://godofhighschool.fandom.com', 'Jin Mori'],
  ['han-daewi', 'Han Daewi', 'https://godofhighschool.fandom.com', 'Han Daewi'],
  ['sung-jinwoo', 'Sung Jinwoo', 'https://solo-leveling.fandom.com', 'Sung Jinwoo'],
  ['cheon-yeo-woon', 'Cheon Yeo-Woon', 'https://nano-mashine.fandom.com', 'Cheon Yeo Woon'],
  ['jin-mu-won', 'Jin Mu-Won', 'https://legend-of-the-northern-blade.fandom.com', 'Jin Mu-Won'],
  ['kayden-break', 'Kayden Break', 'https://eleceed.fandom.com', 'Kayden'],
  ['yu', 'Yu', 'https://the-boxer.fandom.com', 'Yu'],
  ['barolt', 'Barolt', 'https://survival-story-of-a-sword-king-in-a-fantasy-world.fandom.com', 'Barolt'],
  ['arthur-leywin', 'Arthur Leywin', 'https://tbate.fandom.com', 'Arthur Leywin'],
  ['gray-yeon', 'Gray Yeon', 'https://weakhero.fandom.com', 'Gray Yeon'],
]

const headers = { 'User-Agent': 'ShindoBuildArchive/1.0 (local fan project)' }
const sources = []

await mkdir(outputDirectory, { recursive: true })

for (const [id, name, wiki, title] of portraits) {
  const api = new URL('/api.php', wiki)
  api.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'pageimages',
    pithumbsize: '1600',
    titles: title,
  })

  const apiResponse = await fetch(api, { headers })
  if (!apiResponse.ok) throw new Error(`${name}: wiki API returned ${apiResponse.status}`)
  const data = await apiResponse.json()
  const page = Object.values(data.query?.pages ?? {})[0]
  const imageUrl = page?.thumbnail?.source
  if (!imageUrl) throw new Error(`${name}: no lead image found on ${wiki}`)

  const imageResponse = await fetch(imageUrl, { headers })
  if (!imageResponse.ok) throw new Error(`${name}: image download returned ${imageResponse.status}`)
  const image = Buffer.from(await imageResponse.arrayBuffer())

  await sharp(image)
    .resize(700, 920, {
      fit: 'cover',
      position: 'north',
      background: { r: 10, g: 10, b: 10 },
    })
    .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
    .toFile(path.join(outputDirectory, `${id}.jpg`))

  const pageUrl = `${wiki}/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`
  sources.push({ name, pageUrl, imageUrl })
  console.log(`synced ${name}`)
}

const table = sources
  .map(({ name, pageUrl, imageUrl }) => `| ${name} | [Wiki page](${pageUrl}) | [Direct image](${imageUrl}) |`)
  .join('\n')

await writeFile(path.join(root, 'IMAGE_SOURCES.md'), `# Character portrait sources

The app stores normalized local copies of the lead character images returned by each community wiki's MediaWiki API. Images are resized and cropped for the portrait card layout; no remote image is loaded at runtime.

These images depict copyrighted characters and artwork from their respective manhwa or adaptations. They are included for identification in this non-commercial fan archive. Copyright remains with the original creators, artists, publishers, and other rights holders. Community-wiki page text and contributions may have separate licenses; consult each linked page for its terms.

| Character | Source page | Resolved asset |
| --- | --- | --- |
${table}

## Refreshing the local files

Run \`npm run sync:portraits\`. The script resolves the current lead image from each source page, writes a 700×920 JPEG to \`public/characters/\`, and regenerates this manifest.
`)
