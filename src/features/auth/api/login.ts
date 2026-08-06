'use server'

import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { loginSchema } from '@/features/auth/types'
import { verifyPassword, signSessionToken, setSessionCookie } from '@/shared/lib/auth'
import type { User } from '@/entities/user'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

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
      const nextAttempts = (found.failedLoginAttempts ?? 0) + 1
      const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS
      await db
        .update(users)
        .set({
          failedLoginAttempts: nextAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null,
        })
        .where(eq(users.id, found.id))
      return { success: false, error: 'Неверный email или пароль' }
    }

    await db
      .update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, found.id))

    const token = signSessionToken({ userId: found.id, email: found.email })
    await setSessionCookie(token)

    return { success: true, user: { id: found.id, name: found.name, email: found.email } }
  } catch (err) {
    console.error('login: ошибка входа', err)
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'Неизвестная ошибка' }
  }
}
