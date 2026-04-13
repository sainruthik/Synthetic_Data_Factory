import type { Dispatch } from 'react'
import type { SchemaField, SchemaAction, IntegerOptions, FloatOptions, DateOptions, EnumOptions } from '../../types/schema'
import { getDefaultTypeOptions } from './field-defaults'
import { cn } from '../../lib/cn'
import { fieldInputBase } from '../../lib/styles'

interface TypeOptionsProps {
  field: SchemaField
  dispatch: Dispatch<SchemaAction>
}

const inputClass = cn(fieldInputBase, 'w-full')

const labelClass = 'block text-xs text-[var(--color-text-muted)] mb-0.5'

export function TypeOptions({ field, dispatch }: TypeOptionsProps) {
  if (field.type === 'integer' || field.type === 'float') {
    const opts = (field.typeOptions ?? getDefaultTypeOptions(field.type)) as IntegerOptions | FloatOptions
    const step = field.type === 'float' ? '0.01' : '1'
    return (
      <div className="flex gap-3 mt-2">
        <label className="flex-1">
          <span className={labelClass}>Min</span>
          <input
            type="number"
            step={step}
            value={opts.min}
            aria-label="Min"
            className={inputClass}
            onChange={e =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: field.id, updates: { typeOptions: { ...opts, min: Number(e.target.value) } } },
              })
            }
          />
        </label>
        <label className="flex-1">
          <span className={labelClass}>Max</span>
          <input
            type="number"
            step={step}
            value={opts.max}
            aria-label="Max"
            className={inputClass}
            onChange={e =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: field.id, updates: { typeOptions: { ...opts, max: Number(e.target.value) } } },
              })
            }
          />
        </label>
      </div>
    )
  }

  if (field.type === 'date') {
    const opts = (field.typeOptions ?? getDefaultTypeOptions(field.type)) as DateOptions
    return (
      <div className="mt-2">
        <label>
          <span className={labelClass}>Format</span>
          <input
            type="text"
            value={opts.format}
            aria-label="Format"
            className={inputClass}
            onChange={e =>
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: field.id, updates: { typeOptions: { format: e.target.value } } },
              })
            }
          />
        </label>
      </div>
    )
  }

  if (field.type === 'enum') {
    const opts = (field.typeOptions ?? getDefaultTypeOptions(field.type)) as EnumOptions
    return (
      <div className="mt-2">
        <label>
          <span className={labelClass}>Values (comma-separated)</span>
          <input
            type="text"
            value={opts.options.join(', ')}
            aria-label="Values"
            className={inputClass}
            placeholder="active, inactive, pending"
            onChange={e => {
              const options = e.target.value
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)
              dispatch({
                type: 'UPDATE_FIELD',
                payload: { id: field.id, updates: { typeOptions: { options } } },
              })
            }}
          />
        </label>
      </div>
    )
  }

  return null
}
