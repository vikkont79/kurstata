import { MAX_FAILED_ATTEMPTS, LOGIN_FAIL_WINDOW_MS } from './constants'

type LockoutState = {
  failedLoginAttempts: number | null
  lastFailedAt: string | null
  now?: number
}

type LockoutDecision = {
  nextAttempts: number
  shouldLock: boolean
}

/**
 * Оконная логика локаута: решает, на что ставить счётчик неудачных попыток
 * и пора ли блокировать аккаунт. Чистая функция — единый источник правды,
 * используется в login.ts и покрыта юнит-тестами.
 */
const computeNextLockout = ({ failedLoginAttempts, lastFailedAt, now = Date.now() }: LockoutState): LockoutDecision => {
  const lastFailedMs = lastFailedAt ? new Date(lastFailedAt).getTime() : 0
  const windowExpired = now - lastFailedMs > LOGIN_FAIL_WINDOW_MS
  const nextAttempts = windowExpired ? 1 : (failedLoginAttempts ?? 0) + 1
  const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS
  return { nextAttempts, shouldLock }
}

export { computeNextLockout }