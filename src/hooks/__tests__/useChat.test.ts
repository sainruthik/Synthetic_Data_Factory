import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '../useChat'

vi.mock('../../lib/api', () => ({
  callClaude: vi.fn(),
}))

import { callClaude } from '../../lib/api'
const mockCallClaude = vi.mocked(callClaude)

const validSchemaJson = JSON.stringify({
  fields: [{ name: 'id', type: 'uuid', nullable: 0, options: null }],
})

beforeEach(() => {
  mockCallClaude.mockReset()
  // Provide a default API key for most tests
  vi.stubEnv('VITE_OPENAI_API_KEY', 'test-key')
})

describe('useChat', () => {
  it('starts with empty messages and not loading', () => {
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))
    expect(result.current.messages).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('appends user message immediately on sendMessage', async () => {
    mockCallClaude.mockResolvedValue(validSchemaJson)
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    act(() => {
      result.current.sendMessage('give me a user table')
    })

    expect(result.current.messages[0].role).toBe('user')
    expect(result.current.messages[0].content).toBe('give me a user table')
  })

  it('sets isLoading while the API call is in flight', async () => {
    let resolve!: (v: string) => void
    mockCallClaude.mockReturnValue(new Promise<string>((res) => { resolve = res }))
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    act(() => { result.current.sendMessage('hello') })
    expect(result.current.isLoading).toBe(true)

    act(() => { resolve(validSchemaJson) })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
  })

  it('calls onSchema with the parsed schema on success', async () => {
    mockCallClaude.mockResolvedValue(validSchemaJson)
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('give me a user table') })

    expect(onSchema).toHaveBeenCalledOnce()
    expect(onSchema.mock.calls[0][0]).toMatchObject({ fields: [{ name: 'id', type: 'uuid' }] })
  })

  it('appends a success assistant message after parsing', async () => {
    mockCallClaude.mockResolvedValue(validSchemaJson)
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('give me a user table') })

    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.role).toBe('assistant')
    expect(lastMsg.isError).toBeFalsy()
    expect(lastMsg.content).toMatch(/1 field/)
  })

  // [L5] Error string was incorrectly referencing "Anthropic" — corrected to "OpenAI"
  it('appends an error bot bubble on API failure without crashing', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 401: Unauthorized'))
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('make schema') })

    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.role).toBe('assistant')
    expect(lastMsg.isError).toBe(true)
    expect(onSchema).not.toHaveBeenCalled()
  })

  // [M5] 401 → friendly auth error message
  it('shows friendly authentication error message for 401', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 401: Unauthorized'))
    const { result } = renderHook(() => useChat({ onSchema: vi.fn() }))
    await act(async () => { result.current.sendMessage('make schema') })
    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.content).toContain('API key')
  })

  // [M5] 429 → friendly rate-limit message
  it('shows friendly rate-limit message for 429', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 429: Too Many Requests'))
    const { result } = renderHook(() => useChat({ onSchema: vi.fn() }))
    await act(async () => { result.current.sendMessage('make schema') })
    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.content).toMatch(/rate limit|wait/i)
  })

  // [M5] 5xx → service unavailable message
  it('shows service unavailable message for 503', async () => {
    mockCallClaude.mockRejectedValue(new Error('OpenAI API error 503: Service Unavailable'))
    const { result } = renderHook(() => useChat({ onSchema: vi.fn() }))
    await act(async () => { result.current.sendMessage('make schema') })
    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.content).toMatch(/unavailable|try again/i)
  })

  // [M5] parse failure → user-friendly rephrasing message
  it('shows friendly message when the AI returns invalid JSON', async () => {
    mockCallClaude.mockResolvedValue('I cannot help with that.')
    const { result } = renderHook(() => useChat({ onSchema: vi.fn() }))
    await act(async () => { result.current.sendMessage('make schema') })
    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.isError).toBe(true)
    expect(lastMsg.content).toMatch(/rephrase|unexpected/i)
  })

  it('appends error bubble when JSON parse fails', async () => {
    mockCallClaude.mockResolvedValue('I cannot help with that.')
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('make schema') })

    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.isError).toBe(true)
    expect(onSchema).not.toHaveBeenCalled()
  })

  it('shows error message when API key is missing', async () => {
    vi.stubEnv('VITE_OPENAI_API_KEY', '')
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('make schema') })

    const lastMsg = result.current.messages.at(-1)!
    expect(lastMsg.isError).toBe(true)
    expect(lastMsg.content).toContain('VITE_OPENAI_API_KEY')
    expect(mockCallClaude).not.toHaveBeenCalled()
  })

  it('clearMessages resets to empty array', async () => {
    mockCallClaude.mockResolvedValue(validSchemaJson)
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    await act(async () => { result.current.sendMessage('hello') })
    expect(result.current.messages.length).toBeGreaterThan(0)

    act(() => { result.current.clearMessages() })
    expect(result.current.messages).toHaveLength(0)
  })

  it('ignores empty or whitespace-only sendMessage calls', async () => {
    const onSchema = vi.fn()
    const { result } = renderHook(() => useChat({ onSchema }))

    act(() => { result.current.sendMessage('   ') })
    expect(result.current.messages).toHaveLength(0)
    expect(mockCallClaude).not.toHaveBeenCalled()
  })
})
