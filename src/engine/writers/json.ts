import type { WriterOptions } from './options'

export function toJson(rows: Record<string, unknown>[], opts: WriterOptions = {}): string {
  if (rows.length === 0) return '[]'
  return JSON.stringify(rows, null, opts.indent ?? 2)
}
