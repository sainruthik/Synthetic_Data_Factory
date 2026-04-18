import { useMemo } from 'react'
import { writers } from '../../engine/writers/index'
import type { OutputFormat, WriterOptions } from '../../engine/writers/index'

interface FormatPreviewProps {
  rows: Record<string, unknown>[]
  format: OutputFormat
  opts?: WriterOptions
  maxPreviewRows?: number
}

export function FormatPreview({ rows, format, opts, maxPreviewRows = 5 }: FormatPreviewProps) {
  const total = rows.length

  const preview = useMemo(() => {
    try {
      const slice = rows.slice(0, maxPreviewRows)
      return writers[format].write(slice, { ...opts, includeCreate: false })
    } catch {
      return '// Preview unavailable'
    }
  }, [rows, format, opts, maxPreviewRows])

  if (total === 0) return null

  return (
    <details className="rounded border border-[var(--color-border)]">
      <summary className="px-3 py-2 font-mono text-xs text-[var(--color-text-muted)] cursor-pointer select-none hover:text-[var(--color-text)] transition-colors list-none flex items-center gap-2">
        <span className="text-[var(--color-text-muted)]">▶</span>
        Format preview — first {Math.min(maxPreviewRows, total)} of {total} rows ·{' '}
        <span className="text-[var(--color-accent)]">{format.toUpperCase()}</span>
      </summary>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs text-[var(--color-text)] bg-[var(--color-surface-alt)] border-t border-[var(--color-border)] leading-relaxed whitespace-pre">
        {preview}
      </pre>
    </details>
  )
}
