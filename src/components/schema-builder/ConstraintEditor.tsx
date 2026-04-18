import { useState } from 'react'
import type { Dispatch } from 'react'
import type { SchemaState, SchemaAction, ConstraintType } from '../../types/schema'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { ConstraintRow } from './ConstraintRow'

interface ConstraintEditorProps {
  state: SchemaState
  dispatch: Dispatch<SchemaAction>
}

const CONSTRAINT_OPTIONS: { value: ConstraintType; label: string }[] = [
  { value: 'comparison', label: 'Comparison (A > B)' },
  { value: 'conditional_null', label: 'Conditional Null' },
  { value: 'unique', label: 'Unique' },
  { value: 'custom', label: 'Custom Rule' },
]

export function ConstraintEditor({ state, dispatch }: ConstraintEditorProps) {
  const [selectedType, setSelectedType] = useState<ConstraintType>('comparison')
  const count = state.constraints.length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <select
            aria-label="Constraint type"
            value={selectedType}
            className="rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1 text-sm text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-1 cursor-pointer"
            onChange={e => setSelectedType(e.target.value as ConstraintType)}
          >
            {CONSTRAINT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'ADD_CONSTRAINT', payload: { constraintType: selectedType } })}
          >
            <PlusIcon />
            Add Constraint
          </Button>
          {count > 0 && (
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {count} {count === 1 ? 'constraint' : 'constraints'}
            </span>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <LinkIcon />
            <p className="mt-3 text-sm text-[var(--color-text-muted)] font-mono">
              No constraints yet — add one to define rules between fields.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {state.constraints.map(c => (
              <ConstraintRow key={c.id} constraint={c} fields={state.fields} dispatch={dispatch} />
            ))}
          </div>
        )}
      </Card>
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

function LinkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="opacity-20">
      <path d="M11 17l-3 3a4 4 0 0 1-5.657-5.657l3-3A4 4 0 0 1 10.83 11M17 11l3-3a4 4 0 0 1 5.657 5.657l-3 3A4 4 0 0 1 17.17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
