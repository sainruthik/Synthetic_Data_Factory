import { useState, useCallback } from 'react'
import { generateDataset, type GenerationResult } from '../engine/generateDataset'
import { exportSchema } from '../lib/exportSchema'
import type { SchemaState } from '../types/schema'

export type OutputFormat = 'jsonl' | 'csv' | 'sql'

interface GenerateState {
  result: GenerationResult | null
  isGenerating: boolean
  error: string | null
}

export function useGenerate() {
  const [state, setState] = useState<GenerateState>({ result: null, isGenerating: false, error: null })
  const [rowCount, setRowCount] = useState(100)
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999999))
  const [format, setFormat] = useState<OutputFormat>('jsonl')

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

  return { state, rowCount, setRowCount, seed, setSeed, randomizeSeed, format, setFormat, generate }
}
