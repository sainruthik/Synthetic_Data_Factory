import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatasetViewer } from '../DatasetViewer'

const makeRows = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: i % 2 === 0 ? `Alice${i}` : `Bob${i}`,
    score: i * 10,
    tag: i % 3 === 0 ? null : `tag${i}`,
  }))

describe('DatasetViewer', () => {
  it('renders nothing when rows is empty', () => {
    const { container } = render(<DatasetViewer rows={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows row count and column count badges', () => {
    render(<DatasetViewer rows={makeRows(10)} />)
    expect(screen.getByText('10 rows')).toBeInTheDocument()
    expect(screen.getByText('4 columns')).toBeInTheDocument()
  })

  it('shows all column headers', () => {
    render(<DatasetViewer rows={makeRows(5)} />)
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('score')).toBeInTheDocument()
    expect(screen.getByText('tag')).toBeInTheDocument()
  })

  it('renders null cells as italic null text', () => {
    render(<DatasetViewer rows={[{ x: null }]} />)
    const nullEl = screen.getByText('null')
    expect(nullEl.tagName).toBe('SPAN')
  })

  it('clicking a column header cycles sort: none -> asc -> desc -> none', async () => {
    render(<DatasetViewer rows={makeRows(5)} />)
    const idHeader = screen.getByRole('columnheader', { name: /^id/ })

    // initial — no indicator
    expect(idHeader.textContent).toBe('id')

    await userEvent.click(idHeader)
    expect(idHeader.textContent).toContain('↑')

    await userEvent.click(idHeader)
    expect(idHeader.textContent).toContain('↓')

    await userEvent.click(idHeader)
    expect(idHeader.textContent).toBe('id')
  })

  it('typing in a filter input narrows visible rows', async () => {
    render(<DatasetViewer rows={makeRows(10)} />)
    const filterInput = screen.getByLabelText('Filter name')
    await userEvent.type(filterInput, 'Alice')
    // Only Alice rows should be visible
    expect(screen.queryAllByText(/Bob/)).toHaveLength(0)
  })

  it('shows "X of Y rows" badge when filter is active', async () => {
    render(<DatasetViewer rows={makeRows(10)} />)
    const filterInput = screen.getByLabelText('Filter name')
    await userEvent.type(filterInput, 'Alice')
    expect(screen.getByText(/of 10 rows/)).toBeInTheDocument()
  })

  it('shows empty state message when no rows match filters', async () => {
    render(<DatasetViewer rows={makeRows(5)} />)
    const filterInput = screen.getByLabelText('Filter name')
    await userEvent.type(filterInput, 'zzznomatch')
    expect(screen.getByText('No rows match current filters')).toBeInTheDocument()
  })

  it('page size select changes how many rows are shown', async () => {
    // 60 rows, default page 25 — change to 50 should show 50
    const rows = makeRows(60)
    render(<DatasetViewer rows={rows} />)

    const select = screen.getByRole('combobox')
    // default 25: first page shows ids 1-25
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.queryByText('26')).not.toBeInTheDocument()

    await userEvent.selectOptions(select, '50')
    // now page 1 of 50: should show id 26
    expect(screen.getByText('26')).toBeInTheDocument()
  })

  it('pagination prev/next navigate pages', async () => {
    render(<DatasetViewer rows={makeRows(60)} />)

    // id=1 visible on page 1
    expect(screen.getByText('1')).toBeInTheDocument()

    const nextBtn = screen.getByRole('button', { name: 'Next page' })
    await userEvent.click(nextBtn)

    // id=1 gone, id=26 visible
    expect(screen.queryByText('1')).not.toBeInTheDocument()
    expect(screen.getByText('26')).toBeInTheDocument()

    const prevBtn = screen.getByRole('button', { name: 'Previous page' })
    await userEvent.click(prevBtn)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('pagination hidden when all rows fit on one page', () => {
    render(<DatasetViewer rows={makeRows(10)} />)
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument()
  })

  it('first/last page buttons work', async () => {
    render(<DatasetViewer rows={makeRows(60)} />)

    const lastBtn = screen.getByRole('button', { name: 'Last page' })
    await userEvent.click(lastBtn)
    expect(screen.getByText(/Page .* of/)).toHaveTextContent('Page 3 of 3')

    const firstBtn = screen.getByRole('button', { name: 'First page' })
    await userEvent.click(firstBtn)
    expect(screen.getByText(/Page .* of/)).toHaveTextContent('Page 1 of 3')
  })

  it('filter change resets page to 1', async () => {
    render(<DatasetViewer rows={makeRows(60)} />)

    // go to page 2
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText(/Page .* of/)).toHaveTextContent('Page 2')

    // apply filter — should reset
    await userEvent.type(screen.getByLabelText('Filter name'), 'Alice')
    expect(screen.getByText(/Page .* of/)).toHaveTextContent('Page 1')
  })

  it('column header title contains stats string', () => {
    render(<DatasetViewer rows={[{ score: 10 }, { score: 20 }]} />)
    const scoreHeader = screen.getByRole('columnheader', { name: /score/ })
    expect(scoreHeader.getAttribute('title')).toContain('min: 10')
    expect(scoreHeader.getAttribute('title')).toContain('max: 20')
    expect(scoreHeader.getAttribute('title')).toContain('nulls: 0')
    expect(scoreHeader.getAttribute('title')).toContain('unique: 2')
  })

  it('filter input click does not toggle sort', async () => {
    render(<DatasetViewer rows={makeRows(5)} />)
    const idHeader = screen.getByRole('columnheader', { name: /^id/ })
    const filterInput = screen.getByLabelText('Filter id')

    await userEvent.click(filterInput)
    // sort indicator should NOT appear
    expect(idHeader.textContent).toBe('id')
  })
})
