import { describe, it, expect } from 'vitest'
import { computeNextLockout } from './lockout'
import { MAX_FAILED_ATTEMPTS, LOGIN_FAIL_WINDOW_MS } from './constants'

const NOW = 1_800_000_000_000

describe('computeNextLockout', () => {
  it('первый фейл без истории — счётчик 1, без блокировки', () => {
    expect(computeNextLockout({ failedLoginAttempts: null, lastFailedAt: null, now: NOW })).toEqual({
      nextAttempts: 1,
      shouldLock: false,
    })
  })

  it('фрейлы в пределах окна накапливаются (+1)', () => {
    const lastFailedAt = new Date(NOW - 60_000).toISOString()
    const res = computeNextLockout({ failedLoginAttempts: 2, lastFailedAt, now: NOW })
    expect(res.nextAttempts).toBe(3)
    expect(res.shouldLock).toBe(false)
  })

  it('окно истекло — счётчик сбрасывается на 1', () => {
    const lastFailedAt = new Date(NOW - LOGIN_FAIL_WINDOW_MS - 1).toISOString()
    expect(computeNextLockout({ failedLoginAttempts: 4, lastFailedAt, now: NOW }).nextAttempts).toBe(1)
  })

  it('0 фейлов (но поле есть), окно в пределах — счётчик 1', () => {
    const lastFailedAt = new Date(NOW - 10_000).toISOString()
    expect(computeNextLockout({ failedLoginAttempts: 0, lastFailedAt, now: NOW }).nextAttempts).toBe(1)
  })

  it(`достижение порога ${MAX_FAILED_ATTEMPTS} блокирует аккаунт`, () => {
    const lastFailedAt = new Date(NOW - 10_000).toISOString()
    const res = computeNextLockout({ failedLoginAttempts: MAX_FAILED_ATTEMPTS - 1, lastFailedAt, now: NOW })
    expect(res).toEqual({ nextAttempts: MAX_FAILED_ATTEMPTS, shouldLock: true })
  })

  it(`порог ${MAX_FAILED_ATTEMPTS} не блокирует при меньшем числе в окне`, () => {
    const lastFailedAt = new Date(NOW - 10_000).toISOString()
    expect(computeNextLockout({ failedLoginAttempts: MAX_FAILED_ATTEMPTS - 2, lastFailedAt, now: NOW }).shouldLock).toBe(false)
  })
})