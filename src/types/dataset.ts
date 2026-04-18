export type PageSize = 25 | 50 | 100

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

export type ColumnFilterMap = Record<string, string>

export type ColumnInferredType = 'number' | 'string' | 'boolean' | 'mixed' | 'empty'

export interface ColumnStats {
  column: string
  min: number | string | null
  max: number | string | null
  nullCount: number
  uniqueCount: number
  inferredType: ColumnInferredType
}
