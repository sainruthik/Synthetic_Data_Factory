import { describe, it, expect } from 'vitest'
import { exportedSchemaToFields } from '../schemaToFields'
import type { ExportedSchema } from '../../types/schema'

describe('exportedSchemaToFields', () => {
  it('maps basic fields correctly', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'email', type: 'email', nullable: 0, options: null },
        { name: 'age', type: 'integer', nullable: 10, options: { min: 0, max: 120 } },
      ],
    }
    const result = exportedSchemaToFields(schema)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('email')
    expect(result[0].type).toBe('email')
    expect(result[0].nullable).toBe(0)
    expect(result[0].typeOptions).toBeNull()
    expect(result[1].typeOptions).toEqual({ min: 0, max: 120 })
  })

  it('assigns a non-empty string id to each field', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'x', type: 'string', nullable: 0, options: null },
      ],
    }
    const result = exportedSchemaToFields(schema)
    expect(typeof result[0].id).toBe('string')
    expect(result[0].id.length).toBeGreaterThan(0)
  })

  it('generates unique ids for each field', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'a', type: 'string', nullable: 0, options: null },
        { name: 'b', type: 'string', nullable: 0, options: null },
        { name: 'c', type: 'string', nullable: 0, options: null },
      ],
    }
    const result = exportedSchemaToFields(schema)
    const ids = result.map((f) => f.id)
    expect(new Set(ids).size).toBe(3)
  })

  it('returns an empty array for an empty schema', () => {
    const result = exportedSchemaToFields({ fields: [] })
    expect(result).toHaveLength(0)
  })

  it('maps enum field options correctly', () => {
    const schema: ExportedSchema = {
      fields: [
        { name: 'status', type: 'enum', nullable: 0, options: { options: ['active', 'inactive'] } },
      ],
    }
    const result = exportedSchemaToFields(schema)
    expect(result[0].typeOptions).toEqual({ options: ['active', 'inactive'] })
  })
})
