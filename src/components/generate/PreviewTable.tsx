interface PreviewTableProps {
  rows: Record<string, unknown>[]
  maxRows?: number
}

export function PreviewTable({ rows, maxRows = 20 }: PreviewTableProps) {
  if (rows.length === 0) return null
  const preview = rows.slice(0, maxRows)
  const headers = Object.keys(rows[0])

  return (
    <div className="overflow-x-auto rounded border border-[var(--color-border)]">
      <table className="min-w-full text-xs font-mono">
        <thead>
          <tr className="bg-[var(--color-surface-alt)]">
            {headers.map(h => (
              <th
                key={h}
                className="px-3 py-2 text-left text-[var(--color-text-muted)] font-semibold tracking-wide border-b border-[var(--color-border)] whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {preview.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              {headers.map(h => (
                <td key={h} className="px-3 py-1.5 text-[var(--color-text)] max-w-[200px] truncate">
                  {row[h] === null
                    ? <span className="text-[var(--color-text-muted)] italic">null</span>
                    : String(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > maxRows && (
        <p className="px-3 py-2 text-xs text-[var(--color-text-muted)] font-mono border-t border-[var(--color-border)]">
          Showing {maxRows} of {rows.length} rows
        </p>
      )}
    </div>
  )
}
