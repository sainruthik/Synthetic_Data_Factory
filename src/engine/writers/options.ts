export interface WriterSchemaField {
  name: string
  type: string
}

export interface WriterOptions {
  // CSV / TSV
  headers?: string[]
  crlf?: boolean
  bom?: boolean
  // SQL
  tableName?: string
  dialect?: 'postgres' | 'mysql' | 'sqlite'
  includeCreate?: boolean
  schema?: WriterSchemaField[]
  // JSON
  indent?: number
}
