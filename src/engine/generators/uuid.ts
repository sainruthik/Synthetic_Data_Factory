import { faker } from '@faker-js/faker'

export function generateUuid(): string {
  return faker.string.uuid()
}
