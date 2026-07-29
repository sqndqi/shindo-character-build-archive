import { useEffect, useRef, useState } from 'react'
import { Disc3, X } from 'lucide-react'
import type { CharacterBuild } from '../types'
import { Portrait } from './Portrait'

type Props = {
  builds: CharacterBuild[]
  onClose: () => void
  onOpen: (build: CharacterBuild) => void
}

export function WheelModal({ builds, onClose, onOpen }: Props) {
  const [winner, setWinner] = useState<CharacterBuild | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const spin = () => {
    if (!builds.length || spinning) return
    const index = Math.floor(Math.random() * builds.length)
    setWinner(null)
    setSpinning(true)
    setRotation((current) => current + 1440 + Math.floor(Math.random() * 720))
    timer.current = window.setTimeout(() => {
      setWinner(builds[index])
      setSpinning(false)
    }, 1900)
  }

  return (
    <div className="modal-layer wheel-layer" role="dialog" aria-modal="true" aria-label="Random character wheel">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close wheel" />
      <section className="wheel-panel">
        <header>
          <div><span className="eyebrow"><Disc3 size={14} /> ARCHIVE ROULETTE</span><h2>Random fighter wheel</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close wheel"><X /></button>
        </header>
        <div className="wheel-content">
          <div className="wheel-stage">
            <div className="wheel-pointer" />
            <div className="fighter-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
              <div className="fighter-wheel__core"><strong>{builds.length}</strong><span>FIGHTERS</span></div>
            </div>
          </div>
          <div className="wheel-result">
            {winner ? (
              <>
                <Portrait src={winner.image} alt={winner.name} />
                <span className="eyebrow">SELECTION LOCKED</span>
                <h3>{winner.name}</h3>
                <p>{winner.series} / {winner.version}</p>
                <button className="button button--primary" onClick={() => onOpen(winner)}>Open selected build</button>
              </>
            ) : (
              <>
                <span className="wheel-number">01—{String(builds.length).padStart(2, '0')}</span>
                <h3>{spinning ? 'Reading the archive…' : 'Leave the matchup to chance.'}</h3>
                <p>The wheel uses every build in your current filtered result.</p>
                <button className="button button--primary" disabled={spinning || !builds.length} onClick={spin}>{spinning ? 'Spinning…' : 'Spin the wheel'}</button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
