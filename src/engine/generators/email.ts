import { faker } from '@faker-js/faker'

export function generateEmail(): string {
  return faker.internet.email()
}
