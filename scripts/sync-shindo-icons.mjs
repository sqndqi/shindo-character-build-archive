import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const checkedAt = new Date().toISOString().slice(0, 10)
const wikiBase = 'https://shindo-life-rell.fandom.com'
const apiUrl = `${wikiBase}/api.php`

const catalog = {
  Bloodline: [
    'Aizden', 'Aizden-Inverse', 'Akuma', 'Apollo-Sand', 'Ashura-Shizen', 'Azarashi',
    'Bankai-Akuma', 'Borumaki', 'Borumaki-Gaiden', 'Borumaki-Shiki', 'Bruce-Kenichi',
    'Chaos', 'Code-Gaiden', 'Demon Gate Spirit', 'Demon-Gate', 'Dio-Senko',
    'Dio-Senko-Rose', 'Doku-Tengoku', 'Doom-Shado', 'Getsuga', 'Getsuga-Black',
    'Indra-Akuma', 'Jokei', 'Jotaro-Shizen', 'Kamaki-Akuma', 'Kenichi', 'Light-Jokei',
    'Minakaze', 'Minakaze-Azure', 'Minakaze-Ruby', 'Narumaki', 'Narumaki-Ruby',
    'Order', 'Pika-Senko', 'Pyromania', 'Raion-Akuma', 'Raion-Gaiden',
    'Raion-Rengoku', 'Rengoku', 'Riser-Akuma', 'Rykan-Shizen', 'Ryuji-Kenichi',
    'Shado', 'Shindai-Akuma', 'Shindai-Rengoku', 'Shiver-Akuma', 'Shizen',
    'Six-Paths-Narumaki', 'SnakeMan', 'SnakeMan-Platinum', 'Tengoku-Platinum',
    'Tetsuo-Kaijin', 'Xeno-Dokei',
  ],
  Element: ['Air', 'Chaos', 'Earth', 'Fire', 'Gale', 'Inferno', 'Lightning', 'Order', 'Water', 'Wind', 'Yang'],
  Mode: [
    'Kor Tailed Spirit Generation 2', 'Tyn Tailed Spirit Generation 2', 'Dragon Sage',
    'Lightning Cloak', 'Maru Daggers',
  ],
  'Combat Art': [
    'Aether Arts', 'Basic Combat', 'Boxing', 'Boxing Style', 'Claw Arts',
    'Elemental Arts', 'Force Control', 'Greatsword Arts', 'Jeet Kune Do', 'Karate',
    'Kenjutsu', 'Magic', 'Mixed Martial Arts', 'Muay Thai', 'Precision Arts',
    'Reality Warping', 'Spear Arts', 'Tactical Arts', 'Tanto Arts',
  ],
  Weapon: [
    'Bankai Blade', 'Baton', 'Black Katana', 'Chi Blade', 'Combat Knife', 'Dawn Sword',
    'Demon Blade', 'Demon Sword', 'Dual Daggers', 'Enra Staff', 'Executioner Axe',
    'Greatsword', 'Improvised Pen', 'Improvised Tools', 'Katana', 'Knife and Sidearm',
    'Obelisk Chi Blade', 'Raion Blade', 'Senko Kunai', 'Shindai Umpire Fan', 'Spear',
    'Sword',
  ],
  'Ninja Tool': ['Dagai', 'Dagai Wire', 'Shock Bomb'],
  Consumable: ['Chi Pot', 'Chi Stim', 'Health Stim'],
  Mentor: ['Bruce Kenichi', 'Jiso Seishin', 'Narumaki', 'Ryuji Kenichi', 'Shindai Akuma'],
  Race: ['Celestial', 'Human', 'Shinobi'],
}

const folders = {
  Bloodline: 'bloodlines',
  Element: 'elements',
  Mode: 'modes',
  'Combat Art': 'combat-arts',
  Weapon: 'weapons',
  'Ninja Tool': 'ninja-tools',
  Consumable: 'consumables',
  Mentor: 'mentors',
  Race: 'races',
}

const pageAliases = {
  'Demon Gate Spirit': 'Demon_Gate_Spirit',
  'Kor Tailed Spirit Generation 2': 'Korama_Spirit',
  'Tyn Tailed Spirit Generation 2': 'Tyn_Tailed_Spirit_Generation_2',
  'Basic Combat': 'Combat_Arts',
  'Mixed Martial Arts': 'Combat_Arts',
  'Jeet Kune Do': 'Combat_Arts',
  Kenjutsu: 'Combat_Arts',
  Boxing: 'Combat_Arts',
  Karate: 'Combat_Arts',
  'Bruce Kenichi': 'Bruce_Kenichi_(Companion)',
  'Ryuji Kenichi': 'Ryuji_Kenichi_(Companion)',
  'Shindai Akuma': 'Shindai_Akuma_(Companion)',
}

