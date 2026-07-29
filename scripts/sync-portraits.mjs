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
  ['tom-lee', 'Tom Lee', 'https://lookism.fandom.com', 'Tom Lee'],
  ['gapryong-kim', 'Gapryong Kim', 'https://lookism.fandom.com', 'Gapryong Kim'],
  ['jinyoung-park', 'Jinyoung Park', 'https://lookism.fandom.com', 'Jinyeong Park'],
  ['charles-choi', 'Charles Choi', 'https://lookism.fandom.com', 'Charles Choi'],
  ['shingen-yamazaki', 'Shingen Yamazaki', 'https://lookism.fandom.com', 'Shingen Yamazaki'],
  ['shintaro-yamazaki', 'Shintaro Yamazaki', 'https://lookism.fandom.com', 'Shintaro Yamazaki'],
  ['samuel-seo', 'Samuel Seo', 'https://lookism.fandom.com', 'Samuel Seo'],
  ['vasco', 'Vasco', 'https://lookism.fandom.com', 'Euntae Lee'],
  ['vin-jin', 'Vin Jin', 'https://lookism.fandom.com', 'Vin Jin'],
  ['jaegyeon-na', 'Jaegyeon Na', 'https://lookism.fandom.com', 'Jaegyeon Na'],
  ['jichang-kwak', 'Jichang Kwak', 'https://lookism.fandom.com', 'Jichang Kwak'],
  ['taesoo-ma', 'Taesoo Ma', 'https://lookism.fandom.com', 'Taesoo Ma'],
  ['gongseob-ji', 'Gongseob Ji', 'https://lookism.fandom.com', 'Gongseob Ji'],
  ['sinu-han', 'Sinu Han', 'https://lookism.fandom.com', 'Sinu Han'],
  ['warren-chae', 'Warren Chae', 'https://lookism.fandom.com', 'Warren Chae'],
  ['manager-kim', 'Manager Kim', 'https://manager-kim-manhwa.fandom.com', 'Manager Kim'],
  ['hansu-seong', 'Hansu Seong', 'https://manager-kim-manhwa.fandom.com', 'Hansu Seong'],
  ['jincheol-park', 'Jincheol Park', 'https://manager-kim-manhwa.fandom.com', 'Jincheol Park'],
  ['hobin-yoo', 'Hobin Yoo', 'https://viral-hit.fandom.com', 'Hobin Yoo'],
  ['taehoon-seong', 'Taehoon Seong', 'https://viral-hit.fandom.com', 'Taehun Seong'],
  ['suhyeon-kim', 'Suhyeon Kim', 'https://questism.fandom.com', 'Suhyeon Kim'],
  ['choyun', 'Choyun', 'https://questism.fandom.com', 'Choyun'],
  ['daniel-questism', 'Daniel (Questism)', 'https://questism.fandom.com', 'Daniel'],
  ['hajun-gu', 'Hajun Gu', 'https://questism.fandom.com', 'Hajun Gu'],
  ['dowan-ha', 'Dowan Ha', 'https://reality-quest.fandom.com', 'Ha Dowan'],
  ['sung-il-hwan', 'Sung Il-Hwan', 'https://solo-leveling.fandom.com', 'Sung Il-Hwan'],
  ['thomas-andre', 'Thomas Andre', 'https://solo-leveling.fandom.com', 'Thomas Andre'],
  ['liu-zhigang', 'Liu Zhigang', 'https://solo-leveling.fandom.com', 'Liu Zhigang'],
  ['beru', 'Beru', 'https://solo-leveling.fandom.com', 'Beru'],
  ['igris', 'Igris', 'https://solo-leveling.fandom.com', 'Igris'],
  ['kim-dokja', 'Kim Dokja', 'https://omniscient-readers-viewpoint.fandom.com', 'Kim Dokja'],
  ['yoo-joonghyuk', 'Yoo Joonghyuk', 'https://omniscient-readers-viewpoint.fandom.com', 'Yoo Joonghyuk'],
  ['secretive-plotter', 'Secretive Plotter', 'https://omniscient-readers-viewpoint.fandom.com', 'Secretive Plotter'],
  ['kyrgios-rodgraim', 'Kyrgios Rodgraim', 'https://omniscient-readers-viewpoint.fandom.com', 'Kyrgios Rodgraim'],
  ['jiwoo-seo', 'Jiwoo Seo', 'https://eleceed.fandom.com', 'Jiwoo Seo'],
  ['kartein', 'Kartein', 'https://eleceed.fandom.com', 'Kartein'],
  ['andrei', 'Andrei', 'https://eleceed.fandom.com', 'Andrei'],
  ['blade-god', 'Blade God', 'https://nano-mashine.fandom.com', 'Blade God'],
  ['heavenly-demon-mmm', 'Heavenly Demon', 'https://nano-mashine.fandom.com', 'Heavenly Demon Patriarch'],
  ['mok-gyeong-woon', 'Mok Gyeong-Woon', 'https://nano-mashine.fandom.com', 'Mok Gyeong Woon'],
  ['chung-myung', 'Chung Myung', 'https://return-of-the-blossoming-blade.fandom.com', 'Chung Myung'],
  ['jinhyeok-murim', 'Jinhyeok', 'https://murimlogin.fandom.com', 'Jinhyeok'],
  ['jin-tae-kyung', 'Jin Tae-Kyung', 'https://murimlogin.fandom.com', 'Jin Taekyung'],
  ['lee-gwak', 'Lee Gwak', 'https://koreanwebtoons.fandom.com', 'Martial Artist Lee Gwak'],
  ['lee-geon', 'Lee Geon', 'https://return-of-the-disaster-class-hero.fandom.com', 'Lee Geon'],
  ['dam-soo-cheon', 'Dam Soo-Cheon', 'https://legend-of-the-northern-blade.fandom.com', 'Dam Soo-Cheon'],
  ['jo-cheon-woo', 'Jo Cheon-Woo', 'https://legend-of-the-northern-blade.fandom.com', 'Jo Cheon-Woo'],
  ['gang-ryong', 'Gang Ryong', 'https://gosuverse.fandom.com', 'Gang Ryong'],
  ['yongbi', 'Yongbi', 'https://gosuverse.fandom.com', 'Yongbi'],
  ['arthur-leywin-king-grey', 'Arthur Leywin — King Grey', 'https://tbate.fandom.com', 'Arthur Leywin'],
  ['regis', 'Regis', 'https://tbate.fandom.com', 'Regis'],
  ['agrona-vritra', 'Agrona Vritra', 'https://tbate.fandom.com', 'Agrona Vritra'],
  ['zephyr', 'Zephyr', 'https://doom-breaker.fandom.com', 'Zephyr'],
  ['vikir', 'Vikir', 'https://revenge-of-the-iron-blooded-sword-hound.fandom.com', 'Vikir'],
  ['cale-henituse', 'Cale Henituse', 'https://trash-of-the-counts-family.fandom.com', 'Cale Henituse'],
  ['seo-gangrim', 'Seo Gangrim', 'https://sss-class-suicide-hunter.fandom.com', 'Seo Gangrim'],
  ['lucas-traumen', 'Lucas Traumen', 'https://the-great-mage-returns-after-4000-years.fandom.com', 'Lucas Traumen'],
  ['desir-arman', 'Desir Arman', 'https://a-returners-magic-should-be-special.fandom.com', 'Desir Arman'],
  ['ijin-yu', 'Ijin Yu', 'https://mercenary-enrollment.fandom.com', 'Ijin Yu'],
  ['teenage-mercenary-002', '002', 'https://mercenary-enrollment.fandom.com', '002'],
  ['gray-yeon-tools', 'Gray Yeon — Tools', 'https://weakhero.fandom.com', 'Gray Yeon'],
  ['donald-na', 'Donald Na', 'https://weakhero.fandom.com', 'Donald Na'],
  ['ben-park', 'Ben Park', 'https://weakhero.fandom.com', 'Ben Park'],
  ['nagyuun', 'Nagyuun', 'https://the-ember-knight.fandom.com', 'Nagyuun'],
  ['rania', 'Rania', 'https://the-ember-knight.fandom.com', 'Rania'],
  ['hanbin-ryu', 'Hanbin Ryu', 'https://survival-story-of-a-sword-king-in-a-fantasy-world.fandom.com', 'Ryu Han-Bin'],
  ['barolt-aura', 'Barolt — Aura', 'https://survival-story-of-a-sword-king-in-a-fantasy-world.fandom.com', 'Barolt'],
  ['karsia', 'Karsia', 'https://the-great-mage-returns-after-4000-years.fandom.com', 'Karsia'],
  ['joo-seoh-cheon', 'Joo Seoh-Cheon', 'https://volcanic-age.fandom.com', 'Joo Seoh-Cheon'],
  ['yi-zaha', 'Yi Zaha', 'https://return-of-the-mad-demon.fandom.com', 'Yi Zaha'],
]

