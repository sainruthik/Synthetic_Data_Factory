import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QualityReviewPanel } from '../QualityReviewPanel'
import type { ExportedSchema } from '../../../types/schema'

// Mock callClaude so tests don't hit the network
vi.mock('../../../lib/api', () => ({
  callClaude: vi.fn(),
}))

// Mock import.meta.env
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-key')

import { callClaude } from '../../../lib/api'

const SCHEMA: ExportedSchema = {
  fields: [{ name: 'name', type: 'string', nullable: 0, options: null }],
  constraints: [],
}

const ROWS = [{ name: 'Alice' }, { name: 'Bob' }]

const GOOD_JUDGMENT = JSON.stringify({
  score: 90,
  overallReasoning: 'Dataset looks great.',
  flaggedRows: [],
})

const BAD_JUDGMENT = JSON.stringify({
  score: 40,
  overallReasoning: 'Many issues.',
  flaggedRows: [
    {
      rowIndex: 0,
      summary: 'Name issue',
      fieldIssues: [{ field: 'name', reason: 'Too short', suggestedFix: 'Alice Smith' }],
    },
  ],
})

const FIX_RESPONSE = JSON.stringify({
  fixes: [{ rowIndex: 0, patchedFields: { name: 'Alice Smith' } }],
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('QualityReviewPanel', () => {
  it('renders empty state with Run button', () => {
    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Run Quality Review/i })).toBeInTheDocument()
    expect(screen.getByText(/Click "Run Quality Review"/)).toBeInTheDocument()
  })

  it('shows judging spinner when running', async () => {
    let resolve: (v: string) => void
    vi.mocked(callClaude).mockReturnValue(new Promise((r) => { resolve = r }))

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Run Quality Review/i }))

    await waitFor(() => {
      expect(screen.getByText(/Judging dataset/)).toBeInTheDocument()
    })

    resolve!(GOOD_JUDGMENT)
  })

  it('shows score and reasoning after successful judge', async () => {
    vi.mocked(callClaude).mockResolvedValue(GOOD_JUDGMENT)

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Run Quality Review/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/90\/100/).length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Dataset looks great.')).toBeInTheDocument()
    expect(screen.getByText(/Dataset passed quality review/)).toBeInTheDocument()
  })

  it('shows Apply Fixes button when score < 80 and rows flagged', async () => {
    vi.mocked(callClaude).mockResolvedValue(BAD_JUDGMENT)

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Run Quality Review/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Apply Fixes/i })).toBeInTheDocument()
    })
  })

  it('calls onPatchRows and re-judges when Apply Fixes clicked', async () => {
    const onPatchRows = vi.fn()
    vi.mocked(callClaude)
      .mockResolvedValueOnce(BAD_JUDGMENT)
      .mockResolvedValueOnce(FIX_RESPONSE)
      .mockResolvedValueOnce(GOOD_JUDGMENT)

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={onPatchRows} />)
    fireEvent.click(screen.getByRole('button', { name: /Run Quality Review/i }))

    await waitFor(() => screen.getByRole('button', { name: /Apply Fixes/i }))
    fireEvent.click(screen.getByRole('button', { name: /Apply Fixes/i }))

    await waitFor(() => {
      expect(onPatchRows).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getAllByText(/90\/100/).length).toBeGreaterThan(0)
    })
  })

  it('shows error when API fails', async () => {
    vi.mocked(callClaude).mockRejectedValue(new Error('API error 401'))

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Run Quality Review/i }))

    await waitFor(() => {
      expect(screen.getByText(/VITE_OPENAI_API_KEY/)).toBeInTheDocument()
    })
  })

  it('run button is disabled while judging', async () => {
    let resolve: (v: string) => void
    vi.mocked(callClaude).mockReturnValue(new Promise((r) => { resolve = r }))

    render(<QualityReviewPanel rows={ROWS} schema={SCHEMA} onPatchRows={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /Run Quality Review/i })
    fireEvent.click(btn)

    await waitFor(() => expect(btn).toBeDisabled())
    resolve!(GOOD_JUDGMENT)
  })
})
