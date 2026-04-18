import { faker } from '@faker-js/faker'

export function generatePhone(): string {
  return faker.phone.number()
}
