export function normalizeFieldName(name: string): string {
  return name.toLowerCase().replace(/[\s_]/g, '')
}

export function findNameValue(partialRow: Record<string, unknown>): string | null {
  for (const key of Object.keys(partialRow)) {
    const norm = normalizeFieldName(key)
    if (norm === 'name' || norm === 'fullname') {
      const val = partialRow[key]
      if (val != null && typeof val === 'string' && val.trim().length > 0) return val
    }
  }
  return null
}
