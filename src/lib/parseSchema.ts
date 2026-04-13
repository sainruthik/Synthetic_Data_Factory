import type { ExportedSchema, ExportedField } from '../types/schema'
import { FIELD_TYPES } from '../types/schema'

/**
 * Extracts JSON from a Claude/OpenAI response that may be wrapped in markdown code fences.
 * Returns the raw JSON string.
 */
function extractJson(text: string): string {
  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) return fenceMatch[1].trim()
  return text.trim()
}

/**
 * Validates that the options object matches the expected shape for the given field type.
 * Returns true if valid, false otherwise.
 */
function isValidOptions(type: ExportedField['type'], options: unknown): boolean {
  // null is always acceptable (means "no options")
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

    // These types do not support options — non-null options are invalid
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

/**
 * Parses and validates a Claude/OpenAI response string into an ExportedSchema.
 * Throws a descriptive Error if the response is not valid.
 */
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

  const invalidIndex = obj.fields.findIndex((f: unknown) => !isValidField(f))
  if (invalidIndex !== -1) {
    throw new Error(
      `Field at index ${invalidIndex} is invalid. Each field must have name (string), ` +
      `type (one of: ${FIELD_TYPES.join(', ')}), nullable (0–100), and valid options for its type.`
    )
  }

  return { fields: obj.fields as ExportedField[] }
}
