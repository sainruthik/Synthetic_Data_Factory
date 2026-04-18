import { describe, it, expect } from 'vitest'
import { schemaReducer, initialState } from './useSchemaReducer'
import type { SchemaState, SchemaAction, ComparisonConstraint, CustomConstraint, Constraint } from '../types/schema'

describe('schemaReducer', () => {
  describe('ADD_FIELD', () => {
    it('appends a new field with default values', () => {
      const next = schemaReducer(initialState, { type: 'ADD_FIELD' })
      expect(next.fields).toHaveLength(1)
      const field = next.fields[0]
      expect(field.name).toBe('field_1')
      expect(field.type).toBe('string')
      expect(field.nullable).toBe(0)
      expect(field.typeOptions).toBeNull()
      expect(typeof field.id).toBe('string')
      expect(field.id.length).toBeGreaterThan(0)
    })

    it('increments name suffix for each new field', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'ADD_FIELD' })
      expect(state.fields[0].name).toBe('field_1')
      expect(state.fields[1].name).toBe('field_2')
      expect(state.fields[2].name).toBe('field_3')
    })

    it('assigns unique ids to each field', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'ADD_FIELD' })
      expect(state.fields[0].id).not.toBe(state.fields[1].id)
    })
  })

  describe('REMOVE_FIELD', () => {
    it('removes the field with the given id', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'ADD_FIELD' })
      const idToRemove = state.fields[0].id
      state = schemaReducer(state, { type: 'REMOVE_FIELD', payload: { id: idToRemove } })
      expect(state.fields).toHaveLength(1)
      expect(state.fields[0].id).not.toBe(idToRemove)
    })

    it('is a no-op when removing a nonexistent id', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'REMOVE_FIELD', payload: { id: 'nonexistent' } })
      expect(state.fields).toHaveLength(1)
    })

    it('can remove the last field leaving empty list', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'REMOVE_FIELD', payload: { id } })
      expect(state.fields).toHaveLength(0)
    })
  })

  describe('UPDATE_FIELD', () => {
    it('updates the name of a specific field', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, {
        type: 'UPDATE_FIELD',
        payload: { id, updates: { name: 'user_email' } },
      })
      expect(state.fields[0].name).toBe('user_email')
    })

    it('updates nullable without touching other fields', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, {
        type: 'UPDATE_FIELD',
        payload: { id, updates: { nullable: 25 } },
      })
      expect(state.fields[0].nullable).toBe(25)
      expect(state.fields[0].name).toBe('field_1')
    })

    it('does not mutate other fields', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      state = schemaReducer(state, { type: 'ADD_FIELD' })
      const [id1, id2] = [state.fields[0].id, state.fields[1].id]
      state = schemaReducer(state, {
        type: 'UPDATE_FIELD',
        payload: { id: id1, updates: { name: 'changed' } },
      })
      expect(state.fields.find(f => f.id === id2)!.name).toBe('field_2')
    })

    it('is a no-op for unknown id', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const before = state.fields[0].name
      state = schemaReducer(state, {
        type: 'UPDATE_FIELD',
        payload: { id: 'ghost', updates: { name: 'nope' } },
      })
      expect(state.fields[0].name).toBe(before)
    })
  })

  describe('UPDATE_TYPE', () => {
    it('changes type and resets typeOptions for types without options', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'UPDATE_TYPE', payload: { id, fieldType: 'email' } })
      expect(state.fields[0].type).toBe('email')
      expect(state.fields[0].typeOptions).toBeNull()
    })

    it('sets default integer options when switching to integer', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'UPDATE_TYPE', payload: { id, fieldType: 'integer' } })
      expect(state.fields[0].type).toBe('integer')
      expect(state.fields[0].typeOptions).toEqual({ min: 0, max: 100 })
    })

    it('sets default float options when switching to float', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'UPDATE_TYPE', payload: { id, fieldType: 'float' } })
      expect(state.fields[0].typeOptions).toEqual({ min: 0.0, max: 1.0 })
    })

    it('sets default date options when switching to date', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'UPDATE_TYPE', payload: { id, fieldType: 'date' } })
      expect(state.fields[0].typeOptions).toEqual({ format: 'YYYY-MM-DD' })
    })

    it('sets default enum options when switching to enum', () => {
      let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
      const id = state.fields[0].id
      state = schemaReducer(state, { type: 'UPDATE_TYPE', payload: { id, fieldType: 'enum' } })
      expect(state.fields[0].typeOptions).toEqual({ options: [] })
    })
  })
})

