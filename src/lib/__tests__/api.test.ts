import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callClaude } from '../api'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  mockFetch.mockReset()
})

const messages = [{ role: 'user' as const, content: 'hello' }]
const systemPrompt = 'You are a helpful assistant.'
const baseUrl = '/api/openai'

describe('callClaude', () => {
  it('returns text from a successful response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: '{"fields":[]}' } }],
      }),
    })

    const result = await callClaude('test-key', messages, systemPrompt, baseUrl)
    expect(result).toBe('{"fields":[]}')
  })

  it('sends the correct headers and body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'ok' } }],
      }),
    })

    await callClaude('my-api-key', messages, systemPrompt, baseUrl)

    const [url, opts] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/openai/v1/chat/completions')
    expect(opts.method).toBe('POST')
    const headers = opts.headers as Record<string, string>
    expect(headers['Authorization']).toBe('Bearer my-api-key')

    const body = JSON.parse(opts.body as string) as Record<string, unknown>
    expect(body.model).toBe('gpt-4o')
    // system prompt is injected as first message
    const bodyMessages = body.messages as Array<{ role: string; content: string }>
    expect(bodyMessages[0]).toEqual({ role: 'system', content: systemPrompt })
  })

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    })

    await expect(callClaude('bad-key', messages, systemPrompt, baseUrl)).rejects.toThrow(
      'OpenAI API error 401: Unauthorized'
    )
  })

  it('throws on a non-2xx response even when error body is unparseable', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => { throw new Error('bad json') },
    })

    await expect(callClaude('key', messages, systemPrompt, baseUrl)).rejects.toThrow(
      'OpenAI API error 500'
    )
  })

  it('throws when choices[0].message.content is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    })

    await expect(callClaude('key', messages, systemPrompt, baseUrl)).rejects.toThrow(
      'missing choices[0].message.content'
    )
  })

  it('propagates network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'))
    await expect(callClaude('key', messages, systemPrompt, baseUrl)).rejects.toThrow('Network failure')
  })
})
