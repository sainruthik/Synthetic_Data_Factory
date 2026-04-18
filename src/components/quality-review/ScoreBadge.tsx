interface ScoreBadgeProps {
  score: number | null
  size?: 'sm' | 'lg'
}

function scoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500/15 text-green-700 border-green-500/40'
  if (score >= 50) return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/40'
  return 'bg-red-500/15 text-red-700 border-red-500/40'
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Pass'
  if (score >= 50) return 'Review'
  return 'Fail'
}

export function ScoreBadge({ score, size = 'sm' }: ScoreBadgeProps) {
  if (score === null) return null

  const colorClass = scoreColor(score)
  const sizeClass = size === 'lg'
    ? 'text-3xl font-bold px-4 py-2'
    : 'text-sm font-semibold px-2.5 py-0.5'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono ${colorClass} ${sizeClass}`}
      aria-label={`Quality score ${score} out of 100 — ${scoreLabel(score)}`}
    >
      {score}/100
      {size === 'lg' && (
        <span className="text-base font-normal opacity-70">{scoreLabel(score)}</span>
      )}
    </span>
  )
}
