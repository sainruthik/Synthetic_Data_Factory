import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../types/chat'
import { ScrollArea } from '../ui/ScrollArea'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--color-text-muted)]"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <p className="text-sm text-[var(--color-text-muted)]">
        Describe the dataset you need and I'll build the schema.
      </p>
    </div>
  )
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    // [M4] Use requestAnimationFrame so the isNearBottom measurement happens after
    // layout reflow caused by the new message, preventing premature measurement on old heights.
    requestAnimationFrame(() => {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 150
      if (isNearBottom || isLoading) {
        if (typeof bottomRef.current?.scrollIntoView === 'function') {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      }
    })
  }, [messages.length, isLoading])

  if (messages.length === 0 && !isLoading) {
    return <EmptyState />
  }

  return (
    <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
