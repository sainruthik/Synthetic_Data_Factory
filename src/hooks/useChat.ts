import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '../types/chat'
import type { ExportedSchema } from '../types/schema'
import { callClaude } from '../lib/api'
import { parseSchemaResponse } from '../lib/parseSchema'

const SYSTEM_PROMPT = `You are a synthetic data schema designer.
The user will describe the dataset they need in natural language.
Your ONLY job is to return a valid JSON schema for that dataset.

Respond with ONLY raw JSON — no prose, no markdown, no explanation.
The JSON must match this exact shape:
{
  "fields": [
    {
      "name": "<field_name>",
      "type": "<type>",
      "nullable": <0-100>,
      "options": <null or type-specific options object>
    }
  ]
}

Valid types: string, integer, float, boolean, date, email, phone, uuid, enum

Type-specific options:
- integer / float: { "min": <number>, "max": <number> }
- date: { "format": "<date_format_string>" }  e.g. "YYYY-MM-DD"
- enum: { "options": ["value1", "value2", ...] }
- All other types: null

nullable is a number from 0 (never null) to 100 (always null), representing the percentage of rows that will be null for this field.

Return ONLY the JSON object. Do not wrap it in code fences or add any surrounding text.`

/** [M5] Map known API error patterns to user-friendly messages. */
function toFriendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : ''
  if (/40[13]/.test(raw)) return 'Authentication failed. Check your API key in .env.local.'
  if (/429/.test(raw)) return 'Rate limit reached. Please wait a moment and try again.'
  if (/5\d\d/.test(raw)) return 'The AI service is temporarily unavailable. Try again shortly.'
  if (/invalid JSON|"fields"/.test(raw))
    return 'The AI returned an unexpected response. Please try rephrasing your request.'
  if (raw) return `Something went wrong: ${raw}`
  return 'Unexpected error occurred.'
}

export interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  sendMessage: (text: string) => void
  clearMessages: () => void
}

interface UseChatOptions {
  onSchema: (schema: ExportedSchema) => void
}

export function useChat({ onSchema }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // [HIGH-2] Mirror messages into a ref so sendMessage always reads the latest
  // value without needing `messages` in its dependency array — eliminates stale closure risk.
  const messagesRef = useRef<ChatMessage[]>([])
  useEffect(() => { messagesRef.current = messages }, [messages])

  const appendMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const full: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, full])
    return full
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
      if (!apiKey) {
        appendMessage({
          role: 'assistant',
          content: 'VITE_OPENAI_API_KEY is not set. Add it to your .env.local file.',
          isError: true,
        })
        setIsLoading(false)
        return
      }

      try {
        // [HIGH-2] Read from ref so we always get the latest messages, not a stale closure snapshot.
        const apiMessages = [...messagesRef.current, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const responseText = await callClaude(apiKey, apiMessages, SYSTEM_PROMPT)
        const schema = parseSchemaResponse(responseText)

        onSchema(schema)

        appendMessage({
          role: 'assistant',
          content: `Done! I've populated the schema with ${schema.fields.length} field${schema.fields.length !== 1 ? 's' : ''}.`,
        })
      } catch (err: unknown) {
        appendMessage({
          role: 'assistant',
          content: toFriendlyError(err),
          isError: true,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, appendMessage, onSchema]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, isLoading, sendMessage, clearMessages }
}
