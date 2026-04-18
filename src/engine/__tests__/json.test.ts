import { describe, it, expect } from 'vitest'
import { toJson } from '../writers/json'

describe('toJson', () => {
  it('returns [] for empty input', () => {
    expect(toJson([])).toBe('[]')
  })

  it('round-trips rows via JSON.parse', () => {
    const rows = [{ id: 1, name: 'Alice', score: null, active: true }]
    const parsed = JSON.parse(toJson(rows))
    expect(parsed).toEqual(rows)
  })

  it('preserves null values', () => {
    const parsed = JSON.parse(toJson([{ x: null }]))
    expect(parsed[0].x).toBeNull()
  })

  it('preserves booleans', () => {
    const parsed = JSON.parse(toJson([{ a: true, b: false }]))
    expect(parsed[0].a).toBe(true)
    expect(parsed[0].b).toBe(false)
  })

  it('preserves numbers including floats', () => {
    const parsed = JSON.parse(toJson([{ n: 3.14 }]))
    expect(parsed[0].n).toBe(3.14)
  })

  it('defaults to 2-space indent', () => {
    const output = toJson([{ a: 1 }])
    expect(output).toContain('  "a"')
  })

  it('respects custom indent option', () => {
    const output = toJson([{ a: 1 }], { indent: 4 })
    expect(output).toContain('    "a"')
  })
})
