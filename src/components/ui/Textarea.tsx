import { forwardRef, useEffect, useRef, useCallback } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import { fieldInputBase } from '../../lib/styles'

const MAX_HEIGHT_PX = 120

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Called when the user presses Cmd/Ctrl+Enter */
  onSubmit?: () => void
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onSubmit, onChange, value, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null)

    // Merge forwarded ref with inner ref
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        (innerRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
      },
      [ref]
    )

    // [L2] Auto-resize: cap height at MAX_HEIGHT_PX and switch to scrollable once exceeded,
    // preventing the inline height from overriding max-h CSS and clipping content invisibly.
    useEffect(() => {
      const el = innerRef.current
      if (!el) return
      el.style.height = 'auto'
      const newHeight = Math.min(el.scrollHeight, MAX_HEIGHT_PX)
      el.style.height = `${newHeight}px`
      el.style.overflowY = el.scrollHeight > MAX_HEIGHT_PX ? 'auto' : 'hidden'
    }, [value])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        onSubmit?.()
      }
      props.onKeyDown?.(e)
    }

    return (
      <textarea
        ref={setRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className={cn(
          fieldInputBase,
          'w-full resize-none leading-5',
          'min-h-[38px] max-h-[120px]',
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
