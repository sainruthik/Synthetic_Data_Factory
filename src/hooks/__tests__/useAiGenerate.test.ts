import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAiGenerate } from '../useAiGenerate'

vi.mock('../../lib/api', () => ({ callClaude: vi.fn() }))
import { callClaude } from '../../lib/api'
const mockCallClaude = vi.mocked(callClaude)

const schema = {
  fields: [{ name: 'id', type: 'integer' as const, nullable: 0, options: { min: 1, max: 100 } }],
  constraints: [] as [],
}

const makeRows = (n: number) =>
  JSON.stringify(Array.from({ length: n }, (_, i) => ({ id: i + 1 })))

beforeEach(() => {
  mockCallClaude.mockReset()
  vi.stubEnv('VITE_OPENAI_API_KEY', 'test-key')
})

describe('useAiGenerate', () => {
  it('starts not generating with null progress', () => {
    const { result } = renderHook(() => useAiGenerate())
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.progress).toBeNull()
  })

  it('generates rows from a single batch', async () => {
    mockCallClaude.mockResolvedValue(makeRows(10))
    const { result } = renderHook(() => useAiGenerate())

    let rows!: Record<string, unknown>[]
    await act(async () => {
      rows = await result.current.generateRows(schema, 10)
    })

    expect(rows).toHaveLength(10)
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.progress).toBeNull()
  })

  it('calls API once per batch of 25', async () => {
    mockCallClaude.mockResolvedValue(makeRows(25))
    const { result } = renderHook(() => useAiGenerate())

    await act(async () => {
      await result.current.generateRows(schema, 50) // 2 batches
    })

    expect(mockCallClaude).toHaveBeenCalledTimes(2)
  })

  it('caps row count at 100 (4 batches of 25)', async () => {
    mockCallClaude.mockResolvedValue(makeRows(25))
    const { result } = renderHook(() => useAiGenerate())

    await act(async () => {
      await result.current.generateRows(schema, 200) // capped to 100 = 4 batches
    })

    expect(mockCallClaude).toHaveBeenCalledTimes(4)
  })

  it('last batch uses remaining row count, not full 25', async () => {
    mockCallClaude.mockResolvedValue(makeRows(25))
    const { result } = renderHook(() => useAiGenerate())

    await act(async () => {
      await result.current.generateRows(schema, 30) // batch1=25, batch2=5
    })

    expect(mockCallClaude).toHaveBeenCalledTimes(2)
    const secondCallBody = mockCallClaude.mock.calls[1][1][0].content
    expect(secondCallBody).toContain('5') // 5 rows in second batch
  })

  it('concatenates rows from all batches', async () => {
    mockCallClaude
      .mockResolvedValueOnce(makeRows(25))
      .mockResolvedValueOnce(makeRows(5))
    const { result } = renderHook(() => useAiGenerate())

    let rows!: Record<string, unknown>[]
    await act(async () => {
      rows = await result.current.generateRows(schema, 30)
    })

    expect(rows).toHaveLength(30)
  })

  it('isGenerating is true while in progress', async () => {
    let resolveFn!: (v: string) => void
    mockCallClaude.mockReturnValue(new Promise<string>((r) => { resolveFn = r }))
    const { result } = renderHook(() => useAiGenerate())

    act(() => { void result.current.generateRows(schema, 10) })
    expect(result.current.isGenerating).toBe(true)

    await act(async () => { resolveFn(makeRows(10)) })
    expect(result.current.isGenerating).toBe(false)
  })

  it('throws friendly error when API key is missing', async () => {
    vi.stubEnv('VITE_OPENAI_API_KEY', '')
    const { result } = renderHook(() => useAiGenerate())

    await expect(
      act(async () => { await result.current.generateRows(schema, 10) })
    ).rejects.toThrow(/VITE_OPENAI_API_KEY/)
  })

  it('maps 429 error to friendly rate limit message', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 429'))
    const { result } = renderHook(() => useAiGenerate())

    await expect(
      act(async () => { await result.current.generateRows(schema, 10) })
    ).rejects.toThrow(/rate limit/i)
  })

  it('resets isGenerating and progress to false/null after error', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 429'))
    const { result } = renderHook(() => useAiGenerate())

    await act(async () => {
      try { await result.current.generateRows(schema, 10) } catch { /* expected */ }
    })

    expect(result.current.isGenerating).toBe(false)
    expect(result.current.progress).toBeNull()
  })
})
