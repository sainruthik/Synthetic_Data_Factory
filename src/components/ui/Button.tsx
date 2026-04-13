import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-accent)] text-white border-transparent',
    'hover:bg-[var(--color-accent-hover)]',
    'active:scale-95',
  ].join(' '),
  secondary: [
    'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border-hover)]',
    'hover:text-[var(--color-heading)] hover:border-[var(--color-accent-border)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--color-text-muted)] border-transparent',
    'hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded border font-mono font-medium',
          'transition-all duration-[var(--duration-fast)] ease-out',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
