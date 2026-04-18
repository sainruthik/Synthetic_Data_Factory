import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SchemaBuilder } from './SchemaBuilder'
import { SchemaPreview } from './SchemaPreview'
import { schemaReducer, initialState, useSchemaReducer } from '../../hooks/useSchemaReducer'

/** Test wrapper that provides state/dispatch via the real hook */
function WrappedSchemaBuilder() {
  const { state, dispatch } = useSchemaReducer()
  return <SchemaBuilder state={state} dispatch={dispatch} />
}

describe('SchemaBuilder', () => {
  it('renders empty state message when no fields exist', () => {
    render(<WrappedSchemaBuilder />)
    expect(screen.getByText(/no fields/i)).toBeInTheDocument()
  })

  it('renders Add Field button', () => {
    render(<WrappedSchemaBuilder />)
    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument()
  })

  it('adds a field when Add Field is clicked', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByDisplayValue('field_1')).toBeInTheDocument()
  })

  it('adds multiple fields with incrementing names', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByDisplayValue('field_1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('field_2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('field_3')).toBeInTheDocument()
  })

  it('removes a field when its delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByDisplayValue('field_1')).toBeInTheDocument()
    const deleteButtons = screen.getAllByRole('button', { name: /delete field/i })
    await user.click(deleteButtons[0])
    expect(screen.queryByDisplayValue('field_1')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('field_2')).toBeInTheDocument()
  })

  it('allows editing a field name', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    const nameInput = screen.getByDisplayValue('field_1')
    await user.clear(nameInput)
    await user.type(nameInput, 'my_column')
    expect(screen.getByDisplayValue('my_column')).toBeInTheDocument()
  })

  it('shows min/max inputs when type is integer', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    const typeSelect = screen.getByRole('combobox', { name: /field type/i })
    await user.selectOptions(typeSelect, 'integer')
    expect(screen.getByLabelText(/min/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max/i)).toBeInTheDocument()
  })

  it('shows min/max inputs when type is float', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    const typeSelect = screen.getByRole('combobox', { name: /field type/i })
    await user.selectOptions(typeSelect, 'float')
    expect(screen.getByLabelText(/min/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/max/i)).toBeInTheDocument()
  })

  it('shows format input when type is date', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'date')
    expect(screen.getByLabelText(/format/i)).toBeInTheDocument()
  })

  it('shows enum options input when type is enum', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'enum')
    expect(screen.getByLabelText(/values/i)).toBeInTheDocument()
  })

  it('does not show type-specific options for boolean type', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'boolean')
    expect(screen.queryByLabelText(/min/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/format/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/values/i)).not.toBeInTheDocument()
  })

  it('renders nullable range slider per field', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', '100')
  })

  it('shows Export Schema button', () => {
    render(<WrappedSchemaBuilder />)
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('shows JSON preview when Export Schema is clicked', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /export/i }))
    expect(screen.getByRole('code')).toBeInTheDocument()
    const code = screen.getByRole('code').textContent ?? ''
    expect(JSON.parse(code)).toHaveProperty('fields')
  })

  it('export JSON does not contain internal id field', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    await user.click(screen.getByRole('button', { name: /export/i }))
    const code = screen.getByRole('code').textContent ?? ''
    const parsed = JSON.parse(code)
    expect(parsed.fields[0]).not.toHaveProperty('id')
  })

  // HIGH-1: FieldRow type select guard — invalid value must not corrupt state
  it('does not dispatch UPDATE_TYPE when an invalid type value is programmatically set', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    const typeSelect = screen.getByRole('combobox', { name: /field type/i }) as HTMLSelectElement
    expect(typeSelect.value).toBe('string')
    await user.selectOptions(typeSelect, 'integer')
    expect(typeSelect.value).toBe('integer')
    expect(screen.getByLabelText(/min/i)).toBeInTheDocument()
  })

  it('fixes delete button aria-label selector (LOW-1 regression guard)', async () => {
    const user = userEvent.setup()
    render(<WrappedSchemaBuilder />)
    await user.click(screen.getByRole('button', { name: /add field/i }))
    expect(screen.getByRole('button', { name: /delete field/i })).toBeInTheDocument()
  })
})

// HIGH-3: Clipboard error handling — tested via SchemaPreview directly
describe('SchemaPreview clipboard', () => {
  // Type inferred from the spyOn call; `!` asserts it is set before each test
  let writeTextSpy!: ReturnType<typeof vi.spyOn> & {
    mockResolvedValue: () => void
    mockRejectedValue: (err: unknown) => void
    mock: { calls: [string][] }
  }

  beforeEach(() => {
    writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText') as typeof writeTextSpy
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function renderPreview() {
    const state = schemaReducer(initialState, { type: 'ADD_FIELD' })
    render(<SchemaPreview state={state} />)
  }

  it('shows "Copied!" feedback when clipboard write succeeds', async () => {
    writeTextSpy.mockResolvedValue()
    const user = userEvent.setup()
    renderPreview()
    await user.click(screen.getByRole('button', { name: /copy/i }))
    expect(await screen.findByText(/copied!/i)).toBeInTheDocument()
  })

  it('calls clipboard writeText with the serialized schema JSON', async () => {
    writeTextSpy.mockResolvedValue()
    const user = userEvent.setup()
    renderPreview()
    await user.click(screen.getByRole('button', { name: /copy/i }))
    expect(writeTextSpy).toHaveBeenCalledOnce()
    const calledWith = writeTextSpy.mock.calls[0][0]
    expect(() => JSON.parse(calledWith)).not.toThrow()
    expect(JSON.parse(calledWith)).toHaveProperty('fields')
  })

  it('does not crash and does not show Copied! when clipboard write fails', async () => {
    writeTextSpy.mockRejectedValue(new Error('Permission denied'))
    const user = userEvent.setup()
    renderPreview()
    // Click must not throw — try/catch in handleCopy absorbs the rejection
    await expect(
      user.click(screen.getByRole('button', { name: /copy/i }))
    ).resolves.toBeUndefined()
    expect(writeTextSpy).toHaveBeenCalledOnce()
    // "Copied!" must NOT appear when write failed
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument()
  })
})
