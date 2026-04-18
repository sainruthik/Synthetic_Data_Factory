import type { ColumnStats, ColumnFilterMap, SortState, ColumnInferredType } from '../types/dataset'

type Row = Record<string, unknown>

function inferType(samples: unknown[]): ColumnInferredType {
  if (samples.length === 0) return 'empty'
  const types = new Set(
    samples.map(v => {
      if (typeof v === 'boolean') return 'boolean'
      if (typeof v === 'number') return 'number'
      if (typeof v === 'string' && v !== '' && !isNaN(Number(v))) return 'number'
      return 'string'
    })
  )
  if (types.size === 1) return [...types][0] as ColumnInferredType
  if (types.size === 2 && types.has('boolean') && !types.has('string')) return 'boolean'
  return 'mixed'
}

export function computeColumnStats(rows: Row[], column: string): ColumnStats {
  let nullCount = 0
  const nonNullValues: unknown[] = []
  const unique = new Set<unknown>()

  for (const row of rows) {
    const val = row[column]
    if (val === null || val === undefined) {
      nullCount++
    } else {
      nonNullValues.push(val)
      unique.add(val)
    }
  }

  const inferredType = inferType(nonNullValues)

  let min: number | string | null = null
  let max: number | string | null = null

  if (nonNullValues.length > 0) {
    if (inferredType === 'number') {
      const nums = nonNullValues.map(v => Number(v))
      min = Math.min(...nums)
      max = Math.max(...nums)
    } else {
      const strs = nonNullValues.map(v => String(v))
      min = strs.reduce((a, b) => (a < b ? a : b))
      max = strs.reduce((a, b) => (a > b ? a : b))
    }
  }

  return { column, min, max, nullCount, uniqueCount: unique.size, inferredType }
}

export function computeAllColumnStats(
  rows: Row[],
  columns: string[]
): Record<string, ColumnStats> {
  const result: Record<string, ColumnStats> = {}
  for (const col of columns) {
    result[col] = computeColumnStats(rows, col)
  }
  return result
}

export function sortRows(rows: Row[], sort: SortState): Row[] {
  if (!sort.column || !sort.direction) return rows

  const col = sort.column
  const dir = sort.direction === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const av = a[col]
    const bv = b[col]

    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1

    const an = Number(av)
    const bn = Number(bv)
    if (!isNaN(an) && !isNaN(bn)) return (an - bn) * dir

    const as = String(av).toLowerCase()
    const bs = String(bv).toLowerCase()
    return as < bs ? -dir : as > bs ? dir : 0
  })
}

export function filterRows(rows: Row[], filters: ColumnFilterMap): Row[] {
  const activeFilters = Object.entries(filters).filter(([, v]) => v !== '')
  if (activeFilters.length === 0) return rows

  return rows.filter(row =>
    activeFilters.every(([col, query]) => {
      const val = row[col]
      if (val === null || val === undefined) return 'null'.includes(query.toLowerCase())
      return String(val).toLowerCase().includes(query.toLowerCase())
    })
  )
}

export function paginate(
  rows: Row[],
  page: number,
  pageSize: number
): { pageRows: Row[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * pageSize
  return { pageRows: rows.slice(start, start + pageSize), totalPages }
}