describe('exportSchema', () => {
  it('omits internal id from exported fields', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    let state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'UPDATE_FIELD',
      payload: { id: state.fields[0].id, updates: { name: 'email', nullable: 10 } },
    })
    const result = exportSchema(state)
    expect(result.fields[0]).not.toHaveProperty('id')
    expect(result.fields[0].name).toBe('email')
    expect(result.fields[0].nullable).toBe(10)
  })

  it('renames typeOptions to options in the export', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    let state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'UPDATE_TYPE',
      payload: { id: state.fields[0].id, fieldType: 'integer' },
    })
    const result = exportSchema(state)
    expect(result.fields[0]).toHaveProperty('options')
    expect(result.fields[0]).not.toHaveProperty('typeOptions')
  })

  it('produces valid JSON', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    let state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    const result = exportSchema(state)
    expect(() => JSON.stringify(result)).not.toThrow()
  })

  it('includes constraints array in export', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    let state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'unique' },
    })
    const result = exportSchema(state)
    expect(Array.isArray(result.constraints)).toBe(true)
    expect(result.constraints).toHaveLength(1)
    expect(result.constraints[0].type).toBe('unique')
  })

  it('strips id from exported constraints', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    let state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    state = schemaReducer(state, {
      type: 'UPDATE_CONSTRAINT',
      payload: { id: state.constraints[0].id, updates: { description: 'test rule' } },
    })
    const result = exportSchema(state)
    expect(result.constraints[0]).not.toHaveProperty('id')
    expect((result.constraints[0] as { description: string }).description).toBe('test rule')
  })

  it('exports empty constraints array when no constraints exist', async () => {
    const { exportSchema } = await import('../lib/exportSchema')
    const state: SchemaState = schemaReducer(initialState, { type: 'ADD_FIELD' })
    const result = exportSchema(state)
    expect(result.constraints).toEqual([])
  })
})

describe('schemaReducer — exhaustive default (HIGH-2)', () => {
  it('returns current state unchanged for an unrecognized action type', () => {
    const state = schemaReducer(initialState, { type: 'ADD_FIELD' })
    // Cast to bypass TypeScript — simulates runtime unknown action (e.g. hot-reload, future action not yet handled)
    const result = schemaReducer(state, { type: 'UNKNOWN_ACTION' } as unknown as SchemaAction)
    expect(result).toBe(state)
  })
})

// Type-check: SchemaAction discriminated union compiles
const _action: SchemaAction = { type: 'ADD_FIELD' }
void _action

// ─── Constraint actions ───────────────────────────────────────────────────────

describe('initialState', () => {
  it('has empty constraints array', () => {
    expect(initialState.constraints).toEqual([])
  })
})

describe('ADD_CONSTRAINT', () => {
  it('adds a comparison constraint with default operator', () => {
    const state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'comparison' },
    })
    expect(state.constraints).toHaveLength(1)
    expect(state.constraints[0].type).toBe('comparison')
    expect((state.constraints[0] as ComparisonConstraint).operator).toBe('>')
  })

  it('adds a conditional_null constraint', () => {
    const state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'conditional_null' },
    })
    expect(state.constraints[0].type).toBe('conditional_null')
  })

  it('adds a unique constraint', () => {
    const state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'unique' },
    })
    expect(state.constraints[0].type).toBe('unique')
  })

  it('adds a custom constraint with empty description', () => {
    const state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    expect(state.constraints[0].type).toBe('custom')
    expect((state.constraints[0] as CustomConstraint).description).toBe('')
  })

  it('assigns unique ids to each constraint', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'unique' },
    })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    expect(state.constraints[0].id).not.toBe(state.constraints[1].id)
  })

  it('does not mutate the fields array', () => {
    const state = schemaReducer(initialState, { type: 'ADD_FIELD' })
    const fieldsBefore = state.fields
    const next = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    expect(next.fields).toBe(fieldsBefore)
  })
})

