import { faker } from '@faker-js/faker'
import { findNameValue } from './utils'

export function generateEmail(partialRow?: Record<string, unknown>): string {
  if (partialRow) {
    const fullName = findNameValue(partialRow)
    if (fullName) {
      const parts = fullName.trim().split(/\s+/)
      const firstName = parts[0]
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : undefined
      return faker.internet.email({ firstName, lastName })
    }
  }
  return faker.internet.email()
}
