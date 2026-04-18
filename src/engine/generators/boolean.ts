import { faker } from '@faker-js/faker'

export function generateBoolean(): boolean {
  return faker.datatype.boolean()
}
