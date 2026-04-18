import { describe, it, expect } from 'vitest'
import {
  sampleRowsForReview,
  parseJudgment,
  parseFixes,
  applyRowFixes,
  buildJudgeUserMessage,
  buildFixUserMessage,
  toFriendlyReviewError,
} from '../qualityReview'
import type { ExportedSchema } from '../../types/schema'
import type { FlaggedRow } from '../../types/qualityReview'

const SCHEMA: ExportedSchema = {
  fields: [
    { name: 'name', type: 'string', nullable: 0, options: null },
    { name: 'age', type: 'integer', nullable: 0, options: { min: 18, max: 65 } },
    { name: 'salary', type: 'float', nullable: 0, options: { min: 30000, max: 200000 } },
  ],
  constraints: [],
}

const makeRows = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ name: `Person ${i}`, age: 30 + i, salary: 50000 + i * 1000 }))

// ── sampleRowsForReview ───────────────────────────────────────────────────────

describe('sampleRowsForReview', () => {
  it('returns all rows when count <= 20', () => {
    const rows = makeRows(10)
    const { samples, indexMap } = sampleRowsForReview(rows)
    expect(samples).toHaveLength(10)
    expect(indexMap).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('returns 20 rows for large datasets', () => {
    const rows = makeRows(100)
    const { samples, indexMap } = sampleRowsForReview(rows)
    expect(samples).toHaveLength(20)
    expect(indexMap).toHaveLength(20)
  })

  it('indexMap values are valid original indices', () => {
    const rows = makeRows(100)
    const { indexMap } = sampleRowsForReview(rows)
    for (const idx of indexMap) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(100)
    }
  })

  it('is deterministic for the same seed', () => {
    const rows = makeRows(100)
    const a = sampleRowsForReview(rows, 99)
    const b = sampleRowsForReview(rows, 99)
    expect(a.indexMap).toEqual(b.indexMap)
  })

  it('produces different results for different seeds', () => {
    const rows = makeRows(100)
    const a = sampleRowsForReview(rows, 1)
    const b = sampleRowsForReview(rows, 2)
    expect(a.indexMap).not.toEqual(b.indexMap)
  })

  it('samples are the rows at the indexed positions', () => {
    const rows = makeRows(50)
    const { samples, indexMap } = sampleRowsForReview(rows)
    for (let i = 0; i < samples.length; i++) {
      expect(samples[i]).toEqual(rows[indexMap[i]])
    }
  })
})

// ── parseJudgment ─────────────────────────────────────────────────────────────

describe('parseJudgment', () => {
  it('parses a valid judgment', () => {
    const input = JSON.stringify({
      score: 72,
      overallReasoning: 'Some issues found.',
      flaggedRows: [
        {
          rowIndex: 0,
          summary: 'Salary too high',
          fieldIssues: [{ field: 'salary', reason: 'Too high for junior', suggestedFix: '50000' }],
        },
      ],
    })
    const result = parseJudgment(input)
    expect(result.score).toBe(72)
    expect(result.overallReasoning).toBe('Some issues found.')
    expect(result.flaggedRows).toHaveLength(1)
    expect(result.flaggedRows[0].rowIndex).toBe(0)
    expect(result.flaggedRows[0].fieldIssues[0].field).toBe('salary')
  })

  it('strips markdown code fences', () => {
    const input = '```json\n' + JSON.stringify({ score: 80, overallReasoning: 'OK', flaggedRows: [] }) + '\n```'
    const result = parseJudgment(input)
    expect(result.score).toBe(80)
  })

  it('rounds fractional scores', () => {
    const input = JSON.stringify({ score: 72.7, overallReasoning: 'ok', flaggedRows: [] })
    expect(parseJudgment(input).score).toBe(73)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseJudgment('not json')).toThrow(/not valid JSON/)
  })

  it('throws when score is missing', () => {
    const input = JSON.stringify({ overallReasoning: 'x', flaggedRows: [] })
    expect(() => parseJudgment(input)).toThrow(/Invalid score/)
  })

  it('throws when score is out of range', () => {
    const input = JSON.stringify({ score: 150, overallReasoning: 'x', flaggedRows: [] })
    expect(() => parseJudgment(input)).toThrow(/Invalid score/)
  })

  it('throws when flaggedRows is not array', () => {
    const input = JSON.stringify({ score: 50, overallReasoning: 'x', flaggedRows: 'bad' })
    expect(() => parseJudgment(input)).toThrow(/flaggedRows must be an array/)
  })

  it('uses empty string for missing summary', () => {
    const input = JSON.stringify({
      score: 50,
      overallReasoning: 'x',
      flaggedRows: [{ rowIndex: 0, fieldIssues: [] }],
    })
    const result = parseJudgment(input)
    expect(result.flaggedRows[0].summary).toBe('')
  })
})

// ── parseFixes ────────────────────────────────────────────────────────────────

