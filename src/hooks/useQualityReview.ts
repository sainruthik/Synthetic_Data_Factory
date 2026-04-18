import { useState, useCallback, useRef, useEffect } from 'react'
import type { ExportedSchema } from '../types/schema'
import type {
  ReviewStatus,
  ReviewIteration,
  QualityJudgment,
  SampleResult,
} from '../types/qualityReview'
import { callClaude } from '../lib/api'
import {
  sampleRowsForReview,
  buildJudgeSystemPrompt,
  buildJudgeUserMessage,
  buildFixSystemPrompt,
  buildFixUserMessage,
  parseJudgment,
  parseFixes,
  applyRowFixes,
  toFriendlyReviewError,
} from '../lib/qualityReview'

const MAX_ITERATIONS = 3
const PASSING_SCORE = 80

interface QualityReviewState {
  status: ReviewStatus
  iteration: number
  history: ReviewIteration[]
  currentJudgment: QualityJudgment | null
  error: string | null
}

const INITIAL_STATE: QualityReviewState = {
  status: 'idle',
  iteration: 0,
  history: [],
  currentJudgment: null,
  error: null,
}

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!key) throw new Error('VITE_OPENAI_API_KEY is not set. Add it to your .env.local file.')
  return key
}

async function judgeDataset(schema: ExportedSchema, sample: SampleResult): Promise<QualityJudgment> {
  const raw = await callClaude(
    getApiKey(),
    [{ role: 'user', content: buildJudgeUserMessage(schema, sample.samples) }],
    buildJudgeSystemPrompt(),
  )
  return parseJudgment(raw)
}

async function fixDataset(
  schema: ExportedSchema,
  judgment: QualityJudgment,
  sample: SampleResult,
): Promise<ReturnType<typeof parseFixes>> {
  const raw = await callClaude(
    getApiKey(),
    [{ role: 'user', content: buildFixUserMessage(schema, judgment.flaggedRows, sample.samples) }],
    buildFixSystemPrompt(),
  )
  return parseFixes(raw)
}

export interface UseQualityReviewReturn {
  status: ReviewStatus
  iteration: number
  history: ReviewIteration[]
  currentJudgment: QualityJudgment | null
  error: string | null
  canApplyFixes: boolean
  startReview: (rows: Record<string, unknown>[], schema: ExportedSchema) => void
  applyFixes: () => void
  reset: () => void
}

export function useQualityReview(
  onPatchRows: (rows: Record<string, unknown>[]) => void,
): UseQualityReviewReturn {
  const [reviewState, setReviewState] = useState<QualityReviewState>(INITIAL_STATE)

  // Refs for async callbacks — reading these is always current
  const rowsRef = useRef<Record<string, unknown>[]>([])
  const schemaRef = useRef<ExportedSchema | null>(null)
  const sampleRef = useRef<SampleResult | null>(null)
  const stateRef = useRef<QualityReviewState>(INITIAL_STATE)
  const mountedRef = useRef(true)

  useEffect(() => { stateRef.current = reviewState }, [reviewState])
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const startReview = useCallback(
    (rows: Record<string, unknown>[], schema: ExportedSchema) => {
      rowsRef.current = rows
      schemaRef.current = schema
      const sample = sampleRowsForReview(rows)
      sampleRef.current = sample

      setReviewState({
        status: 'judging',
        iteration: 1,
        history: [],
        currentJudgment: null,
        error: null,
      })

      void (async () => {
        try {
          const judgment = await judgeDataset(schema, sample)
          if (!mountedRef.current) return

          const iter: ReviewIteration = {
            index: 1,
            score: judgment.score,
            flaggedRowCount: judgment.flaggedRows.length,
            timestampMs: Date.now(),
          }

          setReviewState({
            status: judgment.score >= PASSING_SCORE ? 'done' : 'idle',
            iteration: 1,
            history: [iter],
            currentJudgment: judgment,
            error: null,
          })
        } catch (err) {
          if (!mountedRef.current) return
          setReviewState((prev) => ({ ...prev, status: 'error', error: toFriendlyReviewError(err) }))
        }
      })()
    },
    [],
  )

  const applyFixes = useCallback(() => {
    const schema = schemaRef.current
    const sample = sampleRef.current
    const snap = stateRef.current

    if (!schema || !sample || snap.status !== 'idle' || !snap.currentJudgment) return

    const capturedJudgment = snap.currentJudgment
    const capturedIteration = snap.iteration

    setReviewState((prev) => ({ ...prev, status: 'fixing' }))

    void (async () => {
      try {
        const fixes = await fixDataset(schema, capturedJudgment, sample)
        if (!mountedRef.current) return

        const patchedRows = applyRowFixes(rowsRef.current, fixes, sample.indexMap)
        rowsRef.current = patchedRows
        onPatchRows(patchedRows)

        const newSample = sampleRowsForReview(patchedRows)
        sampleRef.current = newSample
        const nextIteration = capturedIteration + 1

        setReviewState((prev) => ({ ...prev, status: 'judging', iteration: nextIteration }))

        const judgment = await judgeDataset(schema, newSample)
        if (!mountedRef.current) return

        const iter: ReviewIteration = {
          index: nextIteration,
          score: judgment.score,
          flaggedRowCount: judgment.flaggedRows.length,
          timestampMs: Date.now(),
        }

        setReviewState((prev) => ({
          status: judgment.score >= PASSING_SCORE || nextIteration >= MAX_ITERATIONS ? 'done' : 'idle',
          iteration: nextIteration,
          history: [...prev.history, iter],
          currentJudgment: judgment,
          error: null,
        }))
      } catch (err) {
        if (!mountedRef.current) return
        setReviewState((prev) => ({ ...prev, status: 'error', error: toFriendlyReviewError(err) }))
      }
    })()
  }, [onPatchRows])

  const reset = useCallback(() => {
    rowsRef.current = []
    schemaRef.current = null
    sampleRef.current = null
    const next = INITIAL_STATE
    setReviewState(next)
    stateRef.current = next
  }, [])

  const canApplyFixes =
    reviewState.status === 'idle' &&
    reviewState.currentJudgment !== null &&
    reviewState.currentJudgment.flaggedRows.length > 0 &&
    reviewState.iteration < MAX_ITERATIONS

  return {
    status: reviewState.status,
    iteration: reviewState.iteration,
    history: reviewState.history,
    currentJudgment: reviewState.currentJudgment,
    error: reviewState.error,
    canApplyFixes,
    startReview,
    applyFixes,
    reset,
  }
}
