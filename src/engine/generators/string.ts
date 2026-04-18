import { faker } from '@faker-js/faker'
import { normalizeFieldName } from './utils'

export function generateString(fieldName = ''): string {
  const n = normalizeFieldName(fieldName)
  if (n === 'name' || n === 'fullname') return faker.person.fullName()
  if (n === 'firstname') return faker.person.firstName()
  if (n === 'lastname') return faker.person.lastName()
  return faker.lorem.words({ min: 1, max: 3 })
}
