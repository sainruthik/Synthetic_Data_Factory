import { describe, it, expect } from 'vitest'
import { toJsonl } from '../writers/jsonl'
import { toCsv } from '../writers/csv'
import { toSql } from '../writers/sql'

const rows = [
  { id: 1,   name: 'Alice',     active: true,  score: null },
  { id: 2,   name: 'Bob, Jr.',  active: false, score: 9.5  },
  { id: 3,   name: `O'Brien`,   active: true,  score: 7    },
]

describe('toJsonl', () => {
  it('outputs one JSON object per line', () => {
    const lines = toJsonl(rows).split('\n')
    expect(lines).toHaveLength(3)
    expect(JSON.parse(lines[0])).toEqual(rows[0])
    expect(JSON.parse(lines[1])).toEqual(rows[1])
  })

  it('round-trips null values', () => {
    const line = toJsonl([rows[0]])
    expect(JSON.parse(line).score).toBeNull()
  })

  it('returns empty string for empty input', () => {
    expect(toJsonl([])).toBe('')
  })
})

describe('toCsv', () => {
  it('includes header row', () => {
    const lines = toCsv(rows).split('\n')
    expect(lines[0]).toBe('id,name,active,score')
  })

  it('has correct row count (header + data)', () => {
    expect(toCsv(rows).split('\n')).toHaveLength(4)
  })

  it('escapes commas in values', () => {
    expect(toCsv(rows)).toContain('"Bob, Jr."')
  })

  it('outputs null as empty string', () => {
    const lines = toCsv(rows).split('\n')
    expect(lines[1].endsWith(',')).toBe(true) // score is last, empty
  })

  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('')
  })
})

describe('toSql', () => {
  it('generates correct number of INSERT statements', () => {
    expect(toSql(rows).split('\n')).toHaveLength(3)
  })

  it('uses default table name', () => {
    expect(toSql(rows)).toContain('INSERT INTO synthetic_data')
  })

  it('accepts custom table name', () => {
    expect(toSql(rows, 'users')).toContain('INSERT INTO users')
  })

  it('quotes string values', () => {
    expect(toSql(rows)).toContain("'Alice'")
  })

  it('outputs NULL for null values', () => {
    expect(toSql(rows)).toContain('NULL')
  })

  it('uses TRUE/FALSE for booleans', () => {
    expect(toSql(rows)).toContain('TRUE')
    expect(toSql(rows)).toContain('FALSE')
  })

  it("escapes single quotes in strings", () => {
    expect(toSql(rows)).toContain("'O''Brien'")
  })

  it('outputs numbers without quotes', () => {
    const output = toSql([{ n: 42 }])
    expect(output).toContain('42')
    expect(output).not.toContain("'42'")
  })

  it('returns empty string for empty input', () => {
    expect(toSql([])).toBe('')
  })
})
