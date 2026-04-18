import type { WriterOptions } from './options'

function tsvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\t/g, ' ').replace(/[\n\r]/g, ' ')
}

export function toTsv(rows: Record<string, unknown>[], opts: WriterOptions = {}): string {
  if (rows.length === 0) return ''
  const headers = opts.headers ?? Object.keys(rows[0])
  return [
    headers.join('\t'),
    ...rows.map(row => headers.map(h => tsvEscape(row[h])).join('\t')),
  ].join('\n')
}
