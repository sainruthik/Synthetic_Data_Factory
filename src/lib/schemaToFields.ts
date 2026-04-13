import type { ExportedSchema, SchemaField } from '../types/schema'

/**
 * Converts an ExportedSchema (API contract) into SchemaField[] (internal state),
 * generating fresh UUIDs for each field's id and mapping `options` → `typeOptions`.
 */
export function exportedSchemaToFields(schema: ExportedSchema): SchemaField[] {
  return schema.fields.map((f) => ({
    id: crypto.randomUUID(),
    name: f.name,
    type: f.type,
    nullable: f.nullable,
    typeOptions: f.options ?? null,
  }))
}
