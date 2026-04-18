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

// ─── Constraints ─────────────────────────────────────────────────────────────

export type ConstraintType = 'comparison' | 'conditional_null' | 'unique' | 'custom'

export type ComparisonOperator = '>' | '<' | '>='

export interface ComparisonConstraint {
  id: string
  type: 'comparison'
  fieldA: string
  operator: ComparisonOperator
  fieldB: string
}

export interface ConditionalNullConstraint {
  id: string
  type: 'conditional_null'
  field: string
  whenField: string
  whenValue: string
}

export interface UniqueConstraint {
  id: string
  type: 'unique'
  field: string
}

export interface CustomConstraint {
  id: string
  type: 'custom'
  description: string
}

export type Constraint =
  | ComparisonConstraint
  | ConditionalNullConstraint
  | UniqueConstraint
  | CustomConstraint

export type ExportedConstraint =
  | Omit<ComparisonConstraint, 'id'>
  | Omit<ConditionalNullConstraint, 'id'>
  | Omit<UniqueConstraint, 'id'>
  | Omit<CustomConstraint, 'id'>

// ─── State ───────────────────────────────────────────────────────────────────

export interface SchemaState {
  fields: SchemaField[]
  constraints: Constraint[]
}

export type SchemaAction =
  | { type: 'ADD_FIELD' }
  | { type: 'REMOVE_FIELD'; payload: { id: string } }
  | { type: 'UPDATE_FIELD'; payload: { id: string; updates: Partial<Omit<SchemaField, 'id'>> } }
  | { type: 'UPDATE_TYPE'; payload: { id: string; fieldType: FieldType } }
  | { type: 'SET_SCHEMA'; payload: { fields: SchemaField[]; constraints?: Constraint[] } }
  | { type: 'ADD_CONSTRAINT'; payload: { constraintType: ConstraintType } }
  | { type: 'REMOVE_CONSTRAINT'; payload: { id: string } }
  | { type: 'UPDATE_CONSTRAINT'; payload: { id: string; updates: Partial<Omit<Constraint, 'id' | 'type'>> } }

// ─── Export ───────────────────────────────────────────────────────────────────

export interface ExportedField {
  name: string
  type: FieldType
  nullable: number
  options: TypeOptions
}

export interface ExportedSchema {
  fields: ExportedField[]
  constraints: ExportedConstraint[]
}
