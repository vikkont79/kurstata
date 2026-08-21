import { describe, it, expect } from 'vitest'
import { getResendCountdownSeconds } from './resendCountdown'

describe('getResendCountdownSeconds', () => {
  it('возвращает 0 если конец не задан', () => {
    expect(getResendCountdownSeconds(0, 1_000_000)).toBe(0)
  })

  it('округляет остаток вверх', () => {
    expect(getResendCountdownSeconds(1_059_999, 1_000_000)).toBe(60)
    expect(getResendCountdownSeconds(1_000_500, 1_000_000)).toBe(1)
  })

  it('возвращает 0 на границе', () => {
    expect(getResendCountdownSeconds(1_000_000, 1_000_000)).toBe(0)
  })

  it('возвращает 0 когда время давно вышло', () => {
    expect(getResendCountdownSeconds(500_000, 1_000_000)).toBe(0)
  })
})
