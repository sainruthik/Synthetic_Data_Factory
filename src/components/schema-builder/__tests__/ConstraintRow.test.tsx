import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Dispatch } from 'react'
import { ConstraintRow } from '../ConstraintRow'
import type {
  SchemaAction,
  SchemaField,
  ComparisonConstraint,
  ConditionalNullConstraint,
  UniqueConstraint,
  CustomConstraint,
} from '../../../types/schema'

const numericField: SchemaField = { id: '1', name: 'age', type: 'integer', nullable: 0, typeOptions: { min: 0, max: 100 } }
const dateField: SchemaField = { id: '2', name: 'created_at', type: 'date', nullable: 0, typeOptions: { format: 'YYYY-MM-DD' } }
const stringField: SchemaField = { id: '3', name: 'name', type: 'string', nullable: 0, typeOptions: null }
const allFields = [numericField, dateField, stringField]

function makeDispatch() {
  return vi.fn() as unknown as Dispatch<SchemaAction>
}

describe('ConstraintRow — comparison', () => {
  const constraint: ComparisonConstraint = {
    id: 'c1',
    type: 'comparison',
    fieldA: 'age',
    operator: '>',
    fieldB: 'created_at',
  }

  it('renders Field A select, operator select, and Field B select', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    expect(screen.getByLabelText(/field a/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/operator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/field b/i)).toBeInTheDocument()
  })

  it('only shows integer/float/date fields in Field A options', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    const selectA = screen.getByLabelText(/field a/i) as HTMLSelectElement
    const options = Array.from(selectA.options).map(o => o.value)
    expect(options).toContain('age')
    expect(options).toContain('created_at')
    expect(options).not.toContain('name')
  })

  it('dispatches UPDATE_CONSTRAINT when operator changes', async () => {
    const dispatch = makeDispatch()
    const user = userEvent.setup()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    await user.selectOptions(screen.getByLabelText(/operator/i), '<')
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'c1', updates: { operator: '<' } },
    })
  })

  it('dispatches UPDATE_CONSTRAINT when Field A changes', async () => {
    const dispatch = makeDispatch()
    const user = userEvent.setup()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    await user.selectOptions(screen.getByLabelText(/field a/i), 'created_at')
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'c1', updates: { fieldA: 'created_at' } },
    })
  })

  it('dispatches REMOVE_CONSTRAINT when delete is clicked', async () => {
    const dispatch = makeDispatch()
    const user = userEvent.setup()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    await user.click(screen.getByRole('button', { name: /delete constraint/i }))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'REMOVE_CONSTRAINT',
      payload: { id: 'c1' },
    })
  })
})

describe('ConstraintRow — conditional_null', () => {
  const constraint: ConditionalNullConstraint = {
    id: 'c2',
    type: 'conditional_null',
    field: 'name',
    whenField: 'age',
    whenValue: 'divorced',
  }

  it('renders null field select, when field select, and when value input', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    expect(screen.getByLabelText(/null field/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/when field/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/when value/i)).toBeInTheDocument()
  })

  it('shows all fields in null field select', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    const select = screen.getByLabelText(/null field/i) as HTMLSelectElement
    const options = Array.from(select.options).map(o => o.value)
    expect(options).toContain('age')
    expect(options).toContain('name')
    expect(options).toContain('created_at')
  })

  it('dispatches UPDATE_CONSTRAINT when whenValue changes', () => {
    const dispatch = makeDispatch()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    fireEvent.change(screen.getByLabelText(/when value/i), { target: { value: 'single' } })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'c2', updates: { whenValue: 'single' } },
    })
  })
})

describe('ConstraintRow — unique', () => {
  const constraint: UniqueConstraint = { id: 'c3', type: 'unique', field: 'name' }

  it('renders a field select', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    expect(screen.getByLabelText(/unique field/i)).toBeInTheDocument()
  })

  it('dispatches UPDATE_CONSTRAINT when field changes', async () => {
    const dispatch = makeDispatch()
    const user = userEvent.setup()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    await user.selectOptions(screen.getByLabelText(/unique field/i), 'age')
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'c3', updates: { field: 'age' } },
    })
  })
})

describe('ConstraintRow — custom', () => {
  const constraint: CustomConstraint = { id: 'c4', type: 'custom', description: '' }

  it('renders a description textarea', () => {
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={makeDispatch()} />)
    expect(screen.getByLabelText(/rule description/i)).toBeInTheDocument()
  })

  it('dispatches UPDATE_CONSTRAINT when description changes', () => {
    const dispatch = makeDispatch()
    render(<ConstraintRow constraint={constraint} fields={allFields} dispatch={dispatch} />)
    fireEvent.change(screen.getByLabelText(/rule description/i), { target: { value: 'salary matches level' } })
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'c4', updates: { description: 'salary matches level' } },
    })
  })
})
