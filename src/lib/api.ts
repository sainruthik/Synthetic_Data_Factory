import type { ChatMessage } from '../types/chat'

interface OpenAIChoice {
  message: { role: string; content: string }
}

interface OpenAIResponse {
  choices: OpenAIChoice[]
}

export type { ChatMessage }

/**
 * Calls the OpenAI Chat Completions API and returns the text of the first choice.
 * Base URL defaults to '/api/openai' (matched by the Vite dev proxy).
 * Throws on non-2xx responses or missing content.
 */
export async function callClaude(
  apiKey: string,
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  systemPrompt: string,
  baseUrl = '/api/openai'
): Promise<string> {
  const url = `${baseUrl}/v1/chat/completions`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    }),
  })

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errBody = await response.json() as { error?: { message?: string } }
      errorDetail = errBody?.error?.message ?? ''
    } catch {
      // ignore JSON parse failure on error body
    }
    throw new Error(
      `OpenAI API error ${response.status}${errorDetail ? `: ${errorDetail}` : ''}`
    )
  }

  const data = await response.json() as OpenAIResponse
  const text = data?.choices?.[0]?.message?.content
  if (typeof text !== 'string') {
    throw new Error('Unexpected OpenAI API response shape: missing choices[0].message.content')
  }
  return text
}
