import { useState } from 'react'
import { ArrowDown, ArrowUp, Download, Eye, SearchX } from 'lucide-react'
import type { CharacterBuild, SlotLimit } from '../types'

type Column = {
  key: string
  label: string
  value: (build: CharacterBuild, slots: string[]) => string | number
  sticky?: boolean
}

const columns: Column[] = [
  { key: 'character', label: 'Character', value: (b) => b.name, sticky: true },
  { key: 'series', label: 'Series', value: (b) => b.series },
  { key: 'franchise', label: 'Franchise', value: (b) => b.franchise },
  { key: 'media', label: 'Media', value: (b) => b.media ?? 'Manhwa' },
  { key: 'version', label: 'Version / Arc', value: (b) => b.version },
  ...[0, 1, 2, 3].map((index) => ({ key: `bloodline${index + 1}`, label: `Bloodline ${index + 1}`, value: (_b: CharacterBuild, slots: string[]) => slots[index] ?? '—' })),
  { key: 'element1', label: 'Element 1', value: (b) => b.elements[0] ?? '—' },
  { key: 'element2', label: 'Element 2', value: (b) => b.elements[1] ?? '—' },
  { key: 'cmode', label: 'C-Mode', value: (b) => b.cMode },
  { key: 'zmode', label: 'Z-Mode', value: (b) => b.zMode },
  { key: 'combatArt', label: 'Combat Art', value: (b) => b.combatArt },
  { key: 'weapon', label: 'Weapon', value: (b) => b.weapon },
  { key: 'mentor', label: 'Mentor', value: (b) => b.mentor },
  { key: 'race', label: 'Race', value: (b) => b.race },
  { key: 'accuracy', label: 'Accuracy', value: (b) => b.ratings.accuracy },
  { key: 'pvp', label: 'PvP', value: (b) => b.ratings.pvp },
  { key: 'aura', label: 'Aura', value: (b) => b.ratings.aura },
  { key: 'effects', label: 'Effects', value: (b) => b.effectsIntensity },
  { key: 'difficulty', label: 'Difficulty', value: (b) => b.ratings.difficulty },
  { key: 'status', label: 'Status', value: (b) => b.publicationStatus },
]

const initialVisible = new Set(columns.map((column) => column.key))

type Props = {
  builds: CharacterBuild[]
  slotLimit: SlotLimit
  onOpen: (build: CharacterBuild) => void
  onClear: () => void
}

export function BuildTable({ builds, slotLimit, onOpen, onClear }: Props) {
  const [sortKey, setSortKey] = useState('character')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [visible, setVisible] = useState(initialVisible)

  const slotsFor = (build: CharacterBuild) => (build.variants.find((variant) => variant.bloodlineSlotCount === slotLimit) ?? build.variants[0]).bloodlines.map((slot) => slot.name)
  const activeColumns = columns.filter((column) => visible.has(column.key))
  const sorted = (() => {
    const column = columns.find((item) => item.key === sortKey) ?? columns[0]
    return [...builds].sort((a, b) => {
      const left = column.value(a, slotsFor(a))
      const right = column.value(b, slotsFor(b))
      const result = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right))
      return sortDirection === 'asc' ? result : -result
    })
  })()

  const sort = (key: string) => {
    if (key === sortKey) setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const exportCsv = () => {
    const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const rows = [
      activeColumns.map((column) => escape(column.label)).join(','),
      ...sorted.map((build) => activeColumns.map((column) => escape(column.value(build, slotsFor(build)))).join(',')),
    ]
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `shindo-builds-${slotLimit}-slots.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="table-shell">
      <div className="table-actions">
        <div><strong>{builds.length}</strong> builds in current view</div>
        <div className="table-action-group">
          <details className="column-menu">
            <summary className="button button--outline"><Eye size={15} /> Columns</summary>
            <div className="column-menu__panel">
              {columns.map((column) => (
                <label key={column.key}>
                  <input
                    type="checkbox"
                    checked={visible.has(column.key)}
                    onChange={() => setVisible((current) => {
                      const next = new Set(current)
                      if (next.has(column.key)) next.delete(column.key)
                      else next.add(column.key)
                      return next
                    })}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </details>
          <button className="button button--outline" onClick={exportCsv}><Download size={15} /> Export CSV</button>
        </div>
      </div>
      {!sorted.length ? (
        <div className="empty-state">
          <SearchX size={32} />
          <h3>No rows match</h3>
          <button className="button button--outline" onClick={onClear}>Clear filters</button>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {activeColumns.map((column) => (
                  <th className={column.sticky ? 'sticky-cell' : ''} key={column.key}>
                    <button onClick={() => sort(column.key)}>
                      {column.label}
                      {sortKey === column.key && (sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((build) => (
                <tr key={build.id} onClick={() => onOpen(build)}>
                  {activeColumns.map((column) => {
                    const value = column.value(build, slotsFor(build))
                    return (
                      <td className={column.sticky ? 'sticky-cell character-cell' : ''} key={column.key}>
                        {column.key === 'status' ? <span className={`status status--${String(value).toLowerCase().replace(' ', '-')}`}>{value}</span> : value}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
