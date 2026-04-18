import type { WriterOptions } from './options'

function mdEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\|/g, '\\|')
}

export function toMarkdown(rows: Record<string, unknown>[], opts: WriterOptions = {}): string {
  if (rows.length === 0) return ''
  const headers = opts.headers ?? Object.keys(rows[0])
  const separator = headers.map(() => '---').join(' | ')
  return [
    '| ' + headers.join(' | ') + ' |',
    '| ' + separator + ' |',
    ...rows.map(row => '| ' + headers.map(h => mdEscape(row[h])).join(' | ') + ' |'),
  ].join('\n')
}
