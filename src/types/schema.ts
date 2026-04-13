export type FieldType =
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'uuid'
  | 'enum'

export const FIELD_TYPES: FieldType[] = [
  'string', 'integer', 'float', 'boolean', 'date', 'email', 'phone', 'uuid', 'enum',
]

export interface IntegerOptions { min: number; max: number }
export interface FloatOptions { min: number; max: number }
export interface DateOptions { format: string }
export interface EnumOptions { options: string[] }

export type TypeOptions = IntegerOptions | FloatOptions | DateOptions | EnumOptions | null

export interface SchemaField {
  id: string
  name: string
  type: FieldType
  nullable: number   // 0–100
  typeOptions: TypeOptions
}

export interface SchemaState {
  fields: SchemaField[]
}

export type SchemaAction =
  | { type: 'ADD_FIELD' }
  | { type: 'REMOVE_FIELD'; payload: { id: string } }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<Omit<SchemaField, 'id'>> } }
  | { type: 'UPDATE_TYPE'; payload: { id: string; fieldType: FieldType } }
  | { type: 'SET_SCHEMA'; payload: { fields: SchemaField[] } }

export interface ExportedField {
  name: string
  type: FieldType
  nullable: number
  options: TypeOptions
}

export interface ExportedSchema {
  fields: ExportedField[]
}
