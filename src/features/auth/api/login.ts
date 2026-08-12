'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { loginSchema } from '@/features/auth/types'
import {
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  LOCKOUT_MS,
  RATE_LIMIT_LOGIN_FAIL,
  RATE_LIMIT_LOGIN_WINDOW_MS,
} from '@/shared/lib/auth'
import { computeNextLockout } from '@/shared/lib/auth/lockout'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/rateLimit'
import { getClientIp } from '@/shared/lib/getClientIp'
import type { User } from '@/entities/user'

export async function login(input: unknown): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const parsed = loginSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { email, password } = parsed.data

    const [found] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        passwordHash: users.passwordHash,
        failedLoginAttempts: users.failedLoginAttempts,
        lockedUntil: users.lockedUntil,
        lastFailedAt: users.lastFailedAt,
      })
      .from(users)
      .where(eq(users.email, email))

    if (!found) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    if (found.lockedUntil && new Date(found.lockedUntil).getTime() > Date.now()) {
      return { success: false, error: 'Слишком много неудачных попыток. Попробуйте позже' }
    }

    const isValid = await verifyPassword(password, found.passwordHash)

    if (!isValid) {
      const clientIp = getClientIp(await headers())
      if (clientIp) {
        const rl = await isRateLimited({
          key: `${clientIp}:${email}`,
          limit: RATE_LIMIT_LOGIN_FAIL,
          windowMs: RATE_LIMIT_LOGIN_WINDOW_MS,
        })
        if (!rl.allowed) {
          return { success: false, error: formatRateLimitMessage(rl.reset) }
        }
      }

      const now = Date.now()
      const { nextAttempts, shouldLock } = computeNextLockout({
        failedLoginAttempts: found.failedLoginAttempts,
        lastFailedAt: found.lastFailedAt,
        now,
      })

      await db
        .update(users)
        .set({
          failedLoginAttempts: nextAttempts,
          lockedUntil: shouldLock ? new Date(now + LOCKOUT_MS).toISOString() : null,
          lastFailedAt: new Date(now).toISOString(),
        })
        .where(eq(users.id, found.id))

      return { success: false, error: 'Неверный email или пароль' }
    }

    const [updated] = await db
      .update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null, lastFailedAt: null })
      .where(eq(users.id, found.id))
      .returning({ id: users.id, name: users.name, email: users.email, tokenVersion: users.tokenVersion })

    const token = signSessionToken({ userId: updated.id, tokenVersion: updated.tokenVersion })
    await setSessionCookie(token)

    return { success: true, user: { id: updated.id, name: updated.name, email: updated.email } }
  } catch (err) {
    console.error('login: ошибка входа', err)
    return { success: false, error: 'Не удалось выполнить вход. Попробуйте позже' }
  }
}