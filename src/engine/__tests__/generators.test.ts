import { describe, it, expect, beforeEach } from 'vitest'
import { faker } from '@faker-js/faker'
import { generateValue } from '../generators'
import type { ExportedField } from '../../types/schema'

function field(overrides: Partial<ExportedField> & Pick<ExportedField, 'type'>): ExportedField {
  return { name: 'x', nullable: 0, options: null, ...overrides }
}

describe('generators', () => {
  beforeEach(() => { faker.seed(42) })

  it('string: returns a non-empty string', () => {
    expect(typeof generateValue(field({ type: 'string' }))).toBe('string')
    expect((generateValue(field({ type: 'string' })) as string).length).toBeGreaterThan(0)
  })

  it('integer: returns number within bounds', () => {
    const f = field({ type: 'integer', options: { min: 10, max: 20 } })
    for (let i = 0; i < 30; i++) {
      const val = generateValue(f) as number
      expect(val).toBeGreaterThanOrEqual(10)
      expect(val).toBeLessThanOrEqual(20)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('float: returns number within bounds', () => {
    const f = field({ type: 'float', options: { min: 0, max: 1 } })
    for (let i = 0; i < 30; i++) {
      const val = generateValue(f) as number
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })

  it('boolean: returns boolean', () => {
    expect(typeof generateValue(field({ type: 'boolean' }))).toBe('boolean')
  })

  it('email: contains @ symbol', () => {
    expect((generateValue(field({ type: 'email' })) as string)).toMatch(/@/)
  })

  it('phone: returns non-empty string', () => {
    expect(typeof generateValue(field({ type: 'phone' }))).toBe('string')
  })

  it('uuid: matches uuid format', () => {
    const val = generateValue(field({ type: 'uuid' })) as string
    expect(val).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('date: matches YYYY-MM-DD format', () => {
    const val = generateValue(field({ type: 'date', options: { format: 'YYYY-MM-DD' } })) as string
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('date: matches MM/DD/YYYY format', () => {
    const val = generateValue(field({ type: 'date', options: { format: 'MM/DD/YYYY' } })) as string
    expect(val).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  it('enum: returns one of provided options', () => {
    const f = field({ type: 'enum', options: { options: ['a', 'b', 'c'] } })
    for (let i = 0; i < 30; i++) {
      expect(['a', 'b', 'c']).toContain(generateValue(f))
    }
  })

  it('enum: falls back to defaults when options empty', () => {
    const f = field({ type: 'enum', options: { options: [] } })
    const val = generateValue(f) as string
    expect(['value_a', 'value_b', 'value_c']).toContain(val)
  })
})
