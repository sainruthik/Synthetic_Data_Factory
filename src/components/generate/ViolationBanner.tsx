import type { ConstraintViolation } from '../../engine/generateDataset'

interface ViolationBannerProps {
  violations: ConstraintViolation[]
}

export function ViolationBanner({ violations }: ViolationBannerProps) {
  if (violations.length === 0) return null

  return (
    <div className="rounded border border-yellow-500/40 bg-yellow-500/10 p-4">
      <p className="text-xs font-mono font-semibold text-yellow-600 mb-2 uppercase tracking-wider">
        ⚠ Constraint warnings ({violations.length})
      </p>
      <ul className="space-y-1">
        {violations.map((v, i) => (
          <li key={i} className="text-xs font-mono text-yellow-700 dark:text-yellow-400">
            {v.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
