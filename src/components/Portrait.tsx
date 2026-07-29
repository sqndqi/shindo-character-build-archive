import { useState } from 'react'
import { UserRound } from 'lucide-react'

type Props = {
  src: string
  alt: string
  className?: string
}

export function Portrait({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div className={`portrait-fallback ${className}`} role="img" aria-label={`${alt} portrait unavailable`}>
        <UserRound size={44} strokeWidth={1.2} />
        <span>PORTRAIT UNAVAILABLE</span>
      </div>
    )
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />
}
