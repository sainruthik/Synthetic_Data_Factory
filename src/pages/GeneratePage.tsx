import { useSchemaReducer } from '../hooks/useSchemaReducer'
import { SchemaBuilder } from '../components/schema-builder/SchemaBuilder'
import { ChatPanel } from '../components/chat/ChatPanel'
import type { SchemaField } from '../types/schema'

export function GeneratePage() {
  const { state, dispatch } = useSchemaReducer()

  const handleSchema = (fields: SchemaField[]) => {
    dispatch({ type: 'SET_SCHEMA', payload: { fields } })
  }

  return (
    <section
      aria-labelledby="generate-heading"
      className="mx-auto max-w-7xl px-6 py-10"
    >
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
        {/* Left: AI chat panel */}
        <div className="flex flex-col" style={{ minHeight: '560px' }}>
          <ChatPanel onSchema={handleSchema} />
        </div>

        {/* Right: Schema builder */}
        <div>
          <SchemaBuilder state={state} dispatch={dispatch} />
        </div>
      </div>
    </section>
  )
}
