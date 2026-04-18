import type { Dispatch } from 'react'
import type {
  Constraint,
  SchemaField,
  SchemaAction,
  ComparisonConstraint,
  ConditionalNullConstraint,
  UniqueConstraint,
  CustomConstraint,
} from '../../types/schema'
import { Button } from '../ui/Button'
import { cn } from '../../lib/cn'
import { fieldInputBase } from '../../lib/styles'
import { getEligibleFields } from './constraint-defaults'

interface ConstraintRowProps {
  constraint: Constraint
  fields: SchemaField[]
  dispatch: Dispatch<SchemaAction>
}

const inputClass = cn(
  fieldInputBase,
  'transition-colors duration-[var(--duration-fast)]',
  'hover:border-[var(--color-border-hover)]'
)

function FieldSelect({
  label,
  value,
  fields,
  onChange,
}: {
  label: string
  value: string
  fields: SchemaField[]
  onChange: (name: string) => void
}) {
  return (
    <select
      aria-label={label}
      value={value}
      className={cn(inputClass, 'cursor-pointer')}
      onChange={e => onChange(e.target.value)}
    >
      {fields.length === 0 && <option value="">— no eligible fields —</option>}
      {fields.map(f => (
        <option key={f.id} value={f.name}>{f.name}</option>
      ))}
    </select>
  )
}

function ComparisonInputs({
  constraint,
  fields,
  dispatch,
}: {
  constraint: ComparisonConstraint
  fields: SchemaField[]
  dispatch: Dispatch<SchemaAction>
}) {
  const eligible = getEligibleFields(fields, true)
  const update = (updates: Partial<Omit<ComparisonConstraint, 'id' | 'type'>>) =>
    dispatch({ type: 'UPDATE_CONSTRAINT', payload: { id: constraint.id, updates } })

  return (
    <>
      <FieldSelect
        label="Field A"
        value={constraint.fieldA}
        fields={eligible}
        onChange={fieldA => update({ fieldA })}
      />
      <select
        aria-label="Comparison operator"
        value={constraint.operator}
        className={cn(inputClass, 'cursor-pointer')}
        onChange={e => update({ operator: e.target.value as ComparisonConstraint['operator'] })}
      >
        <option value=">">{'>'}</option>
        <option value="<">{'<'}</option>
        <option value=">=">{'>='}</option>
      </select>
      <FieldSelect
        label="Field B"
        value={constraint.fieldB}
        fields={eligible}
        onChange={fieldB => update({ fieldB })}
      />
    </>
  )
}

function ConditionalNullInputs({
  constraint,
  fields,
  dispatch,
}: {
  constraint: ConditionalNullConstraint
  fields: SchemaField[]
  dispatch: Dispatch<SchemaAction>
}) {
  const update = (updates: Partial<Omit<ConditionalNullConstraint, 'id' | 'type'>>) =>
    dispatch({ type: 'UPDATE_CONSTRAINT', payload: { id: constraint.id, updates } })

  return (
    <>
      <FieldSelect
        label="Null field"
        value={constraint.field}
        fields={fields}
        onChange={field => update({ field })}
      />
      <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0">is null when</span>
      <FieldSelect
        label="When field"
        value={constraint.whenField}
        fields={fields}
        onChange={whenField => update({ whenField })}
      />
      <span className="text-xs text-[var(--color-text-muted)] font-mono shrink-0">=</span>
      <input
        type="text"
        aria-label="When value"
        value={constraint.whenValue}
        placeholder="value"
        className={cn(inputClass, 'min-w-0 flex-1')}
        onChange={e => update({ whenValue: e.target.value })}
      />
    </>
  )
}

function UniqueInputs({
  constraint,
  fields,
  dispatch,
}: {
  constraint: UniqueConstraint
  fields: SchemaField[]
  dispatch: Dispatch<SchemaAction>
}) {
  return (
    <FieldSelect
      label="Unique field"
      value={constraint.field}
      fields={fields}
      onChange={field =>
        dispatch({ type: 'UPDATE_CONSTRAINT', payload: { id: constraint.id, updates: { field } } })
      }
    />
  )
}

function CustomInputs({
  constraint,
  dispatch,
}: {
  constraint: CustomConstraint
  dispatch: Dispatch<SchemaAction>
}) {
  return (
    <textarea
      aria-label="Rule description"
      value={constraint.description}
      placeholder="Describe the rule in plain English…"
      rows={2}
      className={cn(inputClass, 'flex-1 resize-none leading-snug')}
      onChange={e =>
        dispatch({
          type: 'UPDATE_CONSTRAINT',
          payload: { id: constraint.id, updates: { description: e.target.value } },
        })
      }
    />
  )
}

const TYPE_LABEL: Record<Constraint['type'], string> = {
  comparison: 'comparison',
  conditional_null: 'conditional null',
  unique: 'unique',
  custom: 'custom rule',
}

export function ConstraintRow({ constraint, fields, dispatch }: ConstraintRowProps) {
  return (
    <div className="group rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-border-hover)]">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-[var(--color-text-muted)] pt-1.5 shrink-0 w-24">
          {TYPE_LABEL[constraint.type]}
        </span>

        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {constraint.type === 'comparison' && (
            <ComparisonInputs constraint={constraint} fields={fields} dispatch={dispatch} />
          )}
          {constraint.type === 'conditional_null' && (
            <ConditionalNullInputs constraint={constraint} fields={fields} dispatch={dispatch} />
          )}
          {constraint.type === 'unique' && (
            <UniqueInputs constraint={constraint} fields={fields} dispatch={dispatch} />
          )}
          {constraint.type === 'custom' && (
            <CustomInputs constraint={constraint} dispatch={dispatch} />
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Delete constraint"
          onClick={() => dispatch({ type: 'REMOVE_CONSTRAINT', payload: { id: constraint.id } })}
          className="shrink-0 text-[var(--color-text-muted)] hover:text-red-400"
        >
          <TrashIcon />
        </Button>
      </div>
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