const directFileAliases = {
  'Basic Combat': 'File:BasicCombat.png',
  Boxing: 'File:Boxing.png',
  'Jeet Kune Do': 'File:Jeet Kune Do.png',
  'Mixed Martial Arts': 'File:MMA.png',
}

function slug(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function aliasesFor(name) {
  const aliases = new Set([name.replaceAll('-', ' '), name.replaceAll(' ', '-')])
  if (name === 'Air') aliases.add('Wind')
  if (name === 'Wind') aliases.add('Air')
  if (name === 'Demon Gate Spirit') aliases.add('Demon-Gate')
  if (name === 'Demon-Gate') aliases.add('Demon Gate Spirit')
  return [...aliases].filter((alias) => alias !== name)
}

async function queryPage(name) {
  const title = pageAliases[name] ?? name
  const url = new URL(apiUrl)
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'pageimages|imageinfo',
    piprop: 'original|thumbnail',
    pithumbsize: '256',
    titles: title,
    redirects: '1',
    origin: '*',
  }).toString()
  const response = await fetch(url, { headers: { 'User-Agent': 'ShindoCharacterBuildArchive/1.0 asset audit' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const payload = await response.json()
  return Object.values(payload.query?.pages ?? {})[0]
}

async function queryFile(fileTitle) {
  const url = new URL(apiUrl)
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'url|size|mime',
    titles: fileTitle,
    origin: '*',
  }).toString()
  const response = await fetch(url, { headers: { 'User-Agent': 'ShindoCharacterBuildArchive/1.0 asset audit' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const payload = await response.json()
  return Object.values(payload.query?.pages ?? {})[0]?.imageinfo?.[0]
}

async function download(url, target) {
  const response = await fetch(url, { headers: { 'User-Agent': 'ShindoCharacterBuildArchive/1.0 asset audit' } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  await writeFile(target, bytes)
  return bytes
}

async function imageSize(filePath) {
  const buffer = await readFile(filePath)
  if (buffer.subarray(1, 4).toString() === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), transparent: true }
  }
  return { width: 256, height: 256, transparent: false }
}

const entries = []
const hashes = new Map()

for (const [type, names] of Object.entries(catalog)) {
  const folder = folders[type]
  const outputDir = path.join(process.cwd(), 'public', 'shindo-icons', folder)
  await mkdir(outputDir, { recursive: true })

  for (const name of names) {
    const id = `${slug(type)}-${slug(name)}`
    const sourceUrl = `${wikiBase}/wiki/${encodeURIComponent(pageAliases[name] ?? name)}`
    let entry = {
      id,
      type,
      name,
      aliases: aliasesFor(name),
      sourceUrl,
      localPath: '',
      width: 0,
      height: 0,
      transparent: false,
      checkedAt,
      status: 'Missing',
    }

    try {
      const directFile = directFileAliases[name] ? await queryFile(directFileAliases[name]) : undefined
      const page = directFile ? undefined : await queryPage(name)
      const imageUrl = directFile?.url ?? page?.original?.source ?? page?.thumbnail?.source
      const pageImage = directFileAliases[name] ?? page?.pageimage ?? ''
      const genericPage = pageAliases[name] === 'Combat_Arts'
      if (!imageUrl || page?.missing !== undefined || (genericPage && !directFile && !new RegExp(slug(name).replaceAll('-', '.*'), 'i').test(pageImage))) {
        entries.push(entry)
        continue
      }

      const extension = /\.jpe?g(?:\/|$|\?)/i.test(imageUrl) ? '.jpg' : /\.webp(?:\/|$|\?)/i.test(imageUrl) ? '.webp' : '.png'
      const fileName = `${slug(name)}${extension}`
      const target = path.join(outputDir, fileName)
      const bytes = await download(imageUrl, target)
      const hash = createHash('sha256').update(bytes).digest('hex')
      const duplicatePath = hashes.get(hash)
      const dimensions = await imageSize(target)
      hashes.set(hash, duplicatePath ?? `/${path.posix.join('shindo-icons', folder, fileName)}`)
      entry = {
        ...entry,
        originalFileUrl: imageUrl,
        localPath: duplicatePath ?? `/${path.posix.join('shindo-icons', folder, fileName)}`,
        width: dimensions.width,
        height: dimensions.height,
        transparent: dimensions.transparent,
        status: duplicatePath ? 'Needs Review' : 'Available',
      }
    } catch (error) {
      entry.notes = error instanceof Error ? error.message : String(error)
    }
    entries.push(entry)
  }
}

const manifestPath = path.join(process.cwd(), 'src', 'data', 'shindoAssetManifest.generated.json')
await writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`)

const counts = entries.reduce((acc, entry) => {
  const key = `${entry.type}:${entry.status}`
  acc[key] = (acc[key] ?? 0) + 1
  return acc
}, {})
console.log(JSON.stringify({ total: entries.length, counts, bytes: (await stat(manifestPath)).size }, null, 2))
