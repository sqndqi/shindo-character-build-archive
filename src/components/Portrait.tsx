import { memo, useEffect, useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  thumbnail?: boolean
  objectPosition?: string
  lazy?: boolean
}

export const Portrait = memo(function Portrait({ src, alt, className = '', thumbnail = false, objectPosition, lazy }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const cardSrc = thumbnail && src.endsWith('.jpg') ? src.replace('/characters/', '/characters/thumbs/').replace(/\.jpg$/, '.webp') : src
  const resolvedSrc = cardSrc.startsWith('/') ? `${import.meta.env.BASE_URL}${cardSrc.slice(1)}` : cardSrc
  const initials = alt.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase()

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [resolvedSrc])

  if (failed || !src) {
    return (
      <div className={`portrait-fallback ${className}`} role="img" aria-label={`${alt} portrait unavailable`}>
        <strong>{initials}</strong>
        <span>PORTRAIT UNAVAILABLE</span>
      </div>
    )
  }

  const loadingAttr = (lazy ?? thumbnail) ? 'lazy' : 'eager'

  return (
    <span className={`portrait-frame ${loaded ? 'is-loaded' : ''} ${className}`}>
      <span className="portrait-skeleton" aria-hidden="true" />
      <img
        src={resolvedSrc}
        alt={alt}
        width={thumbnail ? 480 : 700}
        height={thumbnail ? 300 : 920}
        loading={loadingAttr}
        decoding="async"
        style={objectPosition ? { objectPosition } : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </span>
  )
})
