import { useSchemaReducer } from '../hooks/useSchemaReducer'
import { useGenerate } from '../hooks/useGenerate'
import { SchemaBuilder } from '../components/schema-builder/SchemaBuilder'
import { ChatPanel } from '../components/chat/ChatPanel'
import { GenerateControls } from '../components/generate/GenerateControls'
import { PreviewTable } from '../components/generate/PreviewTable'
import { ViolationBanner } from '../components/generate/ViolationBanner'
import { toJsonl } from '../engine/writers/jsonl'
import { toCsv } from '../engine/writers/csv'
import { toSql } from '../engine/writers/sql'
import { downloadFile } from '../engine/download'
import type { SchemaField } from '../types/schema'

const MIME: Record<string, string> = {
  jsonl: 'application/x-ndjson',
  csv:   'text/csv',
  sql:   'text/plain',
}

export function GeneratePage() {
  const { state, dispatch } = useSchemaReducer()
  const {
    state: genState,
    rowCount, setRowCount,
    seed, setSeed, randomizeSeed,
    format, setFormat,
    generate,
  } = useGenerate()

  const handleSchema = (fields: SchemaField[]) => {
    dispatch({ type: 'SET_SCHEMA', payload: { fields } })
  }

  const handleGenerate = () => generate(state)

  const handleDownload = () => {
    if (!genState.result) return
    const { rows } = genState.result
    const content =
      format === 'jsonl' ? toJsonl(rows) :
      format === 'csv'   ? toCsv(rows)   :
                           toSql(rows)
    downloadFile(content, `synthetic_data.${format}`, MIME[format])
  }

  return (
    <section aria-labelledby="generate-heading" className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1
          id="generate-heading"
          className="font-mono text-3xl font-bold text-[var(--color-heading)] mb-3 tracking-tight"
        >
          Schema Builder
        </h1>
        <p className="text-[var(--color-text)] text-sm leading-relaxed max-w-xl">
          Describe your dataset to the AI assistant, or build the schema manually using the editor.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr]" style={{ minHeight: '600px' }}>
        <div className="flex flex-col" style={{ minHeight: '560px' }}>
          <ChatPanel onSchema={handleSchema} />
        </div>
        <div>
          <SchemaBuilder state={state} dispatch={dispatch} />
        </div>
      </div>

      {/* Generation panel */}
      <div className="mt-10 space-y-6">
        <div className="border-t border-[var(--color-border)] pt-8">
          <h2 className="font-mono text-xl font-bold text-[var(--color-heading)] mb-1">
            Generate Data
          </h2>
          <p className="text-[var(--color-text)] text-sm mb-6">
            Configure options below and generate a synthetic dataset from your schema.
          </p>
          <GenerateControls
            rowCount={rowCount}
            onRowCountChange={setRowCount}
            seed={seed}
            onSeedChange={setSeed}
            onRandomizeSeed={randomizeSeed}
            format={format}
            onFormatChange={setFormat}
            onGenerate={handleGenerate}
            isGenerating={genState.isGenerating}
            hasFields={state.fields.length > 0}
          />
        </div>

        {genState.error && (
          <div className="rounded border border-red-500/40 bg-red-500/10 p-4">
            <p className="text-xs font-mono text-red-600">{genState.error}</p>
          </div>
        )}

        {genState.result && (
          <>
            <ViolationBanner violations={genState.result.violations} />
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-sm text-[var(--color-text-muted)]">
                  Preview — {genState.result.rows.length} rows generated
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-1.5 font-mono text-xs font-semibold rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                >
                  ↓ Download .{format}
                </button>
              </div>
              <PreviewTable rows={genState.result.rows} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
