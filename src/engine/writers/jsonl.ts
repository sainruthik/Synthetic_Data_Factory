export function toJsonl(rows: Record<string, unknown>[]): string {
  return rows.map(r => JSON.stringify(r)).join('\n')
}
