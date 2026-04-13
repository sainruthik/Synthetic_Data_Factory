import { cn } from '../../lib/cn'

interface AvatarProps {
  variant: 'user' | 'bot'
  className?: string
}

function BotIcon() {
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
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  )
}

export function Avatar({ variant, className }: AvatarProps) {
  const isUser = variant === 'user'
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
        isUser
          ? 'bg-[var(--color-accent)] text-white'
          : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)]',
        className
      )}
      aria-hidden="true"
    >
      {isUser ? 'U' : <BotIcon />}
    </div>
  )
}
