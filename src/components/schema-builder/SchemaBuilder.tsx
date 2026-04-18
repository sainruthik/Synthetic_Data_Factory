import { useState } from 'react'
import type { Dispatch } from 'react'
import type { SchemaState, SchemaAction } from '../../types/schema'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { FieldRow } from './FieldRow'
import { SchemaPreview } from './SchemaPreview'
import { ConstraintEditor } from './ConstraintEditor'

interface SchemaBuilderProps {
  state: SchemaState
  dispatch: Dispatch<SchemaAction>
}

export function SchemaBuilder({ state, dispatch }: SchemaBuilderProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'ADD_FIELD' })}
          >
            <PlusIcon />
            Add Field
          </Button>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {state.fields.length} {state.fields.length === 1 ? 'field' : 'fields'}
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowPreview(v => !v)}
        >
          {showPreview ? 'Hide' : 'Export Schema'}
        </Button>
      </div>

      {/* Field list */}
      <Card className="p-0 overflow-hidden">
        {state.fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <GridIcon />
            <p className="mt-4 text-sm text-[var(--color-text-muted)] font-mono">
              No fields yet — add one to start building your schema.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {state.fields.map(field => (
              <FieldRow key={field.id} field={field} dispatch={dispatch} />
            ))}
          </div>
        )}
      </Card>

      {/* Constraint editor */}
      <div className="mt-6">
        <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Constraints
        </p>
        <ConstraintEditor state={state} dispatch={dispatch} />
      </div>

      {/* JSON preview */}
      {showPreview && <SchemaPreview state={state} />}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="opacity-20">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="18" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
