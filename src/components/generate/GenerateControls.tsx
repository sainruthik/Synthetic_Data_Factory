import type { OutputFormat } from '../../hooks/useGenerate'

interface GenerateControlsProps {
  rowCount: number
  onRowCountChange: (n: number) => void
  seed: number
  onSeedChange: (n: number) => void
  onRandomizeSeed: () => void
  format: OutputFormat
  onFormatChange: (f: OutputFormat) => void
  onGenerate: () => void
  isGenerating: boolean
  hasFields: boolean
}

export function GenerateControls({
  rowCount, onRowCountChange,
  seed, onSeedChange, onRandomizeSeed,
  format, onFormatChange,
  onGenerate, isGenerating, hasFields,
}: GenerateControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Rows</label>
        <input
          type="number"
          min={1}
          max={1000}
          value={rowCount}
          onChange={e => onRowCountChange(Math.min(1000, Math.max(1, Number(e.target.value))))}
          className="w-24 px-3 py-2 font-mono text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Seed</label>
        <div className="flex gap-1">
          <input
            type="number"
            value={seed}
            onChange={e => onSeedChange(Number(e.target.value))}
            className="w-28 px-3 py-2 font-mono text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <button
            onClick={onRandomizeSeed}
            title="Randomize seed"
            className="px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] rounded hover:text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors font-mono text-sm"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider">Format</label>
        <select
          value={format}
          onChange={e => onFormatChange(e.target.value as OutputFormat)}
          className="px-3 py-2 font-mono text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        >
          <option value="jsonl">JSONL</option>
          <option value="csv">CSV</option>
          <option value="sql">SQL</option>
        </select>
      </div>

      <button
        onClick={onGenerate}
        disabled={!hasFields || isGenerating}
        className="px-6 py-2 font-mono text-sm font-semibold rounded bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        {isGenerating ? 'Generating…' : 'Generate Data'}
      </button>
    </div>
  )
}