const headers = { 'User-Agent': 'ShindoBuildArchive/1.0 (local fan project)' }
const sources = []

await mkdir(outputDirectory, { recursive: true })

for (const [id, name, wiki, title] of portraits) {
  try {
    const api = new URL('/api.php', wiki)
    api.search = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'pageimages',
      pithumbsize: '1600',
      titles: title,
    })

    const apiResponse = await fetch(api, { headers })
    if (!apiResponse.ok) throw new Error(`wiki API returned ${apiResponse.status}`)
    const data = await apiResponse.json()
    let page = Object.values(data.query?.pages ?? {})[0]
    if (!page?.thumbnail?.source) {
      const searchApi = new URL('/api.php', wiki)
      searchApi.search = new URLSearchParams({
        action: 'query',
        format: 'json',
        generator: 'search',
        gsrsearch: title,
        gsrlimit: '5',
        prop: 'pageimages',
        pithumbsize: '1600',
      })
      const searchResponse = await fetch(searchApi, { headers })
      if (!searchResponse.ok) throw new Error(`wiki search returned ${searchResponse.status}`)
      const searchData = await searchResponse.json()
      page = Object.values(searchData.query?.pages ?? {}).find((candidate) => candidate.thumbnail?.source)
    }
    const imageUrl = page?.thumbnail?.source
    if (!imageUrl) throw new Error('no lead image found')

    const imageResponse = await fetch(imageUrl, { headers })
    if (!imageResponse.ok) throw new Error(`image download returned ${imageResponse.status}`)
    const image = Buffer.from(await imageResponse.arrayBuffer())

    await sharp(image)
      .resize(700, 920, {
        fit: 'cover',
        position: 'north',
        background: { r: 10, g: 10, b: 10 },
      })
      .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
      .toFile(path.join(outputDirectory, `${id}.jpg`))

    const resolvedTitle = page.title ?? title
    const pageUrl = `${wiki}/wiki/${encodeURIComponent(resolvedTitle.replaceAll(' ', '_'))}`
    sources.push({ name, pageUrl, imageUrl })
    console.log(`synced ${name}`)
  } catch (error) {
    console.warn(`skipped ${name}: ${error.message}`)
  }
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
