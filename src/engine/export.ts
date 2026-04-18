import { writers } from './writers/index'
import { buildExportFilename } from './filename'
import { downloadFile } from './download'
import type { OutputFormat, WriterOptions } from './writers/index'

export type ExportResult = { ok: true; filename: string } | { ok: false; error: string }

export function exportDataset(
  rows: Record<string, unknown>[],
  format: OutputFormat,
  opts: WriterOptions = {}
): ExportResult {
  if (rows.length === 0) return { ok: false, error: 'No rows to export.' }
  try {
    const entry = writers[format]
    const content = entry.write(rows, opts)
    const filename = buildExportFilename({ format, rowCount: rows.length })
    downloadFile(content, filename, entry.mime)
    return { ok: true, filename }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Export failed.'
    return { ok: false, error }
  }
}
