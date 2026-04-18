import type { ExportedSchema, ExportedField, ExportedConstraint } from '../types/schema'
import { FIELD_TYPES } from '../types/schema'

const VALID_OPERATORS = ['>', '<', '>='] as const

function extractJson(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  return text.trim()
}

function isValidOptions(type: ExportedField['type'], options: unknown): boolean {
  if (options === null || options === undefined) return true
  if (typeof options !== 'object' || Array.isArray(options)) return false

  const o = options as Record<string, unknown>

  switch (type) {
    case 'integer':
    case 'float':
      return typeof o.min === 'number' && typeof o.max === 'number'

    case 'date':
      return typeof o.format === 'string'

    case 'enum':
      return (
        Array.isArray(o.options) &&
        (o.options as unknown[]).every((v) => typeof v === 'string')
      )

    default:
      return false
  }
}

function isValidField(field: unknown): field is ExportedField {
  if (typeof field !== 'object' || field === null) return false
  const f = field as Record<string, unknown>
  if (typeof f.name !== 'string' || f.name.trim() === '') return false
  if (!FIELD_TYPES.includes(f.type as ExportedField['type'])) return false
  if (typeof f.nullable !== 'number' || f.nullable < 0 || f.nullable > 100) return false
  if (!isValidOptions(f.type as ExportedField['type'], f.options)) return false
  return true
}

function isValidConstraint(c: unknown): c is ExportedConstraint {
  if (typeof c !== 'object' || c === null) return false
  const obj = c as Record<string, unknown>
  if (typeof obj.type !== 'string') return false

  switch (obj.type) {
    case 'comparison':
      return (
        typeof obj.fieldA === 'string' && obj.fieldA.trim() !== '' &&
        typeof obj.fieldB === 'string' && obj.fieldB.trim() !== '' &&
        (VALID_OPERATORS as readonly string[]).includes(obj.operator as string)
      )
    case 'conditional_null':
      return (
        typeof obj.field === 'string' && obj.field.trim() !== '' &&
        typeof obj.whenField === 'string' && obj.whenField.trim() !== '' &&
        typeof obj.whenValue === 'string'
      )
    case 'unique':
      return typeof obj.field === 'string' && obj.field.trim() !== ''
    case 'custom':
      return typeof obj.description === 'string' && obj.description.trim() !== ''
    default:
      return false
  }
}

export function parseSchemaResponse(text: string): ExportedSchema {
  const jsonText = extractJson(text)

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    throw new Error(`Claude returned invalid JSON. Raw response:\n${text}`)
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Claude response is not a JSON object.')
  }

  const obj = parsed as Record<string, unknown>

  if (!Array.isArray(obj.fields)) {
    throw new Error('Claude response is missing a "fields" array.')
  }

  const invalidFieldIndex = obj.fields.findIndex((f: unknown) => !isValidField(f))
  if (invalidFieldIndex !== -1) {
    throw new Error(
      `Field at index ${invalidFieldIndex} is invalid. Each field must have name (string), ` +
      `type (one of: ${FIELD_TYPES.join(', ')}), nullable (0–100), and valid options for its type.`
    )
  }

  const rawConstraints = Array.isArray(obj.constraints) ? obj.constraints : []
  const invalidConstraintIndex = rawConstraints.findIndex((c: unknown) => !isValidConstraint(c))
  if (invalidConstraintIndex !== -1) {
    throw new Error(
      `Constraint at index ${invalidConstraintIndex} is invalid. ` +
      `Each constraint must have a valid type (comparison, conditional_null, unique, custom) ` +
      `with required fields for that type.`
    )
  }

  return {
    fields: obj.fields as ExportedField[],
    constraints: rawConstraints as ExportedConstraint[],
  }
}
