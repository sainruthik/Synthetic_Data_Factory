import { describe, it, expect } from 'vitest'
import { buildExportFilename } from '../filename'

const fixedDate = new Date('2025-08-01T14:05:09')

describe('buildExportFilename', () => {
  it('includes date with zero-padding', () => {
    const name = buildExportFilename({ format: 'csv', now: fixedDate })
    expect(name).toContain('20250801_140509')
  })

  it('uses synthetic_data prefix by default', () => {
    const name = buildExportFilename({ format: 'csv', now: fixedDate })
    expect(name).toMatch(/^synthetic_data_/)
  })

  it('respects custom prefix', () => {
    const name = buildExportFilename({ prefix: 'my_export', format: 'jsonl', now: fixedDate })
    expect(name).toMatch(/^my_export_/)
  })

  it('appends rowCount when provided', () => {
    const name = buildExportFilename({ format: 'json', rowCount: 250, now: fixedDate })
    expect(name).toContain('_250rows')
  })

  it('omits rowCount when not provided', () => {
    const name = buildExportFilename({ format: 'json', now: fixedDate })
    expect(name).not.toContain('rows')
  })

  it('maps format to correct extension', () => {
    const cases: Array<[import('../filename').KnownFormat, string]> = [
      ['jsonl', '.jsonl'],
      ['json', '.json'],
      ['csv', '.csv'],
      ['tsv', '.tsv'],
      ['sql', '.sql'],
      ['md', '.md'],
    ]
    for (const [fmt, ext] of cases) {
      expect(buildExportFilename({ format: fmt, now: fixedDate })).toMatch(new RegExp(`\\${ext}$`))
    }
  })
})
