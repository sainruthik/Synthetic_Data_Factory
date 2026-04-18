import { useSchemaReducer } from '../hooks/useSchemaReducer'
import { useGenerate } from '../hooks/useGenerate'
import { SchemaBuilder } from '../components/schema-builder/SchemaBuilder'
import { ChatPanel } from '../components/chat/ChatPanel'
import { GenerateControls } from '../components/generate/GenerateControls'
import { FormatPreview } from '../components/generate/FormatPreview'
import { DatasetViewer } from '../components/dataset-viewer/DatasetViewer'
import { ViolationBanner } from '../components/generate/ViolationBanner'
import { QualityReviewPanel } from '../components/quality-review/QualityReviewPanel'
import type { SchemaField } from '../types/schema'

export function GeneratePage() {
  const { state, dispatch } = useSchemaReducer()
  const {
    state: genState,
    rowCount, setRowCount,
    seed, setSeed, randomizeSeed,
    format, setFormat,
    tableName, setTableName,
    includeCreate, setIncludeCreate,
    csvBom, setCsvBom,
    exportError, exportStatus, exportFilename, exportData,
    generate, patchRows, lastExportedSchema,
    genMode, setGenMode, aiProgress, maxAiRows,
  } = useGenerate()

  const handleSchema = (fields: SchemaField[]) => {
    dispatch({ type: 'SET_SCHEMA', payload: { fields } })
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
            onGenerate={() => { void generate(state) }}
            isGenerating={genState.isGenerating}
            hasFields={state.fields.length > 0}
            tableName={tableName}
            onTableNameChange={setTableName}
            includeCreate={includeCreate}
            onIncludeCreateChange={setIncludeCreate}
            csvBom={csvBom}
            onCsvBomChange={setCsvBom}
            genMode={genMode}
            onGenModeChange={setGenMode}
            aiProgress={aiProgress}
            maxAiRows={maxAiRows}
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

            <FormatPreview
              rows={genState.result.rows}
              format={format}
              opts={{ tableName, bom: csvBom }}
            />

            {exportError && (
              <div className="rounded border border-red-500/40 bg-red-500/10 p-4">
                <p className="text-xs font-mono text-red-600">Export error: {exportError}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-sm text-[var(--color-text-muted)]">
                  Dataset — {genState.result.rows.length} rows generated
                </p>
                <div className="flex items-center gap-3">
                  {exportStatus === 'success' && exportFilename && (
                    <span className="font-mono text-xs text-green-600">
                      ✓ {exportFilename}
                    </span>
                  )}
                  <button
                    onClick={exportData}
                    disabled={genState.isGenerating}
                    aria-label={`Download dataset as ${format.toUpperCase()}`}
                    className="px-4 py-1.5 font-mono text-xs font-semibold rounded border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span aria-hidden="true">↓</span>{' '}Download .{format}
                  </button>
                </div>
              </div>
              <DatasetViewer rows={genState.result.rows} />
            </div>

            {lastExportedSchema && (
              <QualityReviewPanel
                rows={genState.result.rows}
                schema={lastExportedSchema}
                onPatchRows={patchRows}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
