import { faker } from '@faker-js/faker'

export function generateString(): string {
  return faker.lorem.words({ min: 1, max: 3 })
}
