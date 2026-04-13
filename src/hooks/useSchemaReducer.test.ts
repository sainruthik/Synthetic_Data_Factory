import { describe, it, expect } from 'vitest'
import { schemaReducer, initialState } from './useSchemaReducer'
import type { SchemaState, SchemaAction } from '../types/schema'

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
