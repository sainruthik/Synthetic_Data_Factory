import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-36 flex flex-col items-center text-center gap-6">
      <p className="font-mono text-7xl font-bold text-[var(--color-border-hover)]">404</p>

      <h1 className="font-mono text-2xl font-semibold text-[var(--color-heading)]">
        Page not found
      </h1>

      <p className="text-[var(--color-text-muted)] text-sm max-w-xs">
        The route you're looking for doesn't exist. Head back to the factory floor.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-sm font-medium bg-[var(--color-surface-2)] border border-[var(--color-border-hover)] text-[var(--color-text)] hover:text-[var(--color-heading)] hover:border-[var(--color-accent-border)] transition-colors duration-[var(--duration-fast)]"
      >
        ← Back to home
      </Link>
    </section>
  )
}
