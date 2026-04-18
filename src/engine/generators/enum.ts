import { faker } from '@faker-js/faker'
import type { EnumOptions } from '../../types/schema'

export function generateEnum(options: EnumOptions | null): string {
  const choices = options?.options?.length ? options.options : ['value_a', 'value_b', 'value_c']
  return faker.helpers.arrayElement(choices)
}
