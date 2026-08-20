/**
 * Единый источник констант логики авторизации.
 * Значения не валидируются (в отличие от `env.ts`) — это константы приложения,
 * а не переменные окружения. Для тестирования значения меняются прямо здесь.
 */

// --- Сессия (JWT + cookie) ---

/** Срок жизни JWT-сессии. */
export const TOKEN_EXPIRES_IN = '7d'

/** Срок жизни cookie сессии в секундах (7 суток). */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

// --- Сброс пароля ---

/** Время жизни токена сброса пароля в миллисекундах. */
export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

// --- Защита от подбора (вход) ---

/**
 * Per-IP локаут: сколько неудачных попыток входа с одного IP (по ключу `ip:email`)
 * за скользящее окно блокирует этот IP. Аккаунт при этом не блокируется —
 * чужие IP не влияют на вход владельца.
 */
export const MAX_FAILED_ATTEMPTS = 5

/** Окно (в миллисекундах) скользящего per-IP локаута входа. */
export const LOGIN_FAIL_WINDOW_MS = 15 * 60 * 1000

// --- Подтверждение регистрации (OTP) ---

/** Длина кода подтверждения. */
export const CONFIRM_CODE_LENGTH = 6

/**
 * Время жизни pending-регистрации в Redis. Пока код не подтверждён,
 * запись (включая bcrypt-хэш пароля) живёт здесь и исчезает по TTL.
 */
export const PENDING_REGISTER_TTL_MS = 15 * 60 * 1000

/** Лимит попыток ввода кода подтверждения на `ip:email` за окно (анти-брутфорс OTP). */
export const RATE_LIMIT_CONFIRM = 5

/** Окно (в миллисекундах) для лимита попыток подтверждения. */
export const RATE_LIMIT_CONFIRM_WINDOW_MS = 15 * 60 * 1000

/** Пауза между повторными отправками кода на один email. */
export const RESEND_COOLDOWN_MS = 60 * 1000

/** Лимит повторных отправок кода с одного IP за окно (окно = жизни pending). */
export const RATE_LIMIT_RESEND = 5

/** Окно (в миллисекундах) для per-IP лимита повторных отправок — совпадает с TTL pending. */
export const RATE_LIMIT_RESEND_WINDOW_MS = 15 * 60 * 1000

// --- Rate limiting (Upstash) ---

/** Лимит регистраций с одного IP в час. */
export const RATE_LIMIT_REGISTER = 5

/** Окно (в миллисекундах) для per-IP лимита регистраций. */
export const RATE_LIMIT_REGISTER_WINDOW_MS = 60 * 60 * 1000

/** Лимит запросов сброса пароля с одного IP/email в час. */
export const RATE_LIMIT_RESET = 3

/** Окно (в миллисекундах) для лимита запросов сброса пароля. */
export const RATE_LIMIT_RESET_WINDOW_MS = 60 * 60 * 1000
