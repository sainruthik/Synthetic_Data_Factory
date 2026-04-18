import { describe, it, expect } from 'vitest'
import { generateDataset } from '../generateDataset'
import type { ExportedSchema } from '../../types/schema'

const simpleSchema: ExportedSchema = {
  fields: [
    { name: 'id',    type: 'integer', nullable: 0, options: { min: 1, max: 1000 } },
    { name: 'name',  type: 'string',  nullable: 0, options: null },
    { name: 'email', type: 'email',   nullable: 0, options: null },
  ],
  constraints: [],
}

describe('generateDataset', () => {
  it('generates correct row count', () => {
    expect(generateDataset(simpleSchema, 10, 42).rows).toHaveLength(10)
  })

  it('generates rows with all field names', () => {
    const { rows } = generateDataset(simpleSchema, 5, 42)
    for (const row of rows) {
      expect(row).toHaveProperty('id')
      expect(row).toHaveProperty('name')
      expect(row).toHaveProperty('email')
    }
  })

  it('is deterministic with same seed', () => {
    const r1 = generateDataset(simpleSchema, 5, 42)
    const r2 = generateDataset(simpleSchema, 5, 42)
    expect(r1.rows).toEqual(r2.rows)
  })

  it('produces different output with different seeds', () => {
    const r1 = generateDataset(simpleSchema, 5, 42)
    const r2 = generateDataset(simpleSchema, 5, 99)
    expect(r1.rows).not.toEqual(r2.rows)
  })

  it('always nulls field when nullable is 100', () => {
    const schema: ExportedSchema = {
      fields: [{ name: 'val', type: 'string', nullable: 100, options: null }],
      constraints: [],
    }
    const { rows } = generateDataset(schema, 50, 42)
    expect(rows.every(r => r.val === null)).toBe(true)
  })

  it('never nulls field when nullable is 0', () => {
    const schema: ExportedSchema = {
      fields: [{ name: 'val', type: 'string', nullable: 0, options: null }],
      constraints: [],
    }
    const { rows } = generateDataset(schema, 50, 42)
    expect(rows.every(r => r.val !== null)).toBe(true)
  })

  it('has no violations for clean schema', () => {
    expect(generateDataset(simpleSchema, 10, 42).violations).toHaveLength(0)
  })

  it('enforces unique constraint on uuid field', () => {
    const schema: ExportedSchema = {
      fields: [{ name: 'id', type: 'uuid', nullable: 0, options: null }],
      constraints: [{ type: 'unique', field: 'id' }],
    }
    const { rows, violations } = generateDataset(schema, 100, 42)
    expect(violations.filter(v => v.type === 'unique')).toHaveLength(0)
    const values = new Set(rows.map(r => r.id))
    expect(values.size).toBe(100)
  })

  it('applies conditional_null constraint', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'status',        type: 'enum', nullable: 0, options: { options: ['active'] } },
        { name: 'deactivated_at', type: 'date', nullable: 0, options: null },
      ],
      constraints: [{
        type: 'conditional_null',
        field: 'deactivated_at',
        whenField: 'status',
        whenValue: 'active',
      }],
    }
    const { rows } = generateDataset(schema, 10, 42)
    for (const row of rows) {
      expect(row.deactivated_at).toBeNull()
    }
  })

  it('reports comparison violations when constraint cannot be met', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'min_val', type: 'integer', nullable: 0, options: { min: 50, max: 100 } },
        { name: 'max_val', type: 'integer', nullable: 0, options: { min: 1,  max: 10  } },
      ],
      constraints: [{ type: 'comparison', fieldA: 'min_val', operator: '<', fieldB: 'max_val' }],
    }
    const { violations } = generateDataset(schema, 10, 42)
    expect(violations.some(v => v.type === 'comparison')).toBe(true)
  })

  it('always adds a warning for custom constraints', () => {
    const schema: ExportedSchema = {
      fields: [{ name: 'x', type: 'integer', nullable: 0, options: { min: 1, max: 10 } }],
      constraints: [{ type: 'custom', description: 'must follow business rule' }],
    }
    const { violations } = generateDataset(schema, 5, 42)
    expect(violations.some(v => v.type === 'custom')).toBe(true)
  })

  it('generates 0 rows when rowCount is 0', () => {
    expect(generateDataset(simpleSchema, 0, 42).rows).toHaveLength(0)
  })
})
