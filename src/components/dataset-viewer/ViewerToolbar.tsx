import type { PageSize } from '../../types/dataset'

interface ViewerToolbarProps {
  rowCount: number
  filteredCount: number
  columnCount: number
  pageSize: PageSize
  onPageSizeChange: (size: PageSize) => void
}

export function ViewerToolbar({
  rowCount,
  filteredCount,
  columnCount,
  pageSize,
  onPageSizeChange,
}: ViewerToolbarProps) {
  const isFiltered = filteredCount < rowCount

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="inline-flex items-center rounded border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
        {isFiltered ? `${filteredCount} of ${rowCount} rows` : `${rowCount} rows`}
      </span>
      <span className="inline-flex items-center rounded border border-[var(--color-border)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-muted)]">
        {columnCount} columns
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="font-mono text-xs text-[var(--color-text-muted)]">Rows per page</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-xs text-[var(--color-text)] px-2 py-0.5 focus:outline-none focus:border-[var(--color-accent)]"
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  )
}
