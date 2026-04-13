import { Avatar } from '../ui/Avatar'

// [L1] role="status" ensures screen readers announce the typing state change.
export function TypingIndicator() {
  return (
    <div className="flex gap-2" role="status" aria-label="Assistant is typing">
      <Avatar variant="bot" />
      <div className="flex items-center gap-1 rounded-lg bg-[var(--color-surface-2)] px-3 py-2">
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--color-text-muted)] [animation-delay:0ms]" />
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--color-text-muted)] [animation-delay:150ms]" />
        <span className="typing-dot h-2 w-2 rounded-full bg-[var(--color-text-muted)] [animation-delay:300ms]" />
      </div>
    </div>
  )
}
