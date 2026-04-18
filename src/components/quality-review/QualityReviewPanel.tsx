import type { ExportedSchema } from '../../types/schema'
import { useQualityReview } from '../../hooks/useQualityReview'
import { ScoreBadge } from './ScoreBadge'
import { FlaggedRowList } from './FlaggedRowList'
import { IterationHistory } from './IterationHistory'

interface QualityReviewPanelProps {
  rows: Record<string, unknown>[]
  schema: ExportedSchema
  onPatchRows: (rows: Record<string, unknown>[]) => void
}

function StatusLabel({ status }: { status: string }) {
  if (status === 'judging') {
    return (
      <span className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" aria-hidden="true" />
        Judging dataset…
      </span>
    )
  }
  if (status === 'fixing') {
    return (
      <span className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" aria-hidden="true" />
        Applying fixes & re-judging…
      </span>
    )
  }
  return null
}

export function QualityReviewPanel({ rows, schema, onPatchRows }: QualityReviewPanelProps) {
  const {
    status,
    iteration,
    history,
    currentJudgment,
    error,
    canApplyFixes,
    startReview,
    applyFixes,
    reset,
  } = useQualityReview(onPatchRows)

  const isRunning = status === 'judging' || status === 'fixing'

  return (
    <section aria-labelledby="quality-review-heading" className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 id="quality-review-heading" className="font-mono text-lg font-bold text-[var(--color-heading)]">
            Quality Review
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            AI judges dataset realism and flags semantic inconsistencies
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {status !== 'idle' && status !== 'judging' && status !== 'fixing' && (
            <button
              onClick={reset}
              className="px-3 py-1.5 font-mono text-xs rounded border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              Reset
            </button>
          )}

          {canApplyFixes && (
            <button
              onClick={applyFixes}
              disabled={isRunning}
              className="px-4 py-1.5 font-mono text-xs font-semibold rounded border border-amber-500/60 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply Fixes ({currentJudgment?.flaggedRows.length ?? 0} rows)
            </button>
          )}

          <button
            onClick={() => startReview(rows, schema)}
            disabled={isRunning}
            className="px-4 py-1.5 font-mono text-xs font-semibold rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'idle' && iteration === 0 ? 'Run Quality Review' : 'Re-run Review'}
          </button>
        </div>
      </div>

      {/* Running indicator */}
      <StatusLabel status={status} />

      {/* Error */}
      {error && (
        <div className="rounded border border-red-500/40 bg-red-500/10 p-3">
          <p className="font-mono text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Score + reasoning */}
      {currentJudgment && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <ScoreBadge score={currentJudgment.score} size="lg" />
            {status === 'done' && currentJudgment.score >= 80 && (
              <span className="text-sm text-green-700 font-medium">Dataset passed quality review</span>
            )}
            {status === 'done' && currentJudgment.score < 80 && (
              <span className="text-sm text-[var(--color-text-muted)]">Max iterations reached</span>
            )}
          </div>

          <p className="text-sm text-[var(--color-text)] leading-relaxed">
            {currentJudgment.overallReasoning}
          </p>

          {currentJudgment.flaggedRows.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Flagged Rows ({currentJudgment.flaggedRows.length})
              </p>
              <FlaggedRowList flaggedRows={currentJudgment.flaggedRows} />
            </div>
          )}
        </div>
      )}

      {/* Iteration history */}
      {history.length > 0 && <IterationHistory history={history} />}

      {/* Empty state */}
      {status === 'idle' && iteration === 0 && !error && (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          Click "Run Quality Review" to have Claude evaluate the generated dataset for semantic realism.
        </p>
      )}
    </section>
  )
}
