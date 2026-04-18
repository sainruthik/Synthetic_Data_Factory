import type { FlaggedRow } from '../../types/qualityReview'
import { FlaggedRowCard } from './FlaggedRowCard'

interface FlaggedRowListProps {
  flaggedRows: FlaggedRow[]
}

export function FlaggedRowList({ flaggedRows }: FlaggedRowListProps) {
  if (flaggedRows.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic">No rows flagged.</p>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Flagged rows">
      {flaggedRows.map((row) => (
        <li key={row.rowIndex}>
          <FlaggedRowCard flaggedRow={row} />
        </li>
      ))}
    </ul>
  )
}
