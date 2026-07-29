type Props = {
  label: string
  value: number
  compact?: boolean
}

export function Score({ label, value, compact = false }: Props) {
  return (
    <div className={compact ? 'score score--compact' : 'score'}>
      <div className="score__top"><span>{label}</span><strong>{value.toFixed(1)}</strong></div>
      <div className="score__track"><i style={{ width: `${value * 10}%` }} /></div>
    </div>
  )
}
