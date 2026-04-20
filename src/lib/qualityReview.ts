import type { ExportedSchema } from '../types/schema'
import type {
  QualityJudgment,
  RowFix,
  SampleResult,
  FlaggedRow,
} from '../types/qualityReview'

const SAMPLE_SIZE = 20

export function sampleRowsForReview(
  rows: Record<string, unknown>[],
  seed = 42,
): SampleResult {
  if (rows.length <= SAMPLE_SIZE) {
    return {
      samples: rows.slice(),
      indexMap: rows.map((_, i) => i),
    }
  }

  // Deterministic Fisher-Yates partial shuffle using a seeded LCG
  const indices = Array.from({ length: rows.length }, (_, i) => i)
  let s = seed
  const lcg = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }
  for (let i = indices.length - 1; i > indices.length - SAMPLE_SIZE - 1; i--) {
    const j = Math.floor(lcg() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const selectedIndices = indices.slice(indices.length - SAMPLE_SIZE)

  return {
    samples: selectedIndices.map((i) => rows[i]),
    indexMap: selectedIndices,
  }
}

export function buildJudgeSystemPrompt(): string {
  return `You are a synthetic dataset quality judge. You evaluate whether generated data rows have semantic contradictions or violate the explicit constraints defined in the schema.

Your ONLY output must be a valid JSON object matching this exact shape — no markdown, no explanation, no code fences:
{
  "score": <integer 0-100>,
  "overallReasoning": "<one or two sentence summary>",
  "flaggedRows": [
    {
      "rowIndex": <integer, 0-based index in the provided sample>,
      "summary": "<short description of the main problem>",
      "fieldIssues": [
        {
          "field": "<field name>",
          "reason": "<why this value contradicts another field or violates a constraint>",
          "suggestedFix": "<the corrected value as a string>"
        }
      ]
    }
  ]
}

Scoring guide:
- 90-100: Nearly all rows are semantically consistent and constraint-compliant
- 70-89: Minor issues; most rows are fine
- 50-69: Noticeable semantic problems in a significant portion of rows
- 30-49: Many rows have clear contradictions
- 0-29: Pervasive contradictions; dataset would not pass any human review

STRICT RULES — read carefully before flagging anything:

The user has explicitly defined all field ranges and constraints. Values within those ranges are ALWAYS valid. Only flag rows where fields contradict each other semantically or violate the explicit constraints defined in the schema.

Do NOT flag:
- Any numeric value that falls within the user-defined min/max range — it is always valid regardless of real-world expectations
- Salary amounts that seem high or low by real-world standards — the user set the range intentionally
- Personal opinions about what seems realistic or unusual
- Values that are merely at the high or low end of a defined range

Do NOT invent thresholds, rules, or expectations not present in the schema constraints.

ONLY flag rows with genuine semantic contradictions, such as:
- A cancelled or pending order that has a delivery_date (date field set when status makes it impossible)
- A terminated employee with no termination_date when status is "terminated"
- An email address that does not match the name field (e.g., alice@example.com for someone named Bob)
- A date field that is in the wrong order relative to another date field (e.g., delivery_date before order_date)
- An enum value outside the explicitly defined options list
- A field that is null when the schema or another field's value makes null semantically impossible

When in doubt, do not flag. A dataset that follows the schema constraints is a good dataset.`
}

export function buildJudgeUserMessage(
  schema: ExportedSchema,
  samples: Record<string, unknown>[],
): string {
  return JSON.stringify({
    schema: {
      fields: schema.fields.map((f) => ({
        name: f.name,
        type: f.type,
        nullable: f.nullable,
        options: f.options,
      })),
      constraints: schema.constraints,
    },
    sampleRows: samples.map((row, i) => ({ rowIndex: i, ...row })),
  })
}

export function buildFixSystemPrompt(): string {
  return `You are a synthetic dataset repair agent. You receive a list of rows with identified problems and must return corrected versions.

Your ONLY output must be a valid JSON object matching this exact shape — no markdown, no explanation, no code fences:
{
  "fixes": [
    {
      "rowIndex": <integer, matching the rowIndex from the input>,
      "patchedFields": {
        "<field_name>": <corrected value — use the native JSON type: number, string, boolean, or null>
      }
    }
  ]
}

Rules:
- Only include fields that need to change in patchedFields
- Use the same value type as the field's schema type (number for integer/float, string for string/date/email/etc)
- Make values consistent with other fields in the same row
- Return a fix object for every flagged row in the input`
}

export function buildFixUserMessage(
  schema: ExportedSchema,
  flaggedRows: FlaggedRow[],
  samples: Record<string, unknown>[],
): string {
  return JSON.stringify({
    schemaFields: schema.fields.map((f) => ({ name: f.name, type: f.type })),
    flaggedRows: flaggedRows.map((fr) => ({
      rowIndex: fr.rowIndex,
      currentValues: samples[fr.rowIndex] ?? {},
      issues: fr.fieldIssues,
    })),
  })
}

function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function parseJudgment(raw: string): QualityJudgment {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripFences(raw))
  } catch {
    throw new Error(`Judge response is not valid JSON: ${raw.slice(0, 200)}`)
  }

  if (!isRecord(parsed)) throw new Error('Judge response must be a JSON object')

  const score = parsed.score
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error(`Invalid score: ${String(score)}`)
  }

  const overallReasoning = parsed.overallReasoning
  if (typeof overallReasoning !== 'string') {
    throw new Error('Missing overallReasoning string')
  }

  const rawFlagged = parsed.flaggedRows
  if (!Array.isArray(rawFlagged)) throw new Error('flaggedRows must be an array')

  const flaggedRows = rawFlagged.map((item: unknown, i: number): FlaggedRow => {
    if (!isRecord(item)) throw new Error(`flaggedRows[${i}] must be an object`)

    const rowIndex = item.rowIndex
    if (typeof rowIndex !== 'number') throw new Error(`flaggedRows[${i}].rowIndex must be a number`)

    const summary = typeof item.summary === 'string' ? item.summary : ''

    const rawIssues = item.fieldIssues
    if (!Array.isArray(rawIssues)) throw new Error(`flaggedRows[${i}].fieldIssues must be an array`)

    const fieldIssues = rawIssues.map((issue: unknown, j: number) => {
      if (!isRecord(issue)) throw new Error(`fieldIssues[${j}] must be an object`)
      return {
        field: typeof issue.field === 'string' ? issue.field : '',
        reason: typeof issue.reason === 'string' ? issue.reason : '',
        suggestedFix: typeof issue.suggestedFix === 'string' ? issue.suggestedFix : '',
      }
    })

    return { rowIndex, summary, fieldIssues }
  })

  return { score: Math.round(score), overallReasoning, flaggedRows }
}

