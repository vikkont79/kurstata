import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  requestResetSchema,
  confirmSchema,
  resendSchema,
} from './index'

describe('нормализация email в схемах', () => {
  it.each([
    ['loginSchema', loginSchema, { email: 'User@Example.COM', password: 'secret1' }],
    ['registerSchema', registerSchema, { name: 'Имя', email: 'User@Example.COM', password: 'secret1' }],
    ['requestResetSchema', requestResetSchema, { email: 'User@Example.COM' }],
    ['confirmSchema', confirmSchema, { email: 'User@Example.COM', code: '123456' }],
    ['resendSchema', resendSchema, { email: 'User@Example.COM' }],
  ])('%s приводит email к нижнему регистру', (_name, schema, values) => {
    const result = schema.safeParse(values)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('user@example.com')
    }
  })

  it('схема подтверждения по-прежнему отвергает некорректный код после трансформации email', () => {
    const result = confirmSchema.safeParse({ email: '  User@Example.COM  ', code: 'ab' })
    expect(result.success).toBe(false)
  })

  it('схема подтверждения отсекает пробелы и приводит email к нижнему регистру одновременно', () => {
    const result = confirmSchema.safeParse({ email: '  User@Example.COM  ', code: '123456' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('user@example.com')
    }
  })
})