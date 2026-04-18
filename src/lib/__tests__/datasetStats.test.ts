import { describe, it, expect } from 'vitest'
import {
  computeColumnStats,
  computeAllColumnStats,
  sortRows,
  filterRows,
  paginate,
} from '../datasetStats'

describe('computeColumnStats', () => {
  const rows = [
    { age: 30, name: 'Alice' },
    { age: 25, name: 'Bob' },
    { age: null, name: 'Charlie' },
    { age: 40, name: 'Dave' },
  ]

  it('numeric column — min/max/nullCount/uniqueCount/inferredType', () => {
    const stats = computeColumnStats(rows, 'age')
    expect(stats.min).toBe(25)
    expect(stats.max).toBe(40)
    expect(stats.nullCount).toBe(1)
    expect(stats.uniqueCount).toBe(3)
    expect(stats.inferredType).toBe('number')
  })

  it('string column', () => {
    const stats = computeColumnStats(rows, 'name')
    expect(stats.min).toBe('Alice')
    expect(stats.max).toBe('Dave')
    expect(stats.nullCount).toBe(0)
    expect(stats.uniqueCount).toBe(4)
    expect(stats.inferredType).toBe('string')
  })

  it('all-null column returns empty inferredType and null min/max', () => {
    const nullRows = [{ x: null }, { x: null }]
    const stats = computeColumnStats(nullRows, 'x')
    expect(stats.min).toBeNull()
    expect(stats.max).toBeNull()
    expect(stats.nullCount).toBe(2)
    expect(stats.uniqueCount).toBe(0)
    expect(stats.inferredType).toBe('empty')
  })

  it('boolean column', () => {
    const boolRows = [{ active: true }, { active: false }, { active: true }]
    const stats = computeColumnStats(boolRows, 'active')
    expect(stats.nullCount).toBe(0)
    expect(stats.uniqueCount).toBe(2)
    expect(stats.inferredType).toBe('boolean')
  })

  it('excludes nulls from unique count', () => {
    const mixed = [{ x: 'a' }, { x: null }, { x: 'a' }, { x: null }]
    const stats = computeColumnStats(mixed, 'x')
    expect(stats.uniqueCount).toBe(1)
    expect(stats.nullCount).toBe(2)
  })
})

describe('computeAllColumnStats', () => {
  it('returns stats keyed by column name', () => {
    const rows = [{ a: 1, b: 'x' }]
    const result = computeAllColumnStats(rows, ['a', 'b'])
    expect(result).toHaveProperty('a')
    expect(result).toHaveProperty('b')
    expect(result.a.inferredType).toBe('number')
    expect(result.b.inferredType).toBe('string')
  })
})

describe('sortRows', () => {
  const rows = [
    { n: 3, s: 'banana' },
    { n: 1, s: 'apple' },
    { n: null, s: 'cherry' },
    { n: 2, s: 'avocado' },
  ]

  it('sorts numeric column ascending, nulls last', () => {
    const sorted = sortRows(rows, { column: 'n', direction: 'asc' })
    expect(sorted.map(r => r.n)).toEqual([1, 2, 3, null])
  })

  it('sorts numeric column descending, nulls last', () => {
    const sorted = sortRows(rows, { column: 'n', direction: 'desc' })
    expect(sorted.map(r => r.n)).toEqual([3, 2, 1, null])
  })

  it('sorts string column ascending', () => {
    const sorted = sortRows(rows, { column: 's', direction: 'asc' })
    expect(sorted.map(r => r.s)).toEqual(['apple', 'avocado', 'banana', 'cherry'])
  })

  it('sorts string column descending', () => {
    const sorted = sortRows(rows, { column: 's', direction: 'desc' })
    expect(sorted.map(r => r.s)).toEqual(['cherry', 'banana', 'avocado', 'apple'])
  })

  it('is a no-op when direction is null', () => {
    const sorted = sortRows(rows, { column: null, direction: null })
    expect(sorted).toBe(rows)
  })

  it('does not mutate the original array', () => {
    const copy = [...rows]
    sortRows(rows, { column: 'n', direction: 'asc' })
    expect(rows).toEqual(copy)
  })
})

describe('filterRows', () => {
  const rows = [
    { name: 'Alice', city: 'New York' },
    { name: 'Bob', city: 'Boston' },
    { name: 'Charlie', city: 'Chicago' },
    { name: 'alice', city: null },
  ]

  it('filters case-insensitively', () => {
    const result = filterRows(rows, { name: 'alice' })
    expect(result).toHaveLength(2)
  })

  it('ANDs multiple column filters', () => {
    const result = filterRows(rows, { name: 'a', city: 'New' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })

  it('empty filters object is a no-op', () => {
    expect(filterRows(rows, {})).toBe(rows)
  })

  it('empty string for a column is a no-op for that column', () => {
    const result = filterRows(rows, { name: '', city: 'Boston' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Bob')
  })

  it('matches null cells when query is "null"', () => {
    const result = filterRows(rows, { city: 'null' })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('alice')
  })
})

describe('paginate', () => {
  const rows = Array.from({ length: 10 }, (_, i) => ({ id: i }))

  it('returns first page', () => {
    const { pageRows, totalPages } = paginate(rows, 0, 3)
    expect(pageRows.map(r => r.id)).toEqual([0, 1, 2])
    expect(totalPages).toBe(4)
  })

  it('returns last partial page', () => {
    const { pageRows } = paginate(rows, 3, 3)
    expect(pageRows.map(r => r.id)).toEqual([9])
  })

  it('clamps page index beyond totalPages to last page', () => {
    const { pageRows } = paginate(rows, 100, 3)
    expect(pageRows.map(r => r.id)).toEqual([9])
  })

  it('empty rows returns totalPages=1 and empty pageRows', () => {
    const { pageRows, totalPages } = paginate([], 0, 25)
    expect(pageRows).toHaveLength(0)
    expect(totalPages).toBe(1)
  })

  it('pageSize larger than total rows returns all rows on page 0', () => {
    const { pageRows, totalPages } = paginate(rows, 0, 100)
    expect(pageRows).toHaveLength(10)
    expect(totalPages).toBe(1)
  })
})
