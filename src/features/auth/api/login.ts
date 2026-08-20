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
  MAX_FAILED_ATTEMPTS,
  LOGIN_FAIL_WINDOW_MS,
} from '@/shared/lib/auth'
import { isRateLimited } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'
import type { User } from '@/entities/user'

const GENERIC_LOGIN_ERROR = 'Неверный email или пароль'

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
        tokenVersion: users.tokenVersion,
      })
      .from(users)
      .where(eq(users.email, email))

    if (!found) {
      return { success: false, error: GENERIC_LOGIN_ERROR }
    }

    const isValid = await verifyPassword(password, found.passwordHash)

    if (!isValid) {
      const clientIp = getClientIp(await headers())
      if (clientIp) {
        const rl = await isRateLimited({
          key: `login:${clientIp}:${email}`,
          limit: MAX_FAILED_ATTEMPTS,
          windowMs: LOGIN_FAIL_WINDOW_MS,
        })
        if (!rl.allowed) {
          return { success: false, error: GENERIC_LOGIN_ERROR }
        }
      }

      return { success: false, error: GENERIC_LOGIN_ERROR }
    }

    const token = signSessionToken({ userId: found.id, tokenVersion: found.tokenVersion })
    await setSessionCookie(token)

    return { success: true, user: { id: found.id, name: found.name, email: found.email } }
  } catch (err) {
    console.error('login: ошибка входа', err)
    return { success: false, error: 'Не удалось выполнить вход. Попробуйте позже' }
  }
}
