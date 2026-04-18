import { faker } from '@faker-js/faker'
import type { DateOptions } from '../../types/schema'

function formatDate(date: Date, format: string): string {
  const yyyy = date.getFullYear().toString()
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  return format.replace('YYYY', yyyy).replace('MM', mm).replace('DD', dd)
}

export function generateDate(options: DateOptions | null): string {
  const format = options?.format ?? 'YYYY-MM-DD'
  const date = faker.date.between({ from: new Date('2000-01-01'), to: new Date('2030-12-31') })
  if (format === 'ISO') return date.toISOString()
  return formatDate(date, format)
}
