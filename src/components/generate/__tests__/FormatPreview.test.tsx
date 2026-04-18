import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormatPreview } from '../FormatPreview'

const rows = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User${i}` }))

describe('FormatPreview', () => {
  it('renders nothing when rows is empty', () => {
    const { container } = render(<FormatPreview rows={[]} format="csv" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows format label in summary', () => {
    render(<FormatPreview rows={rows} format="csv" />)
    expect(screen.getByText(/CSV/)).toBeInTheDocument()
  })

  it('shows first N of M rows in summary', () => {
    render(<FormatPreview rows={rows} format="jsonl" maxPreviewRows={5} />)
    expect(screen.getByText(/first 5 of 10/)).toBeInTheDocument()
  })

  it('JSONL preview contains one JSON object per line', () => {
    render(<FormatPreview rows={rows} format="jsonl" maxPreviewRows={3} />)
    const pre = document.querySelector('pre')!
    const lines = pre.textContent!.trim().split('\n')
    expect(lines).toHaveLength(3)
    expect(() => JSON.parse(lines[0])).not.toThrow()
  })

  it('CSV preview has header row', () => {
    render(<FormatPreview rows={rows} format="csv" />)
    const pre = document.querySelector('pre')!
    expect(pre.textContent).toContain('id,name')
  })

  it('JSON preview is a valid JSON array', () => {
    render(<FormatPreview rows={rows} format="json" maxPreviewRows={3} />)
    const pre = document.querySelector('pre')!
    const parsed = JSON.parse(pre.textContent!)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(3)
  })

  it('SQL preview has INSERT statement', () => {
    render(<FormatPreview rows={rows} format="sql" />)
    const pre = document.querySelector('pre')!
    expect(pre.textContent).toContain('INSERT INTO')
  })

  it('SQL preview uses provided tableName', () => {
    render(<FormatPreview rows={rows} format="sql" opts={{ tableName: 'my_table' }} />)
    const pre = document.querySelector('pre')!
    expect(pre.textContent).toContain('"my_table"')
  })

  it('Markdown preview starts with pipe-delimited header', () => {
    render(<FormatPreview rows={rows} format="md" maxPreviewRows={2} />)
    const pre = document.querySelector('pre')!
    expect(pre.textContent).toContain('| id | name |')
  })

  it('truncates to maxPreviewRows (default 5)', () => {
    render(<FormatPreview rows={rows} format="csv" />)
    const pre = document.querySelector('pre')!
    // header + 5 data rows = 6 lines
    const lines = pre.textContent!.trim().split('\n').filter(Boolean)
    expect(lines).toHaveLength(6)
  })
})
