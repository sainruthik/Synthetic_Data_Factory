import type { FieldType, SchemaField, TypeOptions } from '../../types/schema'

export function getDefaultTypeOptions(type: FieldType): TypeOptions {
  switch (type) {
    case 'integer': return { min: 0, max: 100 }
    case 'float':   return { min: 0.0, max: 1.0 }
    case 'date':    return { format: 'YYYY-MM-DD' }
    case 'enum':    return { options: [] }
    default:        return null
  }
}

export function createDefaultField(index: number): SchemaField {
  return {
    id: crypto.randomUUID(),
    name: `field_${index}`,
    type: 'string',
    nullable: 0,
    typeOptions: null,
  }
}
