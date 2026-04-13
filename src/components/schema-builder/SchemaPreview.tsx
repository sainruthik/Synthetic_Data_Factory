import { useState, useMemo } from 'react'
import type { SchemaState } from '../../types/schema'
import { exportSchema } from '../../lib/exportSchema'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface SchemaPreviewProps {
  state: SchemaState
}

export function SchemaPreview({ state }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const json = useMemo(() => JSON.stringify(exportSchema(state), null, 2), [state])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopyFailed(true)
      setTimeout(() => setCopyFailed(false), 2000)
    }
  }

  function copyLabel() {
    if (copied) return 'Copied!'
    if (copyFailed) return 'Copy failed'
    return 'Copy'
  }

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest">
          Schema JSON
        </span>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copyLabel()}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded bg-[var(--color-bg)] p-4 text-xs leading-relaxed">
        <code role="code">{json}</code>
      </pre>
    </Card>
  )
}
