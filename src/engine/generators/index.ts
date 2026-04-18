import type { ExportedField, IntegerOptions, FloatOptions, DateOptions, EnumOptions } from '../../types/schema'
import { generateString } from './string'
import { generateInteger } from './integer'
import { generateFloat } from './float'
import { generateBoolean } from './boolean'
import { generateDate } from './date'
import { generateEmail } from './email'
import { generatePhone } from './phone'
import { generateUuid } from './uuid'
import { generateEnum } from './enum'

export function generateValue(
  field: ExportedField,
  partialRow?: Record<string, unknown>
): unknown {
  switch (field.type) {
    case 'string':  return generateString(field.name)
    case 'integer': return generateInteger(field.options as IntegerOptions | null)
    case 'float':   return generateFloat(field.options as FloatOptions | null)
    case 'boolean': return generateBoolean()
    case 'date':    return generateDate(field.options as DateOptions | null)
    case 'email':   return generateEmail(partialRow)
    case 'phone':   return generatePhone()
    case 'uuid':    return generateUuid()
    case 'enum':    return generateEnum(field.options as EnumOptions | null)
  }
}
