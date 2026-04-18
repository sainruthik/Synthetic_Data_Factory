import { describe, it, expect } from 'vitest'
import { toJsonl } from '../writers/jsonl'
import { toCsv } from '../writers/csv'
import { toSql } from '../writers/sql'
import { toTsv } from '../writers/tsv'
import { toMarkdown } from '../writers/markdown'

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
    expect(lines[1].endsWith(',')).toBe(true)
  })

  it('returns empty string for empty input', () => {
    expect(toCsv([])).toBe('')
  })

  it('uses explicit headers when provided', () => {
    const output = toCsv(rows, { headers: ['id', 'name'] })
    expect(output.split('\n')[0]).toBe('id,name')
    expect(output.split('\n')).toHaveLength(4)
  })

  it('uses CRLF line endings when crlf=true', () => {
    const output = toCsv(rows, { crlf: true })
    expect(output).toContain('\r\n')
    expect(output.split('\r\n')).toHaveLength(4)
  })

  it('prepends UTF-8 BOM when bom=true', () => {
    const output = toCsv(rows, { bom: true })
    expect(output.charCodeAt(0)).toBe(0xfeff)
  })

  it('does not prepend BOM by default', () => {
    expect(toCsv(rows).charCodeAt(0)).not.toBe(0xfeff)
  })
})

describe('toSql', () => {
  it('generates correct number of INSERT statements', () => {
    expect(toSql(rows).split('\n')).toHaveLength(3)
  })

  it('uses default table name with postgres quoting', () => {
    expect(toSql(rows)).toContain('INSERT INTO "synthetic_data"')
  })

  it('accepts custom table name via opts', () => {
    expect(toSql(rows, { tableName: 'users' })).toContain('INSERT INTO "users"')
  })

  it('quotes column names', () => {
    expect(toSql(rows)).toContain('"id"')
    expect(toSql(rows)).toContain('"name"')
  })

  it('quotes string values', () => {
    expect(toSql(rows)).toContain("'Alice'")
  })

  it('outputs NULL for null values', () => {
    expect(toSql(rows)).toContain('NULL')
  })

  it('uses TRUE/FALSE for booleans in postgres dialect (default)', () => {
    expect(toSql(rows)).toContain('TRUE')
    expect(toSql(rows)).toContain('FALSE')
  })

  it('uses 1/0 for booleans in sqlite dialect', () => {
    const output = toSql(rows, { dialect: 'sqlite' })
    expect(output).not.toContain('TRUE')
    expect(output).toContain(', 1,')
  })

  it('uses backtick quoting for mysql dialect', () => {
    expect(toSql(rows, { dialect: 'mysql' })).toContain('`synthetic_data`')
    expect(toSql(rows, { dialect: 'mysql' })).toContain('`id`')
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

  it('emits CREATE TABLE DDL when includeCreate=true and schema provided', () => {
    const schema = [
      { name: 'id', type: 'integer' },
      { name: 'name', type: 'string' },
    ]
    const output = toSql(rows, { includeCreate: true, schema })
    expect(output).toContain('CREATE TABLE "synthetic_data"')
    expect(output).toContain('"id" INTEGER')
    expect(output).toContain('"name" TEXT')
    expect(output).toContain('INSERT INTO')
  })

  it('does not emit DDL when includeCreate=false', () => {
    const output = toSql(rows, { includeCreate: false })
    expect(output).not.toContain('CREATE TABLE')
  })
})

describe('toTsv', () => {
  it('includes header row with tab separator', () => {
    const lines = toTsv(rows).split('\n')
    expect(lines[0]).toBe('id\tname\tactive\tscore')
  })

  it('has correct row count', () => {
    expect(toTsv(rows).split('\n')).toHaveLength(4)
  })

  it('replaces tabs in values with spaces', () => {
    const output = toTsv([{ x: 'col\tval' }])
    expect(output).not.toContain('\t\t')
    expect(output.split('\n')[1]).toBe('col val')
  })

  it('outputs null as empty string', () => {
    const lines = toTsv([{ a: null }]).split('\n')
    expect(lines[1]).toBe('')
  })

  it('returns empty string for empty input', () => {
    expect(toTsv([])).toBe('')
  })
})

describe('toMarkdown', () => {
  it('starts with a pipe-delimited header', () => {
    const lines = toMarkdown(rows).split('\n')
    expect(lines[0]).toBe('| id | name | active | score |')
  })

  it('second line is a separator row', () => {
    const lines = toMarkdown(rows).split('\n')
    expect(lines[1]).toBe('| --- | --- | --- | --- |')
  })

  it('data rows are pipe-delimited', () => {
    const lines = toMarkdown(rows).split('\n')
    expect(lines[2]).toBe('| 1 | Alice | true |  |')
  })

  it('escapes pipe characters in values', () => {
    const output = toMarkdown([{ x: 'a|b' }])
    expect(output).toContain('a\\|b')
  })

  it('returns empty string for empty input', () => {
    expect(toMarkdown([])).toBe('')
  })
})