export function parseFixes(raw: string): RowFix[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripFences(raw))
  } catch {
    throw new Error(`Fix response is not valid JSON: ${raw.slice(0, 200)}`)
  }

  if (!isRecord(parsed)) throw new Error('Fix response must be a JSON object')

  const rawFixes = parsed.fixes
  if (!Array.isArray(rawFixes)) throw new Error('fixes must be an array')

  return rawFixes.map((item: unknown, i: number): RowFix => {
    if (!isRecord(item)) throw new Error(`fixes[${i}] must be an object`)

    const rowIndex = item.rowIndex
    if (typeof rowIndex !== 'number') throw new Error(`fixes[${i}].rowIndex must be a number`)

    const patchedFields = item.patchedFields
    if (!isRecord(patchedFields)) throw new Error(`fixes[${i}].patchedFields must be an object`)

    return { rowIndex, patchedFields: { ...patchedFields } }
  })
}

export function applyRowFixes(
  rows: Record<string, unknown>[],
  fixes: RowFix[],
  indexMap: number[],
): Record<string, unknown>[] {
  const next = rows.map((r) => ({ ...r }))

  for (const fix of fixes) {
    const sampleIdx = fix.rowIndex
    if (sampleIdx < 0 || sampleIdx >= indexMap.length) continue

    const originalIdx = indexMap[sampleIdx]
    if (originalIdx < 0 || originalIdx >= next.length) continue

    next[originalIdx] = { ...next[originalIdx], ...fix.patchedFields }
  }

  return next
}

export function toFriendlyReviewError(err: unknown): string {
  const raw = err instanceof Error ? err.message : ''
  if (/40[13]/.test(raw)) return 'Authentication failed. Check VITE_OPENAI_API_KEY in .env.local.'
  if (/429/.test(raw)) return 'Rate limit reached. Please wait a moment and try again.'
  if (/5\d\d/.test(raw)) return 'The AI service is temporarily unavailable. Try again shortly.'
  if (/not valid JSON|must be a JSON/.test(raw)) return `Claude returned an unexpected format: ${raw}`
  if (raw) return raw
  return 'Unexpected error during quality review.'
}
