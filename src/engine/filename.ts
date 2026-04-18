export type KnownFormat = 'jsonl' | 'csv' | 'sql' | 'json' | 'tsv' | 'md'

const extMap: Record<KnownFormat, string> = {
  jsonl: 'jsonl',
  csv: 'csv',
  sql: 'sql',
  json: 'json',
  tsv: 'tsv',
  md: 'md',
}

export interface FilenameOptions {
  prefix?: string
  format: KnownFormat
  rowCount?: number
  now?: Date
}

export function buildExportFilename(opts: FilenameOptions): string {
  const d = opts.now ?? new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  const prefix = opts.prefix ?? 'synthetic_data'
  const rowPart = opts.rowCount != null ? `_${opts.rowCount}rows` : ''
  const ext = extMap[opts.format] ?? opts.format
  return `${prefix}_${ts}${rowPart}.${ext}`
}
