import { cn } from '../../lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5',
        'transition-colors duration-[var(--duration-fast)]',
        hoverable && 'hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-2)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
