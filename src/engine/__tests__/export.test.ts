import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportDataset } from '../export'

vi.mock('../download', () => ({
  downloadFile: vi.fn(),
}))

import { downloadFile } from '../download'
const mockDownload = downloadFile as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockDownload.mockReset()
})

const rows = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]

describe('exportDataset', () => {
  it('returns ok:true and a filename on success', () => {
    const result = exportDataset(rows, 'csv')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.filename).toMatch(/\.csv$/)
    }
  })

  it('calls downloadFile with correct mime for csv', () => {
    exportDataset(rows, 'csv')
    expect(mockDownload).toHaveBeenCalledOnce()
    const [, , mime] = mockDownload.mock.calls[0]
    expect(mime).toBe('text/csv')
  })

  it('calls downloadFile with correct mime for json', () => {
    exportDataset(rows, 'json')
    const [, , mime] = mockDownload.mock.calls[0]
    expect(mime).toBe('application/json')
  })

  it('calls downloadFile with correct mime for sql', () => {
    exportDataset(rows, 'sql')
    const [, , mime] = mockDownload.mock.calls[0]
    expect(mime).toBe('text/plain')
  })

  it('returns ok:false with error for empty rows', () => {
    const result = exportDataset([], 'csv')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBeTruthy()
  })

  it('returns ok:false when downloadFile throws', () => {
    mockDownload.mockImplementation(() => { throw new Error('CSP violation') })
    const result = exportDataset(rows, 'csv')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('CSP violation')
  })

  it('filename includes row count', () => {
    const result = exportDataset(rows, 'jsonl')
    if (result.ok) {
      expect(result.filename).toContain('_2rows')
    }
  })

  it('passes opts through to writer (tableName for sql)', () => {
    exportDataset(rows, 'sql', { tableName: 'my_table' })
    const [content] = mockDownload.mock.calls[0]
    expect(content).toContain('"my_table"')
  })
})
