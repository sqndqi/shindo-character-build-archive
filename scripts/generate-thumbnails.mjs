import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const source = path.resolve(import.meta.dirname, '..', 'public', 'characters')
const output = path.join(source, 'thumbs')
await mkdir(output, { recursive: true })

const files = (await readdir(source)).filter((file) => /\.(jpe?g|png)$/i.test(file) && !file.startsWith('_'))
await Promise.all(files.map((file) => sharp(path.join(source, file))
  .resize(480, 300, { fit: 'cover', position: 'attention' })
  .webp({ quality: 76, effort: 4 })
  .toFile(path.join(output, file.replace(/\.(jpe?g|png)$/i, '.webp')))))

console.log(`generated ${files.length} card thumbnails`)
