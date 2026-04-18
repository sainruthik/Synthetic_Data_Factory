import { useState, useCallback } from 'react'
import { generateDataset, type GenerationResult } from '../engine/generateDataset'
import { exportDataset } from '../engine/export'
import { exportSchema } from '../lib/exportSchema'
import type { SchemaState, SchemaField, ExportedSchema } from '../types/schema'

export type { OutputFormat } from '../engine/writers'

interface GenerateState {
  result: GenerationResult | null
  isGenerating: boolean
  error: string | null
}

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({ result: null, isGenerating: false, error: null })
  const [rowCount, setRowCount] = useState(100)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999999))

  // Format & export options
  const [format, setFormat] = useState<import('../engine/writers').OutputFormat>('jsonl')
  const [tableName, setTableName] = useState('synthetic_data')
  const [includeCreate, setIncludeCreate] = useState(false)
  const [csvBom, setCsvBom] = useState(false)

  // Export feedback
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle')
  const [exportFilename, setExportFilename] = useState<string | null>(null)

  // Last schema used for generation — needed for SQL DDL and quality review
  const [lastSchema, setLastSchema] = useState<SchemaField[] | null>(null)
  const [lastExportedSchema, setLastExportedSchema] = useState<ExportedSchema | null>(null)

  const generate = useCallback((schemaState: SchemaState) => {
    if (schemaState.fields.length === 0) {
      setState({ result: null, isGenerating: false, error: 'Add at least one field before generating.' })
      return
    }
    setState({ result: null, isGenerating: true, error: null })
    try {
      const schema = exportSchema(schemaState)
      const result = generateDataset(schema, rowCount, seed)
      setState({ result, isGenerating: false, error: null })
      setLastSchema(schemaState.fields)
      setLastExportedSchema(schema)
    } catch (err) {
      setState({
        result: null,
        isGenerating: false,
        error: err instanceof Error ? err.message : 'Generation failed',
      })
    }
  }, [rowCount, seed])

  const randomizeSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 999999))
  }, [])

  const patchRows = useCallback((newRows: Record<string, unknown>[]) => {
    setState((prev) =>
      prev.result
        ? { ...prev, result: { ...prev.result, rows: newRows } }
        : prev
    )
  }, [])

  const exportData = useCallback(() => {
    if (!state.result) return
    setExportError(null)
    const result = exportDataset(state.result.rows, format, {
      tableName,
      includeCreate,
      bom: csvBom,
      schema: lastSchema ?? undefined,
    })
    if (result.ok) {
      setExportFilename(result.filename)
      setExportStatus('success')
      setTimeout(() => {
        setExportStatus('idle')
        setExportFilename(null)
      }, 2500)
    } else {
      setExportError(result.error)
    }
  }, [state.result, format, tableName, includeCreate, csvBom, lastSchema])

  return {
    state, rowCount, setRowCount, seed, setSeed, randomizeSeed,
    format, setFormat,
    tableName, setTableName,
    includeCreate, setIncludeCreate,
    csvBom, setCsvBom,
    exportError, exportStatus, exportFilename, exportData,
    generate, patchRows,
    lastExportedSchema,
  }
}
