import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Dispatch } from 'react'
import { ConstraintEditor } from '../ConstraintEditor'
import type { SchemaAction, SchemaState } from '../../../types/schema'

function makeDispatch() {
  return vi.fn() as unknown as Dispatch<SchemaAction>
}

const emptyState: SchemaState = { fields: [], constraints: [] }

const stateWithConstraints: SchemaState = {
  fields: [],
  constraints: [
    { id: 'c1', type: 'unique', field: 'email' },
    { id: 'c2', type: 'custom', description: 'salary matches level' },
  ],
}

describe('ConstraintEditor', () => {
  it('shows empty state message when no constraints exist', () => {
    render(<ConstraintEditor state={emptyState} dispatch={makeDispatch()} />)
    expect(screen.getByText(/no constraints yet/i)).toBeInTheDocument()
  })

  it('renders an Add Constraint button', () => {
    render(<ConstraintEditor state={emptyState} dispatch={makeDispatch()} />)
    expect(screen.getByRole('button', { name: /add constraint/i })).toBeInTheDocument()
  })

  it('type dropdown has 4 options', () => {
    render(<ConstraintEditor state={emptyState} dispatch={makeDispatch()} />)
    const select = screen.getByLabelText(/constraint type/i) as HTMLSelectElement
    expect(select.options).toHaveLength(4)
    const values = Array.from(select.options).map(o => o.value)
    expect(values).toContain('comparison')
    expect(values).toContain('conditional_null')
    expect(values).toContain('unique')
    expect(values).toContain('custom')
  })

  it('dispatches ADD_CONSTRAINT with selected type when Add Constraint is clicked', async () => {
    const dispatch = makeDispatch()
    const user = userEvent.setup()
    render(<ConstraintEditor state={emptyState} dispatch={dispatch} />)
    await user.selectOptions(screen.getByLabelText(/constraint type/i), 'custom')
    await user.click(screen.getByRole('button', { name: /add constraint/i }))
    expect(dispatch).toHaveBeenCalledWith({
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
  })

  it('renders one row per constraint', () => {
    render(<ConstraintEditor state={stateWithConstraints} dispatch={makeDispatch()} />)
    expect(screen.getAllByRole('button', { name: /delete constraint/i })).toHaveLength(2)
  })

  it('does not show empty state when constraints exist', () => {
    render(<ConstraintEditor state={stateWithConstraints} dispatch={makeDispatch()} />)
    expect(screen.queryByText(/no constraints yet/i)).not.toBeInTheDocument()
  })

  it('shows constraint count in header', () => {
    render(<ConstraintEditor state={stateWithConstraints} dispatch={makeDispatch()} />)
    expect(screen.getByText(/2 constraints/i)).toBeInTheDocument()
  })
})
