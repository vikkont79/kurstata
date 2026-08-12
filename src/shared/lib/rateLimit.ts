import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

/**
 * Префикс для всех ключей в Redis. Разделяет счётчики по проекту,
 * т.к. одна база Upstash может использоваться несколькими проектами.
 */
const RATELIMIT_PREFIX = 'kurstata'

type RateLimitOptions = {
  /** Идентификатор, для кого считаем (например, `ip:email`). */
  key: string
  /** Максимум срабатываний за окно. */
  limit: number
  /** Окно в миллисекундах. */
  windowMs: number
}

type RateLimitResult = {
  allowed: boolean
  /** Сколько попыток осталось в окне. */
  remaining?: number
  /** Момент (мс) сброса окна — из него строится сообщение пользователю. */
  reset?: number
}

/** Одна инстанция Ratelimit переиспользуется, пока не изменится лимит/окно. */
let ratelimit: Ratelimit | null = null
let ratelimitLimit = 0
let ratelimitWindowMs = 0

const getRatelimit = (limit: number, windowMs: number): Ratelimit => {
  if (!ratelimit || ratelimitLimit !== limit || ratelimitWindowMs !== windowMs) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      prefix: RATELIMIT_PREFIX,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      ephemeralCache: false,
    })
    ratelimitLimit = limit
    ratelimitWindowMs = windowMs
  }
  return ratelimit
}

/**
 * Проверяет лимит по ключу через скользящее окно Upstash.
 * Fail-open: при недоступности Redis пропускает запрос, не руша вход.
 */
export async function isRateLimited(options: RateLimitOptions): Promise<RateLimitResult> {
  try {
    const res = await getRatelimit(options.limit, options.windowMs).limit(options.key)
    return { allowed: res.success, remaining: res.remaining, reset: res.reset }
  } catch (err) {
    console.warn('[rateLimit] Redis недоступен — пропуск запроса (fail-open)', err)
    return { allowed: true }
  }
}

/** Формирует сообщение пользователю о переполнении лимита с таймером до сброса окна. */
export function formatRateLimitMessage(reset?: number): string {
  if (!reset) return 'Слишком много попыток. Попробуйте позже'
  const seconds = Math.ceil((reset - Date.now()) / 1000)
  return seconds > 0
    ? `Слишком много попыток. Попробуйте снова через ${seconds} с.`
    : 'Слишком много попыток. Попробуйте позже'
}
