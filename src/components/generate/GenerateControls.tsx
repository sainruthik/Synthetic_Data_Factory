import type { OutputFormat, GenMode } from '../../hooks/useGenerate'

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
  tableName: string
  onTableNameChange: (s: string) => void
  includeCreate: boolean
  onIncludeCreateChange: (b: boolean) => void
  csvBom: boolean
  onCsvBomChange: (b: boolean) => void
  genMode: GenMode
  onGenModeChange: (m: GenMode) => void
  aiProgress: string | null
  maxAiRows: number
}

const inputCls = 'px-3 py-2 font-mono text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]'
const labelCls = 'text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider'

export function GenerateControls({
  rowCount, onRowCountChange,
  seed, onSeedChange, onRandomizeSeed,
  format, onFormatChange,
  onGenerate, isGenerating, hasFields,
  tableName, onTableNameChange,
  includeCreate, onIncludeCreateChange,
  csvBom, onCsvBomChange,
  genMode, onGenModeChange,
  aiProgress, maxAiRows,
}: GenerateControlsProps) {
  const isAi = genMode === 'ai'

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex flex-col gap-1">
        <label className={labelCls}>Generation mode</label>
        <div className="flex gap-1">
          <button
            onClick={() => onGenModeChange('faker')}
            className={`px-4 py-1.5 font-mono text-xs font-semibold rounded border transition-colors ${
              !isAi
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            Fast (Faker)
          </button>
          <button
            onClick={() => onGenModeChange('ai')}
            className={`px-4 py-1.5 font-mono text-xs font-semibold rounded border transition-colors ${
              isAi
                ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
            }`}
          >
            AI Generate
          </button>
        </div>
        {isAi && (
          <p className="text-xs font-mono text-amber-600 mt-1">
            AI mode generates semantically coherent data. Max {maxAiRows} rows per run.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Rows</label>
          <input
            type="number"
            min={1}
            max={isAi ? maxAiRows : 1000}
            value={rowCount}
            onChange={e => onRowCountChange(Math.min(isAi ? maxAiRows : 1000, Math.max(1, Number(e.target.value))))}
            className={`w-24 ${inputCls}`}
          />
        </div>

        {!isAi && (
          <div className="flex flex-col gap-1">
            <label className={labelCls}>Seed</label>
            <div className="flex gap-1">
              <input
                type="number"
                value={seed}
                onChange={e => onSeedChange(Number(e.target.value))}
                className={`w-28 ${inputCls}`}
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
        )}

        <div className="flex flex-col gap-1">
          <label className={labelCls}>Format</label>
          <select
            value={format}
            onChange={e => onFormatChange(e.target.value as OutputFormat)}
            className={inputCls}
          >
            <option value="jsonl">JSONL</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="sql">SQL</option>
            <option value="md">Markdown</option>
          </select>
        </div>

        <button
          onClick={onGenerate}
          disabled={!hasFields || isGenerating}
          className="px-6 py-2 font-mono text-sm font-semibold rounded bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isGenerating
            ? (aiProgress ?? 'Generating…')
            : isAi ? 'AI Generate' : 'Generate Data'}
        </button>
      </div>

      {(format === 'sql' || format === 'csv') && (
        <div className="flex flex-wrap gap-4 items-center pl-1">
          {format === 'sql' && (
            <>
              <div className="flex flex-col gap-1">
                <label className={labelCls}>Table name</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={e => onTableNameChange(e.target.value)}
                  className={`w-44 ${inputCls}`}
                  placeholder="synthetic_data"
                />
              </div>
              <label className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)] cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={includeCreate}
                  onChange={e => onIncludeCreateChange(e.target.checked)}
                  className="accent-[var(--color-accent)]"
                />
                Include CREATE TABLE
              </label>
            </>
          )}
          {format === 'csv' && (
            <label className="flex items-center gap-2 font-mono text-xs text-[var(--color-text-muted)] cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={csvBom}
                onChange={e => onCsvBomChange(e.target.checked)}
                className="accent-[var(--color-accent)]"
              />
              UTF-8 BOM (Excel)
            </label>
          )}
        </div>
      )}
    </div>
  )
}
