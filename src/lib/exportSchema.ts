import type { SchemaField, SchemaState, ExportedSchema, ExportedConstraint } from '../types/schema'

export function exportSchema(state: SchemaState): ExportedSchema {
  return {
    fields: state.fields.map(({ name, type, nullable, typeOptions }: SchemaField) => ({
      name,
      type,
      nullable,
      options: typeOptions,
    })),
    constraints: state.constraints.map(c => {
      const { id: _id, ...rest } = c
      return rest as ExportedConstraint
    }),
  }
}
