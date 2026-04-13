import { useState } from 'react'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

function SendIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('')

  const canSubmit = value.trim().length > 0 && !disabled

  const handleSubmit = () => {
    if (!canSubmit) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <div className="flex items-end gap-2 border-t border-[var(--color-border)] px-3 py-3">
      <Textarea
        aria-label="Message input"
        placeholder="Describe your dataset… (Ctrl+Enter to send)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onSubmit={handleSubmit}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Send message"
        className="shrink-0"
      >
        <SendIcon />
      </Button>
    </div>
  )
}
