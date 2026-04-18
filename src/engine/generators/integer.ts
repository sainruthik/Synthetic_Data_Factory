import { faker } from '@faker-js/faker'
import type { IntegerOptions } from '../../types/schema'

export function generateInteger(options: IntegerOptions | null): number {
  return faker.number.int({ min: options?.min ?? 0, max: options?.max ?? 1000 })
}
