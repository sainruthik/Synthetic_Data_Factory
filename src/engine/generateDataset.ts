import { faker } from '@faker-js/faker'
import type { ExportedSchema, ExportedConstraint } from '../types/schema'
import { generateValue } from './generators'
import { applyNullable } from './nullable'
import { applyConditionalNulls } from './constraints/conditionalNull'
import { enforceUnique } from './constraints/unique'
import { validateComparisons } from './constraints/comparison'

export interface ConstraintViolation {
  type: 'unique' | 'comparison' | 'custom'
  message: string
}

export interface GenerationResult {
  rows: Record<string, unknown>[]
  violations: ConstraintViolation[]
}

export function generateDataset(
  schema: ExportedSchema,
  rowCount: number,
  seed: number,
): GenerationResult {
  faker.seed(seed)
  const violations: ConstraintViolation[] = []

  let rows: Record<string, unknown>[] = Array.from({ length: rowCount }, () => {
    const row: Record<string, unknown> = {}
    for (const field of schema.fields) {
      row[field.name] = applyNullable(generateValue(field, row), field.nullable)
    }
    return row
  })

  const conditionalNullRules = schema.constraints
    .filter((c): c is Extract<ExportedConstraint, { type: 'conditional_null' }> => c.type === 'conditional_null')
  if (conditionalNullRules.length > 0) {
    rows = applyConditionalNulls(rows, conditionalNullRules)
  }

  const uniqueFields = schema.constraints
    .filter((c): c is Extract<ExportedConstraint, { type: 'unique' }> => c.type === 'unique')
    .map(c => c.field)
  if (uniqueFields.length > 0) {
    const { rows: uniqueRows, violations: uniqueViolations } = enforceUnique(rows, uniqueFields, schema.fields)
    rows = uniqueRows
    for (const v of uniqueViolations) {
      violations.push({
        type: 'unique',
        message: `Field "${v.field}" has ${v.duplicateCount} duplicate value(s) that could not be resolved after 10 retries.`,
      })
    }
  }

  const comparisonConstraints = schema.constraints
    .filter((c): c is Extract<ExportedConstraint, { type: 'comparison' }> => c.type === 'comparison')
  if (comparisonConstraints.length > 0) {
    for (const v of validateComparisons(rows, comparisonConstraints)) {
      const c = v.constraint as Extract<ExportedConstraint, { type: 'comparison' }>
      violations.push({
        type: 'comparison',
        message: `Constraint "${c.fieldA} ${c.operator} ${c.fieldB}" violated in ${v.violatingRowCount} row(s).`,
      })
    }
  }

  for (const c of schema.constraints.filter((c): c is Extract<ExportedConstraint, { type: 'custom' }> => c.type === 'custom')) {
    violations.push({
      type: 'custom',
      message: `Custom constraint "${c.description}" cannot be enforced automatically — review generated data manually.`,
    })
  }

  return { rows, violations }
}
