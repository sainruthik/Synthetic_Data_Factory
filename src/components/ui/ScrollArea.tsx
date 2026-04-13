import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type ScrollAreaProps = HTMLAttributes<HTMLDivElement>

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  )
)

ScrollArea.displayName = 'ScrollArea'
