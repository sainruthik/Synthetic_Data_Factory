import type { SchemaField, SchemaState, ExportedSchema } from '../types/schema'

export function exportSchema(state: SchemaState): ExportedSchema {
  return {
    fields: state.fields.map(({ name, type, nullable, typeOptions }: SchemaField) => ({
      name,
      type,
      nullable,
      options: typeOptions,
    })),
  }
}
