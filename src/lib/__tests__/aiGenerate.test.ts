import { describe, it, expect } from 'vitest'
import {
  buildAiGenerateSystemPrompt,
  buildAiGenerateUserMessage,
  parseAiGenerateResponse,
  toFriendlyAiGenerateError,
} from '../aiGenerate'
import type { ExportedSchema } from '../../types/schema'

const schema: ExportedSchema = {
  fields: [
    { name: 'name', type: 'string', nullable: 0, options: null },
    { name: 'age', type: 'integer', nullable: 0, options: { min: 18, max: 65 } },
  ],
  constraints: [],
}

describe('buildAiGenerateSystemPrompt', () => {
  it('contains instruction to return a JSON array', () => {
    expect(buildAiGenerateSystemPrompt()).toContain('JSON array')
  })

  it('instructs model not to include explanation', () => {
    expect(buildAiGenerateSystemPrompt()).toMatch(/ONLY|no explanation/i)
  })

  it('mentions semantic consistency', () => {
    expect(buildAiGenerateSystemPrompt()).toMatch(/consistent|semantic/i)
  })
})

describe('buildAiGenerateUserMessage', () => {
  it('includes the batch size', () => {
    const msg = buildAiGenerateUserMessage(schema, 25)
    expect(msg).toContain('25')
  })

  it('includes schema field names', () => {
    const msg = buildAiGenerateUserMessage(schema, 10)
    expect(msg).toContain('name')
    expect(msg).toContain('age')
  })

  it('includes field types', () => {
    const msg = buildAiGenerateUserMessage(schema, 10)
    expect(msg).toContain('string')
    expect(msg).toContain('integer')
  })

  it('includes constraints when present', () => {
    const s: ExportedSchema = {
      ...schema,
      constraints: [{ type: 'unique', field: 'name' }],
    }
    expect(buildAiGenerateUserMessage(s, 10)).toContain('unique')
  })

  it('different batch sizes produce different messages', () => {
    const a = buildAiGenerateUserMessage(schema, 10)
    const b = buildAiGenerateUserMessage(schema, 25)
    expect(a).not.toBe(b)
  })
})

describe('parseAiGenerateResponse', () => {
  it('parses a plain JSON array', () => {
    const raw = JSON.stringify([{ name: 'Alice', age: 30 }])
    expect(parseAiGenerateResponse(raw)).toEqual([{ name: 'Alice', age: 30 }])
  })

  it('strips markdown json code fences', () => {
    const raw = '```json\n[{"name":"Bob","age":25}]\n```'
    expect(parseAiGenerateResponse(raw)).toEqual([{ name: 'Bob', age: 25 }])
  })

  it('strips plain code fences', () => {
    const raw = '```\n[{"x":1}]\n```'
    expect(parseAiGenerateResponse(raw)).toEqual([{ x: 1 }])
  })

  it('returns multiple rows', () => {
    const rows = [{ name: 'A' }, { name: 'B' }, { name: 'C' }]
    expect(parseAiGenerateResponse(JSON.stringify(rows))).toHaveLength(3)
  })

  it('throws on non-JSON string', () => {
    expect(() => parseAiGenerateResponse('not json')).toThrow(/not valid JSON/)
  })

  it('throws when response is an object not an array', () => {
    expect(() => parseAiGenerateResponse('{"rows":[]}')).toThrow(/must be a JSON array/)
  })

  it('throws on empty string', () => {
    expect(() => parseAiGenerateResponse('')).toThrow()
  })
})

describe('toFriendlyAiGenerateError', () => {
  it('maps 401 to auth error', () => {
    expect(toFriendlyAiGenerateError(new Error('401'))).toMatch(/API key|Authentication/i)
  })

  it('maps 429 to rate limit', () => {
    expect(toFriendlyAiGenerateError(new Error('429'))).toMatch(/rate limit/i)
  })

  it('maps 5xx to service unavailable', () => {
    expect(toFriendlyAiGenerateError(new Error('503'))).toMatch(/unavailable/i)
  })

  it('returns the raw message for unknown errors', () => {
    expect(toFriendlyAiGenerateError(new Error('something weird'))).toContain('something weird')
  })

  it('returns fallback for non-Error', () => {
    expect(toFriendlyAiGenerateError(null)).toMatch(/unexpected/i)
  })
})
