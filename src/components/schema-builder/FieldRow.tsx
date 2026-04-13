import type { Dispatch } from 'react'
import type { SchemaField, SchemaAction, FieldType } from '../../types/schema'
import { FIELD_TYPES } from '../../types/schema'
import { Button } from '../ui/Button'
import { TypeOptions } from './TypeOptions'
import { cn } from '../../lib/cn'
import { fieldInputBase } from '../../lib/styles'

interface FieldRowProps {
  field: SchemaField
  dispatch: Dispatch<SchemaAction>
}

const inputClass = cn(
  fieldInputBase,
  'transition-colors duration-[var(--duration-fast)]',
  'hover:border-[var(--color-border-hover)]'
)

export function FieldRow({ field, dispatch }: FieldRowProps) {
  return (
    <div className="group rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-border-hover)]">
      <div className="flex items-center gap-3">
        {/* Name */}
        <input
          type="text"
          value={field.name}
          aria-label="Field name"
          className={cn(inputClass, 'font-mono flex-1 min-w-0')}
          onChange={e =>
            dispatch({
              type: 'UPDATE_FIELD',
              payload: { id: field.id, updates: { name: e.target.value } },
            })
          }
        />

        {/* Type */}
        <select
          value={field.type}
          aria-label="Field type"
          className={cn(inputClass, 'cursor-pointer')}
          onChange={e => {
            const value = e.target.value
            if ((FIELD_TYPES as readonly string[]).includes(value)) {
              dispatch({
                type: 'UPDATE_TYPE',
                payload: { id: field.id, fieldType: value as FieldType },
              })
            }
          }}
        >
          {FIELD_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Nullable slider */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="range"
            min="0"
            max="100"
            value={field.nullable}
            aria-label="Null probability"
            className="schema-range w-20 cursor-pointer"
            onChange={e =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: field.id, updates: { nullable: Number(e.target.value) } },
              })
            }
          />
          <span className="text-xs font-mono text-[var(--color-text-muted)] w-8 text-right tabular-nums">
            {field.nullable}%
          </span>
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete field"
          onClick={() => dispatch({ type: 'REMOVE_FIELD', payload: { id: field.id } })}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-red-400"
        >
          <TrashIcon />
        </Button>
      </div>

      <TypeOptions field={field} dispatch={dispatch} />
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 3h12M5 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M11 3l-.867 8.656A1 1 0 0 1 9.14 12H4.86a1 1 0 0 1-.993-.89L3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
