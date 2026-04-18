function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') return String(value)
  return `'${String(value).replace(/'/g, "''")}'`
}

export function toSql(rows: Record<string, unknown>[], tableName = 'synthetic_data'): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const columnList = headers.join(', ')
  return rows
    .map(row => {
      const values = headers.map(h => sqlValue(row[h])).join(', ')
      return `INSERT INTO ${tableName} (${columnList}) VALUES (${values});`
    })
    .join('\n')
}
