import { Button } from '../ui/Button'

interface ViewerPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ViewerPagination({ page, totalPages, onPageChange }: ViewerPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center gap-2 justify-end">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(0)}
        disabled={page === 0}
        aria-label="First page"
      >
        «
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        ‹
      </Button>
      <span className="font-mono text-xs text-[var(--color-text-muted)] px-2">
        Page {page + 1} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
      >
        ›
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page >= totalPages - 1}
        aria-label="Last page"
      >
        »
      </Button>
    </div>
  )
}
