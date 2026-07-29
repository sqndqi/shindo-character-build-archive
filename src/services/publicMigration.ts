import { readStorage, writeStorage } from './storage'

const VERSION_KEY = 'shindo-build-archive:public-schema-version'
const OLD_ARCHIVE_KEY = 'shindo-build-archive:v1'
export const PUBLIC_SCHEMA_VERSION = 3

export function migratePublicData() {
  if (readStorage<number>(VERSION_KEY, 0) >= PUBLIC_SCHEMA_VERSION) return { migrated: false, customBuildCount: 0 }
  const raw = localStorage.getItem(OLD_ARCHIVE_KEY)
  let customBuildCount = 0
  if (raw) {
    localStorage.setItem(`shindo-build-archive:backup:before-public-v${PUBLIC_SCHEMA_VERSION}`, raw)
    try {
      const records = JSON.parse(raw) as { id?: string; status?: string }[]
      const custom = records.filter((item) => item.status === 'Draft' || item.id?.startsWith('build-') || item.id?.startsWith('custom-'))
      customBuildCount = custom.length
      if (custom.length) {
        writeStorage('shindo-build-archive:removed-custom-backup:v3', custom)
        writeStorage('shindo-build-archive:custom-backup-notice:v3', true)
      }
    } catch {
      localStorage.setItem('shindo-build-archive:damaged-backup:v3', raw)
    }
    localStorage.removeItem(OLD_ARCHIVE_KEY)
  }
  writeStorage(VERSION_KEY, PUBLIC_SCHEMA_VERSION)
  return { migrated: true, customBuildCount }
}
