import type { ExportedConstraint } from '../../types/schema'

type Row = Record<string, unknown>
type ComparisonConstraint = Extract<ExportedConstraint, { type: 'comparison' }>

function compare(a: unknown, op: string, b: unknown): boolean {
  if (a === null || b === null) return true
  const na = Number(a), nb = Number(b)
  if (!isNaN(na) && !isNaN(nb)) {
    if (op === '>') return na > nb
    if (op === '<') return na < nb
    if (op === '>=') return na >= nb
  }
  const sa = String(a), sb = String(b)
  if (op === '>') return sa > sb
  if (op === '<') return sa < sb
  if (op === '>=') return sa >= sb
  return true
}

export interface ComparisonViolation {
  constraint: ExportedConstraint
  violatingRowCount: number
}

export function validateComparisons(
  rows: Row[],
  constraints: ComparisonConstraint[],
): ComparisonViolation[] {
  return constraints
    .map(c => {
      const violatingRowCount = rows.filter(
        row => !compare(row[c.fieldA], c.operator, row[c.fieldB]),
      ).length
      return { constraint: c as ExportedConstraint, violatingRowCount }
    })
    .filter(v => v.violatingRowCount > 0)
}
