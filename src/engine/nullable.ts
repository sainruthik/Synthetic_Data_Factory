import { faker } from '@faker-js/faker'

export function applyNullable(value: unknown, nullable: number): unknown {
  if (nullable <= 0) return value
  if (nullable >= 100) return null
  return faker.number.float({ min: 0, max: 100 }) < nullable ? null : value
}
