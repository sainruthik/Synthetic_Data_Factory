import { toJsonl } from './jsonl'
import { toCsv } from './csv'
import { toSql } from './sql'
import { toJson } from './json'
import { toTsv } from './tsv'
import { toMarkdown } from './markdown'
import type { WriterOptions } from './options'

export type OutputFormat = 'jsonl' | 'csv' | 'sql' | 'json' | 'tsv' | 'md'
export type { WriterOptions }

interface WriterEntry {
  write: (rows: Record<string, unknown>[], opts?: WriterOptions) => string
  mime: string
  extension: string
  label: string
}

export const writers: Record<OutputFormat, WriterEntry> = {
  jsonl: {
    write: rows => toJsonl(rows),
    mime: 'application/x-ndjson',
    extension: 'jsonl',
    label: 'JSONL',
  },
  json: {
    write: (rows, opts) => toJson(rows, opts),
    mime: 'application/json',
    extension: 'json',
    label: 'JSON',
  },
  csv: {
    write: (rows, opts) => toCsv(rows, opts),
    mime: 'text/csv',
    extension: 'csv',
    label: 'CSV',
  },
  tsv: {
    write: (rows, opts) => toTsv(rows, opts),
    mime: 'text/tab-separated-values',
    extension: 'tsv',
    label: 'TSV',
  },
  sql: {
    write: (rows, opts) => toSql(rows, opts),
    mime: 'text/plain',
    extension: 'sql',
    label: 'SQL',
  },
  md: {
    write: (rows, opts) => toMarkdown(rows, opts),
    mime: 'text/markdown',
    extension: 'md',
    label: 'Markdown',
  },
}
