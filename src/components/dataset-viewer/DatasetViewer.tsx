import { useMemo, useState, useEffect } from 'react'
import type { PageSize, SortState, ColumnFilterMap } from '../../types/dataset'
import { computeAllColumnStats, sortRows, filterRows, paginate } from '../../lib/datasetStats'
import { ViewerToolbar } from './ViewerToolbar'
import { ViewerTable } from './ViewerTable'
import { ViewerPagination } from './ViewerPagination'

interface DatasetViewerProps {
  rows: Record<string, unknown>[]
}

export function DatasetViewer({ rows }: DatasetViewerProps) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: null })
  const [filters, setFilters] = useState<ColumnFilterMap>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<PageSize>(25)

  const columns = useMemo(
    () => (rows.length > 0 ? Object.keys(rows[0]) : []),
    [rows]
  )

  // Stats computed once over all raw rows — not affected by sort/filter/page
  const columnStats = useMemo(
    () => computeAllColumnStats(rows, columns),
    [rows, columns]
  )

  const filteredRows = useMemo(() => filterRows(rows, filters), [rows, filters])
  const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])
  const { pageRows, totalPages } = useMemo(
    () => paginate(sortedRows, page, pageSize),
    [sortedRows, page, pageSize]
  )

  useEffect(() => { setPage(0) }, [filters, sort, pageSize])

  if (rows.length === 0) return null

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }))
  }

  return (
    <div className="space-y-3">
      <ViewerToolbar
        rowCount={rows.length}
        filteredCount={filteredRows.length}
        columnCount={columns.length}
        pageSize={pageSize}
        onPageSizeChange={v => setPageSize(v as PageSize)}
      />
      <ViewerTable
        rows={pageRows}
        columns={columns}
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFilterChange={handleFilterChange}
        columnStats={columnStats}
      />
      <ViewerPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