describe('parseFixes', () => {
  it('parses a valid fix response', () => {
    const input = JSON.stringify({
      fixes: [{ rowIndex: 2, patchedFields: { salary: 55000 } }],
    })
    const fixes = parseFixes(input)
    expect(fixes).toHaveLength(1)
    expect(fixes[0].rowIndex).toBe(2)
    expect(fixes[0].patchedFields.salary).toBe(55000)
  })

  it('throws on invalid JSON', () => {
    expect(() => parseFixes('bad')).toThrow(/not valid JSON/)
  })

  it('throws when fixes is not array', () => {
    expect(() => parseFixes(JSON.stringify({ fixes: null }))).toThrow(/fixes must be an array/)
  })

  it('throws when rowIndex is missing', () => {
    expect(() =>
      parseFixes(JSON.stringify({ fixes: [{ patchedFields: { x: 1 } }] }))
    ).toThrow(/rowIndex must be a number/)
  })
})

// ── applyRowFixes ─────────────────────────────────────────────────────────────

describe('applyRowFixes', () => {
  it('applies fixes to the correct original rows via indexMap', () => {
    const rows = [
      { name: 'Alice', salary: 200000 },
      { name: 'Bob', salary: 100000 },
      { name: 'Carol', salary: 150000 },
    ]
    // Sample picked original indices [2, 0] → sample[0]=Carol, sample[1]=Alice
    const indexMap = [2, 0]
    const fixes = [
      { rowIndex: 0, patchedFields: { salary: 50000 } }, // fixes Carol (original[2])
      { rowIndex: 1, patchedFields: { salary: 60000 } }, // fixes Alice (original[0])
    ]
    const result = applyRowFixes(rows, fixes, indexMap)
    expect(result[0].salary).toBe(60000) // Alice fixed
    expect(result[1].salary).toBe(100000) // Bob untouched
    expect(result[2].salary).toBe(50000) // Carol fixed
  })

  it('does not mutate the original rows array', () => {
    const rows = [{ name: 'Alice', salary: 200000 }]
    const indexMap = [0]
    const fixes = [{ rowIndex: 0, patchedFields: { salary: 50000 } }]
    applyRowFixes(rows, fixes, indexMap)
    expect(rows[0].salary).toBe(200000)
  })

  it('skips fixes with out-of-range sampleIndex', () => {
    const rows = [{ name: 'Alice', salary: 200000 }]
    const indexMap = [0]
    const fixes = [{ rowIndex: 99, patchedFields: { salary: 1 } }]
    const result = applyRowFixes(rows, fixes, indexMap)
    expect(result[0].salary).toBe(200000)
  })

  it('merges patchedFields immutably', () => {
    const rows = [{ name: 'Alice', age: 25, salary: 200000 }]
    const indexMap = [0]
    const fixes = [{ rowIndex: 0, patchedFields: { salary: 50000 } }]
    const result = applyRowFixes(rows, fixes, indexMap)
    expect(result[0]).toEqual({ name: 'Alice', age: 25, salary: 50000 })
  })
})

// ── buildJudgeUserMessage ─────────────────────────────────────────────────────

describe('buildJudgeUserMessage', () => {
  it('produces parseable JSON', () => {
    const rows = makeRows(3)
    const msg = buildJudgeUserMessage(SCHEMA, rows)
    expect(() => JSON.parse(msg)).not.toThrow()
  })

  it('includes schema fields and sample rows', () => {
    const rows = makeRows(2)
    const parsed = JSON.parse(buildJudgeUserMessage(SCHEMA, rows))
    expect(parsed.schema.fields).toHaveLength(3)
    expect(parsed.sampleRows).toHaveLength(2)
  })

  it('annotates sample rows with rowIndex', () => {
    const rows = makeRows(2)
    const parsed = JSON.parse(buildJudgeUserMessage(SCHEMA, rows))
    expect(parsed.sampleRows[0].rowIndex).toBe(0)
    expect(parsed.sampleRows[1].rowIndex).toBe(1)
  })
})

// ── buildFixUserMessage ───────────────────────────────────────────────────────

describe('buildFixUserMessage', () => {
  it('produces parseable JSON', () => {
    const flaggedRows: FlaggedRow[] = [
      { rowIndex: 0, summary: 'issue', fieldIssues: [{ field: 'salary', reason: 'high', suggestedFix: '50000' }] },
    ]
    const samples = makeRows(5)
    const msg = buildFixUserMessage(SCHEMA, flaggedRows, samples)
    expect(() => JSON.parse(msg)).not.toThrow()
  })
})

// ── toFriendlyReviewError ─────────────────────────────────────────────────────

describe('toFriendlyReviewError', () => {
  it('handles 401', () => {
    expect(toFriendlyReviewError(new Error('API error 401'))).toMatch(/VITE_OPENAI_API_KEY/)
  })

  it('handles 429', () => {
    expect(toFriendlyReviewError(new Error('429 rate limit'))).toMatch(/Rate limit/)
  })

  it('handles 500', () => {
    expect(toFriendlyReviewError(new Error('500 server error'))).toMatch(/temporarily unavailable/)
  })

  it('handles unknown errors', () => {
    expect(toFriendlyReviewError(null)).toBe('Unexpected error during quality review.')
  })
})
