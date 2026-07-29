import { memo, useEffect, useMemo, useState } from 'react'
import { resolveShindoAsset, type ShindoAssetType } from '../data/shindoAssetManifest'

type Props = {
  name: string
  type?: ShindoAssetType
  size?: 'small' | 'medium' | 'large'
  eager?: boolean
  showLabel?: boolean
  className?: string
}

export const ShindoIcon = memo(function ShindoIcon({
  name,
  type,
  size = 'medium',
  eager = false,
  showLabel = false,
  className = '',
}: Props) {
  const asset = useMemo(() => resolveShindoAsset(name, type), [name, type])
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [asset?.localPath])

  const initials = name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  const available = asset?.status !== 'Missing' && asset?.localPath && !failed
  const resolvedPath = available && asset.localPath.startsWith('/')
    ? `${import.meta.env.BASE_URL}${asset.localPath.slice(1)}`
    : asset?.localPath

  return <span
    className={`shindo-icon shindo-icon--${size} ${available ? '' : 'shindo-icon--fallback'} ${className}`}
    title={asset?.status === 'Needs Review' ? `${name} icon needs source review` : name}
  >
    {available
      ? <img
          src={resolvedPath}
          alt=""
          width={asset.width || 64}
          height={asset.height || 64}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      : <span aria-hidden="true">{initials || '—'}</span>}
    {showLabel && <strong>{name}</strong>}
    <span className="sr-only">{name}{available ? '' : ' icon unavailable'}</span>
  </span>
})

