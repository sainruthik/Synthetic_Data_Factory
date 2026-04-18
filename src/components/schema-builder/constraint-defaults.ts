import type { ConstraintType, Constraint, SchemaField } from '../../types/schema'

export const COMPARISON_ELIGIBLE_TYPES: SchemaField['type'][] = ['integer', 'float', 'date']

export function getEligibleFields(fields: SchemaField[], forComparison: boolean): SchemaField[] {
  if (!forComparison) return fields
  return fields.filter(f => COMPARISON_ELIGIBLE_TYPES.includes(f.type))
}

export function createDefaultConstraint(type: ConstraintType, fields: SchemaField[]): Constraint {
  const id = crypto.randomUUID()
  const eligible = getEligibleFields(fields, type === 'comparison')
  const first = eligible[0]?.name ?? ''
  const second = eligible[1]?.name ?? ''

  switch (type) {
    case 'comparison':
      return { id, type: 'comparison', fieldA: first, operator: '>', fieldB: second }
    case 'conditional_null':
      return { id, type: 'conditional_null', field: first, whenField: second, whenValue: '' }
    case 'unique':
      return { id, type: 'unique', field: first }
    case 'custom':
      return { id, type: 'custom', description: '' }
  }
}
