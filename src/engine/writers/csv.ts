import type { WriterOptions } from './options'

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[,"\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function toCsv(rows: Record<string, unknown>[], opts: WriterOptions = {}): string {
  if (rows.length === 0) return ''
  const eol = opts.crlf ? '\r\n' : '\n'
  const headers = opts.headers ?? Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => csvEscape(row[h])).join(',')),
  ].join(eol)
  return opts.bom ? '\uFEFF' + lines : lines
}
