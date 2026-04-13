import { describe, it, expect } from 'vitest'
import { parseSchemaResponse } from '../parseSchema'

describe('parseSchemaResponse', () => {
  it('parses a valid JSON response', () => {
    const input = JSON.stringify({
      fields: [{ name: 'id', type: 'uuid', nullable: 0, options: null }],
    })
    const result = parseSchemaResponse(input)
    expect(result.fields).toHaveLength(1)
    expect(result.fields[0].name).toBe('id')
    expect(result.fields[0].type).toBe('uuid')
  })

  it('strips markdown json code fences', () => {
    const input = '```json\n{"fields":[{"name":"age","type":"integer","nullable":10,"options":{"min":0,"max":120}}]}\n```'
    const result = parseSchemaResponse(input)
    expect(result.fields[0].name).toBe('age')
  })

  it('strips plain code fences', () => {
    const input = '```\n{"fields":[{"name":"email","type":"email","nullable":0,"options":null}]}\n```'
    const result = parseSchemaResponse(input)
    expect(result.fields[0].type).toBe('email')
  })

  it('handles multiple fields', () => {
    const input = JSON.stringify({
      fields: [
        { name: 'first_name', type: 'string', nullable: 0, options: null },
        { name: 'age', type: 'integer', nullable: 20, options: { min: 0, max: 150 } },
        { name: 'is_active', type: 'boolean', nullable: 0, options: null },
      ],
    })
    const result = parseSchemaResponse(input)
    expect(result.fields).toHaveLength(3)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseSchemaResponse('not json at all')).toThrow('invalid JSON')
  })

  it('throws if result is not an object', () => {
    expect(() => parseSchemaResponse('"just a string"')).toThrow('not a JSON object')
  })

  it('throws if fields array is missing', () => {
    expect(() => parseSchemaResponse('{"data":[]}')).toThrow('"fields" array')
  })

  it('throws if a field has an invalid type', () => {
    const input = JSON.stringify({
      fields: [{ name: 'x', type: 'unknown_type', nullable: 0, options: null }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if nullable is out of range', () => {
    const input = JSON.stringify({
      fields: [{ name: 'x', type: 'string', nullable: 150, options: null }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if a field name is empty', () => {
    const input = JSON.stringify({
      fields: [{ name: '', type: 'string', nullable: 0, options: null }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('handles an empty fields array without throwing', () => {
    const result = parseSchemaResponse(JSON.stringify({ fields: [] }))
    expect(result.fields).toHaveLength(0)
  })

  // ─── [L3] Options-shape mismatch tests (RED until M1 is implemented) ──────

  it('accepts valid integer options with min and max', () => {
    const input = JSON.stringify({
      fields: [{ name: 'age', type: 'integer', nullable: 0, options: { min: 0, max: 120 } }],
    })
    expect(() => parseSchemaResponse(input)).not.toThrow()
  })

  it('accepts valid float options with min and max', () => {
    const input = JSON.stringify({
      fields: [{ name: 'price', type: 'float', nullable: 0, options: { min: 0.0, max: 999.99 } }],
    })
    expect(() => parseSchemaResponse(input)).not.toThrow()
  })

  it('accepts valid date options with format string', () => {
    const input = JSON.stringify({
      fields: [{ name: 'created_at', type: 'date', nullable: 0, options: { format: 'YYYY-MM-DD' } }],
    })
    expect(() => parseSchemaResponse(input)).not.toThrow()
  })

  it('accepts valid enum options with string array', () => {
    const input = JSON.stringify({
      fields: [{ name: 'status', type: 'enum', nullable: 0, options: { options: ['active', 'inactive'] } }],
    })
    expect(() => parseSchemaResponse(input)).not.toThrow()
  })

  it('throws if integer field has date-shaped options', () => {
    const input = JSON.stringify({
      fields: [{ name: 'age', type: 'integer', nullable: 0, options: { format: 'YYYY-MM-DD' } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if float field has enum-shaped options', () => {
    const input = JSON.stringify({
      fields: [{ name: 'price', type: 'float', nullable: 0, options: { options: ['a', 'b'] } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if date field has numeric options instead of format string', () => {
    const input = JSON.stringify({
      fields: [{ name: 'dob', type: 'date', nullable: 0, options: { min: 0, max: 100 } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if enum field has non-array options.options', () => {
    const input = JSON.stringify({
      fields: [{ name: 'status', type: 'enum', nullable: 0, options: { options: 'active' } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if enum field has non-string values in options.options', () => {
    const input = JSON.stringify({
      fields: [{ name: 'status', type: 'enum', nullable: 0, options: { options: [1, 2, 3] } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('throws if string field has non-null options', () => {
    const input = JSON.stringify({
      fields: [{ name: 'name', type: 'string', nullable: 0, options: { min: 0, max: 100 } }],
    })
    expect(() => parseSchemaResponse(input)).toThrow('invalid')
  })

  it('accepts null options for types that do not need them', () => {
    const types = ['string', 'boolean', 'email', 'phone', 'uuid'] as const
    for (const type of types) {
      const input = JSON.stringify({
        fields: [{ name: 'x', type, nullable: 0, options: null }],
      })
      expect(() => parseSchemaResponse(input)).not.toThrow()
    }
  })
})
