import { describe, it, expect } from 'vitest'
import { generateResetToken, hashResetToken, isResetTokenExpired } from './resetToken'
import { RESET_TOKEN_TTL_MS } from './constants'

describe('generateResetToken', () => {
  it('возвращает 64 шестнадцатеричных символа', () => {
    expect(generateResetToken()).toMatch(/^[0-9a-f]{64}$/)
  })

  it('генерирует разные токены при каждом вызове', () => {
    expect(generateResetToken()).not.toBe(generateResetToken())
  })
})

describe('hashResetToken', () => {
  it('детерминирован: одинаковый токен даёт одинаковый хэш', () => {
    const token = generateResetToken()
    expect(hashResetToken(token)).toBe(hashResetToken(token))
  })

  it('разные токены дают разные хэши', () => {
    expect(hashResetToken('token-a')).not.toBe(hashResetToken('token-b'))
  })
})

describe('isResetTokenExpired', () => {
  const past = new Date(2000, 0, 1).toISOString()
  const future = new Date(2100, 0, 1).toISOString()

  it('считает неистёкший токен валидным', () => {
    expect(isResetTokenExpired(future)).toBe(false)
  })

  it('считает истёкший токен невалидным', () => {
    expect(isResetTokenExpired(past)).toBe(true)
  })

  it('срок точно в now считается истёкшим', () => {
    const expiresAt = new Date(2000, 0, 1).getTime()
    expect(isResetTokenExpired(new Date(expiresAt).toISOString(), expiresAt)).toBe(true)
  })

  it('учитывает параметр now', () => {
    expect(isResetTokenExpired(past, new Date(1999, 0, 1).getTime())).toBe(false)
    expect(isResetTokenExpired(future, new Date(2200, 0, 1).getTime())).toBe(true)
  })
})

describe('RESET_TOKEN_TTL_MS', () => {
  it('равен 30 минутам', () => {
    expect(RESET_TOKEN_TTL_MS).toBe(30 * 60 * 1000)
  })
})
