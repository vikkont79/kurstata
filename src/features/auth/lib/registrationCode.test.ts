import { describe, it, expect, vi, afterEach, type Mock } from 'vitest'

vi.mock('node:crypto', () => ({
  randomInt: vi.fn(),
}))

vi.mock('@/shared/lib/redis', () => ({
  redis: {},
}))

vi.mock('@/shared/lib/auth', () => ({
  CONFIRM_CODE_LENGTH: 6,
  PENDING_REGISTER_TTL_MS: 15 * 60 * 1000,
}))

import { randomInt } from 'node:crypto'
import { generateConfirmationCode } from './registrationCode'

const mockedRandomInt = randomInt as unknown as Mock<() => number>

afterEach(() => {
  mockedRandomInt.mockReset()
})

describe('generateConfirmationCode', () => {
  it('возвращает строку длины по умолчанию 6', () => {
    mockedRandomInt.mockReturnValue(123456)
    expect(generateConfirmationCode()).toMatch(/^\d{6}$/)
  })

  it('возвращает ровно столько цифр, сколько задано длиной', () => {
    mockedRandomInt.mockReturnValue(12)
    expect(generateConfirmationCode(4)).toMatch(/^\d{4}$/)
  })

  it('добивает лидирующие нули (код всегда полной длины)', () => {
    mockedRandomInt.mockReturnValue(42)
    expect(generateConfirmationCode()).toBe('000042')
  })

  it('отдаёт разные значения при разных результатах randomInt', () => {
    mockedRandomInt
      .mockReturnValueOnce(111111)
      .mockReturnValueOnce(999999)
    const a = generateConfirmationCode()
    const b = generateConfirmationCode()
    expect(a).not.toBe(b)
  })

  it('образует диапазон от 000000 до 999999 включительно', () => {
    mockedRandomInt.mockReturnValue(0)
    expect(generateConfirmationCode()).toBe('000000')
    mockedRandomInt.mockReturnValue(999999)
    expect(generateConfirmationCode()).toBe('999999')
  })
})