import type { SortState, ColumnFilterMap, ColumnStats } from '../../types/dataset'

interface ViewerTableProps {
  rows: Record<string, unknown>[]
  columns: string[]
  sort: SortState
  onSortChange: (sort: SortState) => void
  filters: ColumnFilterMap
  onFilterChange: (column: string, value: string) => void
  columnStats: Record<string, ColumnStats>
}

function nextSort(current: SortState, column: string): SortState {
  if (current.column !== column || current.direction === null) {
    return { column, direction: 'asc' }
  }
  if (current.direction === 'asc') return { column, direction: 'desc' }
  return { column: null, direction: null }
}

function sortIndicator(sort: SortState, column: string): string {
  if (sort.column !== column || sort.direction === null) return ''
  return sort.direction === 'asc' ? ' ↑' : ' ↓'
}

function statsTitle(stats: ColumnStats): string {
  const minVal = stats.min !== null ? String(stats.min) : '—'
  const maxVal = stats.max !== null ? String(stats.max) : '—'
  return `min: ${minVal} | max: ${maxVal} | nulls: ${stats.nullCount} | unique: ${stats.uniqueCount}`
}

export function ViewerTable({
  rows,
  columns,
  sort,
  onSortChange,
  filters,
  onFilterChange,
  columnStats,
}: ViewerTableProps) {
  return (
    <div className="overflow-x-auto rounded border border-[var(--color-border)]">
      <table className="min-w-full text-xs font-mono">
        <thead>
          <tr className="bg-[var(--color-surface-alt)]">
            {columns.map(col => (
              <th
                key={col}
                title={columnStats[col] ? statsTitle(columnStats[col]) : col}
                onClick={() => onSortChange(nextSort(sort, col))}
                className="px-3 py-2 text-left text-[var(--color-text-muted)] font-semibold tracking-wide border-b border-[var(--color-border)] whitespace-nowrap cursor-pointer select-none hover:text-[var(--color-heading)] hover:bg-[var(--color-surface)]"
              >
                {col}{sortIndicator(sort, col)}
              </th>
            ))}
          </tr>
          <tr className="bg-[var(--color-surface)]">
            {columns.map(col => (
              <td key={col} className="px-2 py-1 border-b border-[var(--color-border)]">
                <input
                  type="text"
                  value={filters[col] ?? ''}
                  onChange={e => onFilterChange(col, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  placeholder="filter…"
                  aria-label={`Filter ${col}`}
                  className="w-full min-w-[80px] bg-transparent border border-[var(--color-border)] rounded px-1.5 py-0.5 font-mono text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-center text-[var(--color-text-muted)] italic"
              >
                No rows match current filters
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)] transition-colors"
              >
                {columns.map(col => (
                  <td
                    key={col}
                    className="px-3 py-1.5 text-[var(--color-text)] max-w-[200px] truncate"
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-[var(--color-text-muted)] italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
