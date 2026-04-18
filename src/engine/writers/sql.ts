import type { WriterOptions, WriterSchemaField } from './options'

type Dialect = 'postgres' | 'mysql' | 'sqlite'

function quoteIdent(name: string, dialect: Dialect): string {
  return dialect === 'mysql' ? `\`${name}\`` : `"${name}"`
}

function sqlValue(value: unknown, dialect: Dialect): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite' || dialect === 'mysql') return value ? '1' : '0'
    return value ? 'TRUE' : 'FALSE'
  }
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

const typeMap: Record<Dialect, Record<string, string>> = {
  postgres: {
    string: 'TEXT', integer: 'INTEGER', float: 'DOUBLE PRECISION',
    boolean: 'BOOLEAN', date: 'DATE', email: 'TEXT', phone: 'TEXT',
    uuid: 'UUID', enum: 'TEXT',
  },
  mysql: {
    string: 'TEXT', integer: 'INT', float: 'DOUBLE',
    boolean: 'TINYINT(1)', date: 'DATE', email: 'VARCHAR(255)', phone: 'VARCHAR(50)',
    uuid: 'VARCHAR(36)', enum: 'TEXT',
  },
  sqlite: {
    string: 'TEXT', integer: 'INTEGER', float: 'REAL',
    boolean: 'INTEGER', date: 'TEXT', email: 'TEXT', phone: 'TEXT',
    uuid: 'TEXT', enum: 'TEXT',
  },
}

function buildDdl(
  quotedTable: string,
  headers: string[],
  schema: WriterSchemaField[],
  dialect: Dialect
): string {
  const fieldMap = new Map(schema.map(f => [f.name, f.type]))
  const cols = headers
    .map(h => {
      const sqlType = typeMap[dialect][fieldMap.get(h) ?? 'string'] ?? 'TEXT'
      return `  ${quoteIdent(h, dialect)} ${sqlType}`
    })
    .join(',\n')
  return `CREATE TABLE ${quotedTable} (\n${cols}\n);\n\n`
}

export function toSql(rows: Record<string, unknown>[], opts: WriterOptions = {}): string {
  if (rows.length === 0) return ''
  const dialect = opts.dialect ?? 'postgres'
  const tableName = opts.tableName ?? 'synthetic_data'
  const headers = Object.keys(rows[0])
  const quotedTable = quoteIdent(tableName, dialect)
  const quotedCols = headers.map(h => quoteIdent(h, dialect)).join(', ')

  const ddl =
    opts.includeCreate && opts.schema
      ? buildDdl(quotedTable, headers, opts.schema, dialect)
      : ''

  const inserts = rows
    .map(row => {
      const vals = headers.map(h => sqlValue(row[h], dialect)).join(', ')
      return `INSERT INTO ${quotedTable} (${quotedCols}) VALUES (${vals});`
    })
    .join('\n')

  return ddl + inserts
}
