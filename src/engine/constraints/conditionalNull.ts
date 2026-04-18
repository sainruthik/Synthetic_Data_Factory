type Row = Record<string, unknown>

interface ConditionalNullRule {
  field: string
  whenField: string
  whenValue: string
}

export function applyConditionalNulls(rows: Row[], rules: ConditionalNullRule[]): Row[] {
  return rows.map(row => {
    let updated = row
    for (const rule of rules) {
      if (String(updated[rule.whenField]) === rule.whenValue) {
        updated = { ...updated, [rule.field]: null }
      }
    }
    return updated
  })
}
