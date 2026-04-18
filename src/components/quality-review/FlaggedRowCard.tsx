import type { FlaggedRow } from '../../types/qualityReview'

interface FlaggedRowCardProps {
  flaggedRow: FlaggedRow
  originalIndex?: number
}

export function FlaggedRowCard({ flaggedRow, originalIndex }: FlaggedRowCardProps) {
  const displayIndex = originalIndex ?? flaggedRow.rowIndex

  return (
    <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs text-[var(--color-text-muted)]">Row {displayIndex + 1}</span>
          <p className="text-sm font-medium text-[var(--color-heading)] mt-0.5">{flaggedRow.summary}</p>
        </div>
        <span className="shrink-0 rounded border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-mono text-xs text-red-600">
          {flaggedRow.fieldIssues.length} issue{flaggedRow.fieldIssues.length !== 1 ? 's' : ''}
        </span>
      </div>

      <ul className="space-y-2" aria-label={`Issues in row ${displayIndex + 1}`}>
        {flaggedRow.fieldIssues.map((issue, i) => (
          <li
            key={i}
            className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-xs space-y-1"
          >
            <div className="flex items-center gap-2">
              <code className="font-mono font-semibold text-[var(--color-accent)]">{issue.field}</code>
            </div>
            <p className="text-[var(--color-text)]">{issue.reason}</p>
            {issue.suggestedFix && (
              <p className="text-[var(--color-text-muted)]">
                <span className="font-semibold">Fix:</span>{' '}
                <code className="font-mono">{issue.suggestedFix}</code>
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
