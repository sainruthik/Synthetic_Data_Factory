import { faker } from '@faker-js/faker'
import type { FloatOptions } from '../../types/schema'

export function generateFloat(options: FloatOptions | null): number {
  return faker.number.float({ min: options?.min ?? 0, max: options?.max ?? 1000, fractionDigits: 2 })
}
