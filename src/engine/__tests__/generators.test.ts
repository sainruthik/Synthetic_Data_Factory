import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { faker } from '@faker-js/faker'
import { generateValue } from '../generators'
import type { ExportedField } from '../../types/schema'

function field(overrides: Partial<ExportedField> & Pick<ExportedField, 'type'>): ExportedField {
  return { name: 'x', nullable: 0, options: null, ...overrides }
}

describe('generators', () => {
  beforeEach(() => { faker.seed(42) })

  it('string: returns a non-empty string', () => {
    expect(typeof generateValue(field({ type: 'string' }))).toBe('string')
    expect((generateValue(field({ type: 'string' })) as string).length).toBeGreaterThan(0)
  })

  describe('string: name-aware dispatch', () => {
    afterEach(() => { vi.restoreAllMocks() })

    const nameVariants = ['name', 'full_name', 'fullname', 'full name', 'Name', 'FULL_NAME', 'Full_Name']
    for (const n of nameVariants) {
      it(`"${n}" → faker.person.fullName`, () => {
        const spy = vi.spyOn(faker.person, 'fullName')
        generateValue(field({ name: n, type: 'string' }))
        expect(spy).toHaveBeenCalledOnce()
      })
    }

    const firstNameVariants = ['first_name', 'firstname', 'firstName', 'FIRST_NAME']
    for (const n of firstNameVariants) {
      it(`"${n}" → faker.person.firstName`, () => {
        const spy = vi.spyOn(faker.person, 'firstName')
        generateValue(field({ name: n, type: 'string' }))
        expect(spy).toHaveBeenCalledOnce()
      })
    }

    const lastNameVariants = ['last_name', 'lastname', 'lastName', 'LAST_NAME']
    for (const n of lastNameVariants) {
      it(`"${n}" → faker.person.lastName`, () => {
        const spy = vi.spyOn(faker.person, 'lastName')
        generateValue(field({ name: n, type: 'string' }))
        expect(spy).toHaveBeenCalledOnce()
      })
    }

    it('non-matching field name falls back to faker.lorem.words', () => {
      const spy = vi.spyOn(faker.lorem, 'words')
      generateValue(field({ name: 'description', type: 'string' }))
      expect(spy).toHaveBeenCalledOnce()
    })

    it('default field name "x" falls back to faker.lorem.words', () => {
      const spy = vi.spyOn(faker.lorem, 'words')
      generateValue(field({ type: 'string' }))
      expect(spy).toHaveBeenCalledOnce()
    })
  })

  it('integer: returns number within bounds', () => {
    const f = field({ type: 'integer', options: { min: 10, max: 20 } })
    for (let i = 0; i < 30; i++) {
      const val = generateValue(f) as number
      expect(val).toBeGreaterThanOrEqual(10)
      expect(val).toBeLessThanOrEqual(20)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('float: returns number within bounds', () => {
    const f = field({ type: 'float', options: { min: 0, max: 1 } })
    for (let i = 0; i < 30; i++) {
      const val = generateValue(f) as number
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThanOrEqual(1)
    }
  })

  it('boolean: returns boolean', () => {
    expect(typeof generateValue(field({ type: 'boolean' }))).toBe('boolean')
  })

  it('email: contains @ symbol', () => {
    expect((generateValue(field({ type: 'email' })) as string)).toMatch(/@/)
  })

  it('phone: returns non-empty string', () => {
    expect(typeof generateValue(field({ type: 'phone' }))).toBe('string')
  })

  it('uuid: matches uuid format', () => {
    const val = generateValue(field({ type: 'uuid' })) as string
    expect(val).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('date: matches YYYY-MM-DD format', () => {
    const val = generateValue(field({ type: 'date', options: { format: 'YYYY-MM-DD' } })) as string
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('date: matches MM/DD/YYYY format', () => {
    const val = generateValue(field({ type: 'date', options: { format: 'MM/DD/YYYY' } })) as string
    expect(val).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
  })

  describe('date: min/max year constraints', () => {
    it('respects min year — no date before min year', () => {
      const f = field({ type: 'date', options: { format: 'YYYY-MM-DD', min: 2015 } })
      for (let i = 0; i < 50; i++) {
        const year = parseInt((generateValue(f) as string).slice(0, 4), 10)
        expect(year).toBeGreaterThanOrEqual(2015)
      }
    })

    it('respects max year — no date after max year', () => {
      const f = field({ type: 'date', options: { format: 'YYYY-MM-DD', max: 2024 } })
      for (let i = 0; i < 50; i++) {
        const year = parseInt((generateValue(f) as string).slice(0, 4), 10)
        expect(year).toBeLessThanOrEqual(2024)
      }
    })

    it('respects both min and max — all dates within 2015–2024', () => {
      const f = field({ type: 'date', options: { format: 'YYYY-MM-DD', min: 2015, max: 2024 } })
      for (let i = 0; i < 50; i++) {
        const year = parseInt((generateValue(f) as string).slice(0, 4), 10)
        expect(year).toBeGreaterThanOrEqual(2015)
        expect(year).toBeLessThanOrEqual(2024)
      }
    })

    it('no min/max still generates a date within fallback range (2000–2030)', () => {
      const f = field({ type: 'date', options: { format: 'YYYY-MM-DD' } })
      const val = generateValue(f) as string
      expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const year = parseInt(val.slice(0, 4), 10)
      expect(year).toBeGreaterThanOrEqual(2000)
      expect(year).toBeLessThanOrEqual(2030)
    })

    it('min year constraint also works with MM/DD/YYYY format', () => {
      const f = field({ type: 'date', options: { format: 'MM/DD/YYYY', min: 2018, max: 2022 } })
      for (let i = 0; i < 50; i++) {
        const val = generateValue(f) as string
        expect(val).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
        const year = parseInt(val.slice(6), 10)
        expect(year).toBeGreaterThanOrEqual(2018)
        expect(year).toBeLessThanOrEqual(2022)
      }
    })
  })

  it('enum: returns one of provided options', () => {
    const f = field({ type: 'enum', options: { options: ['a', 'b', 'c'] } })
    for (let i = 0; i < 30; i++) {
      expect(['a', 'b', 'c']).toContain(generateValue(f))
    }
  })

  it('enum: falls back to defaults when options empty', () => {
    const f = field({ type: 'enum', options: { options: [] } })
    const val = generateValue(f) as string
    expect(['value_a', 'value_b', 'value_c']).toContain(val)
  })

  describe('email: name-aware dispatch', () => {
    afterEach(() => { vi.restoreAllMocks() })

    it('no partial row → faker.internet.email called without name args', () => {
      const spy = vi.spyOn(faker.internet, 'email')
      generateValue(field({ type: 'email' }))
      expect(spy).toHaveBeenCalledOnce()
      expect(spy.mock.calls[0][0]).toBeUndefined()
    })

    it('partial row with no name field → falls back to random email', () => {
      const spy = vi.spyOn(faker.internet, 'email')
      generateValue(field({ type: 'email' }), { age: 30 })
      expect(spy).toHaveBeenCalledOnce()
      expect(spy.mock.calls[0][0]).toBeUndefined()
    })

    it('partial row with null name value → falls back to random email', () => {
      const spy = vi.spyOn(faker.internet, 'email')
      generateValue(field({ type: 'email' }), { name: null })
      expect(spy).toHaveBeenCalledOnce()
      expect(spy.mock.calls[0][0]).toBeUndefined()
    })

    const nameFieldVariants = ['name', 'full_name', 'fullname', 'Name', 'FULL_NAME']
    for (const nameField of nameFieldVariants) {
      it(`partial row with "${nameField}" field → email derived from first/last name`, () => {
        const spy = vi.spyOn(faker.internet, 'email')
        generateValue(field({ type: 'email' }), { [nameField]: 'Alice Smith' })
        expect(spy).toHaveBeenCalledOnce()
        expect(spy.mock.calls[0][0]).toMatchObject({ firstName: 'Alice', lastName: 'Smith' })
      })
    }

    it('single-word name → only firstName passed', () => {
      const spy = vi.spyOn(faker.internet, 'email')
      generateValue(field({ type: 'email' }), { name: 'Madonna' })
      expect(spy).toHaveBeenCalledOnce()
      const arg = spy.mock.calls[0][0] as Record<string, string>
      expect(arg.firstName).toBe('Madonna')
      expect(arg.lastName).toBeUndefined()
    })

    it('multi-word last name → everything after first word becomes lastName', () => {
      const spy = vi.spyOn(faker.internet, 'email')
      generateValue(field({ type: 'email' }), { name: 'Mary Jane Watson' })
      expect(spy).toHaveBeenCalledOnce()
      expect(spy.mock.calls[0][0]).toMatchObject({ firstName: 'Mary', lastName: 'Jane Watson' })
    })

    it('result still contains @ regardless of dispatch path', () => {
      const email = generateValue(field({ type: 'email' }), { name: 'Alice Smith' }) as string
      expect(email).toMatch(/@/)
    })
  })
})
