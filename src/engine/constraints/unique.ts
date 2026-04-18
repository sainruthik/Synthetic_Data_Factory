import { generateValue } from '../generators'
import type { ExportedField } from '../../types/schema'

type Row = Record<string, unknown>

export interface UniqueViolation {
  field: string
  duplicateCount: number
}

export function enforceUnique(
  rows: Row[],
  uniqueFields: string[],
  fields: ExportedField[],
): { rows: Row[]; violations: UniqueViolation[] } {
  const violations: UniqueViolation[] = []
  const seen: Record<string, Set<string>> = {}
  for (const name of uniqueFields) seen[name] = new Set()

  const updated = rows.map(row => {
    let current = { ...row }
    for (const fieldName of uniqueFields) {
      const rawVal = current[fieldName]
      if (rawVal === null) continue // nulls are exempt from uniqueness

      let key = String(rawVal)
      if (!seen[fieldName].has(key)) {
        seen[fieldName].add(key)
        continue
      }

      const fieldDef = fields.find(f => f.name === fieldName)
      if (!fieldDef) { seen[fieldName].add(key); continue }

      let resolved = false
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = String(generateValue(fieldDef))
        if (!seen[fieldName].has(candidate)) {
          current = { ...current, [fieldName]: candidate }
          seen[fieldName].add(candidate)
          resolved = true
          break
        }
      }

      if (!resolved) {
        seen[fieldName].add(key)
        const existing = violations.find(v => v.field === fieldName)
        if (existing) existing.duplicateCount++
        else violations.push({ field: fieldName, duplicateCount: 1 })
      }
    }
    return current
  })

  return { rows: updated, violations }
}
