import type { ExportedSchema } from '../types/schema'

export function buildAiGenerateSystemPrompt(): string {
  return `You are a synthetic data generator. Your ONLY output must be a valid JSON array of objects.
Every field in each row must make semantic sense together — names should match emails, job titles should match salaries, product names should match categories, dates should be internally consistent.
Return ONLY the raw JSON array with no explanation, no markdown, no code fences.`
}

export function buildAiGenerateUserMessage(schema: ExportedSchema, batchSize: number): string {
  return JSON.stringify({
    task: `Generate exactly ${batchSize} rows`,
    schema: {
      fields: schema.fields.map((f) => ({
        name: f.name,
        type: f.type,
        nullable: f.nullable,
        options: f.options,
      })),
      constraints: schema.constraints,
    },
  })
}

function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
}

export function parseAiGenerateResponse(raw: string): Record<string, unknown>[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(stripFences(raw))
  } catch {
    throw new Error(`AI response is not valid JSON: ${raw.slice(0, 200)}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response must be a JSON array of row objects')
  }

  return parsed as Record<string, unknown>[]
}

export function toFriendlyAiGenerateError(err: unknown): string {
  const raw = err instanceof Error ? err.message : ''
  if (/40[13]/.test(raw)) return 'Authentication failed. Check VITE_OPENAI_API_KEY in .env.local.'
  if (/429/.test(raw)) return 'Rate limit reached. Please wait a moment and try again.'
  if (/5\d\d/.test(raw)) return 'The AI service is temporarily unavailable. Try again shortly.'
  if (raw) return raw
  return 'Unexpected error during AI generation.'
}
