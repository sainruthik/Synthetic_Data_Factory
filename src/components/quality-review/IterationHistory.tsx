import type { ReviewIteration } from '../../types/qualityReview'
import { ScoreBadge } from './ScoreBadge'

interface IterationHistoryProps {
  history: ReviewIteration[]
}

export function IterationHistory({ history }: IterationHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="font-mono text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
        Iteration History
      </p>
      <ol className="flex flex-wrap items-center gap-2" aria-label="Score history across iterations">
        {history.map((iter) => (
          <li key={iter.index} className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-[var(--color-text-muted)]">#{iter.index}</span>
            <ScoreBadge score={iter.score} size="sm" />
            <span className="font-mono text-xs text-[var(--color-text-muted)]">
              ({iter.flaggedRowCount} flagged)
            </span>
            {iter.index < history.length && (
              <span className="text-[var(--color-text-muted)] select-none mx-1">→</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
