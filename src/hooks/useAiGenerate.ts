import { useState, useCallback, useRef } from 'react'
import type { ExportedSchema } from '../types/schema'
import { callClaude } from '../lib/api'
import {
  buildAiGenerateSystemPrompt,
  buildAiGenerateUserMessage,
  parseAiGenerateResponse,
  toFriendlyAiGenerateError,
} from '../lib/aiGenerate'

const BATCH_SIZE = 25
export const MAX_AI_ROWS = 100

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!key) throw new Error('VITE_OPENAI_API_KEY is not set. Add it to your .env.local file.')
  return key
}

export interface UseAiGenerateReturn {
  generateRows: (schema: ExportedSchema, rowCount: number) => Promise<Record<string, unknown>[]>
  progress: string | null
  isGenerating: boolean
  abort: () => void
}

export function useAiGenerate(): UseAiGenerateReturn {
  const [progress, setProgress] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const generateRows = useCallback(async (
    schema: ExportedSchema,
    rowCount: number,
  ): Promise<Record<string, unknown>[]> => {
    const apiKey = getApiKey()
    const clamped = Math.min(rowCount, MAX_AI_ROWS)
    const batches = Math.ceil(clamped / BATCH_SIZE)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setIsGenerating(true)
    setProgress(`Generating batch 1/${batches}…`)

    const allRows: Record<string, unknown>[] = []

    try {
      for (let i = 0; i < batches; i++) {
        if (ctrl.signal.aborted) break

        const remaining = clamped - allRows.length
        const batchSize = Math.min(BATCH_SIZE, remaining)

        setProgress(`Generating batch ${i + 1}/${batches}…`)

        const raw = await callClaude(
          apiKey,
          [{ role: 'user', content: buildAiGenerateUserMessage(schema, batchSize) }],
          buildAiGenerateSystemPrompt(),
        )

        const rows = parseAiGenerateResponse(raw)
        allRows.push(...rows)
      }
    } catch (err) {
      throw new Error(toFriendlyAiGenerateError(err))
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }

    return allRows
  }, [])

  return { generateRows, progress, isGenerating, abort }
}
