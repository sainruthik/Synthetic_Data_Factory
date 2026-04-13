import { useCallback } from 'react'
import type { SchemaField } from '../../types/schema'
import type { ExportedSchema } from '../../types/schema'
import { useChat } from '../../hooks/useChat'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { exportedSchemaToFields } from '../../lib/schemaToFields'

// [L4] Use the canonical SchemaField[] type rather than ReturnType<typeof exportedSchemaToFields>
interface ChatPanelProps {
  onSchema: (fields: SchemaField[]) => void
}

export function ChatPanel({ onSchema }: ChatPanelProps) {
  // [M3] Memoize so useChat's sendMessage dep array doesn't invalidate on every parent render
  const handleSchema = useCallback(
    (schema: ExportedSchema) => {
      onSchema(exportedSchemaToFields(schema))
    },
    [onSchema]
  )

  const { messages, isLoading, sendMessage } = useChat({ onSchema: handleSchema })

  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-accent)]"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h2 className="text-sm font-semibold text-[var(--color-text)]">AI Schema Assistant</h2>
      </div>

      {/* Message list — flex-1 so it fills remaining space */}
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  )
}
