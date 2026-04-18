export interface FieldIssue {
  field: string
  reason: string
  suggestedFix: string
}

export interface FlaggedRow {
  rowIndex: number
  summary: string
  fieldIssues: FieldIssue[]
}

export interface QualityJudgment {
  score: number
  overallReasoning: string
  flaggedRows: FlaggedRow[]
}

export interface RowFix {
  rowIndex: number
  patchedFields: Record<string, unknown>
}

export interface FixResponse {
  fixes: RowFix[]
}

export interface ReviewIteration {
  index: number
  score: number
  flaggedRowCount: number
  timestampMs: number
}

export type ReviewStatus = 'idle' | 'judging' | 'fixing' | 'done' | 'error'

export interface SampleResult {
  samples: Record<string, unknown>[]
  indexMap: number[]
}