describe('REMOVE_CONSTRAINT', () => {
  it('removes the constraint with the given id', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'unique' },
    })
    const idToRemove = state.constraints[0].id
    state = schemaReducer(state, {
      type: 'REMOVE_CONSTRAINT',
      payload: { id: idToRemove },
    })
    expect(state.constraints).toHaveLength(1)
    expect(state.constraints[0].id).not.toBe(idToRemove)
  })

  it('is a no-op for unknown id', () => {
    const state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    const next = schemaReducer(state, {
      type: 'REMOVE_CONSTRAINT',
      payload: { id: 'ghost' },
    })
    expect(next.constraints).toHaveLength(1)
  })

  it('does not mutate fields array', () => {
    let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    const fieldsBefore = state.fields
    const next = schemaReducer(state, {
      type: 'REMOVE_CONSTRAINT',
      payload: { id: state.constraints[0].id },
    })
    expect(next.fields).toBe(fieldsBefore)
  })
})

describe('UPDATE_CONSTRAINT', () => {
  it('updates the description of a custom constraint', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    const id = state.constraints[0].id
    state = schemaReducer(state, {
      type: 'UPDATE_CONSTRAINT',
      payload: { id, updates: { description: 'salary matches seniority' } },
    })
    expect((state.constraints[0] as CustomConstraint).description).toBe('salary matches seniority')
  })

  it('updates the operator of a comparison constraint', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'comparison' },
    })
    const id = state.constraints[0].id
    state = schemaReducer(state, {
      type: 'UPDATE_CONSTRAINT',
      payload: { id, updates: { operator: '<' } },
    })
    expect((state.constraints[0] as ComparisonConstraint).operator).toBe('<')
  })

  it('is a no-op for unknown id', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    const before = (state.constraints[0] as CustomConstraint).description
    state = schemaReducer(state, {
      type: 'UPDATE_CONSTRAINT',
      payload: { id: 'ghost', updates: { description: 'nope' } },
    })
    expect((state.constraints[0] as CustomConstraint).description).toBe(before)
  })

  it('preserves the type of the constraint', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    const id = state.constraints[0].id
    state = schemaReducer(state, {
      type: 'UPDATE_CONSTRAINT',
      payload: { id, updates: {} },
    })
    expect(state.constraints[0].type).toBe('custom')
  })
})

describe('field actions preserve constraints', () => {
  it('ADD_FIELD does not reset constraints', () => {
    let state = schemaReducer(initialState, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    state = schemaReducer(state, { type: 'ADD_FIELD' })
    expect(state.constraints).toHaveLength(1)
  })

  it('REMOVE_FIELD does not reset constraints', () => {
    let state = schemaReducer(initialState, { type: 'ADD_FIELD' })
    state = schemaReducer(state, {
      type: 'ADD_CONSTRAINT',
      payload: { constraintType: 'custom' },
    })
    state = schemaReducer(state, {
      type: 'REMOVE_FIELD',
      payload: { id: state.fields[0].id },
    })
    expect(state.constraints).toHaveLength(1)
  })

  it('SET_SCHEMA with constraints sets them', () => {
    const constraint: Constraint = { id: 'c1', type: 'unique', field: 'email' }
    const state = schemaReducer(initialState, {
      type: 'SET_SCHEMA',
      payload: { fields: [], constraints: [constraint] },
    })
    expect(state.constraints).toHaveLength(1)
    expect(state.constraints[0].type).toBe('unique')
  })

  it('SET_SCHEMA without constraints defaults to empty array', () => {
    const state = schemaReducer(initialState, {
      type: 'SET_SCHEMA',
      payload: { fields: [] },
    })
    expect(state.constraints).toEqual([])
  })
})
