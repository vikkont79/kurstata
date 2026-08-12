'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { registerSchema } from '@/features/auth/types'
import { hashPassword, signSessionToken, setSessionCookie, RATE_LIMIT_REGISTER, RATE_LIMIT_REGISTER_WINDOW_MS } from '@/shared/lib/auth'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/rateLimit'
import { getClientIp } from '@/shared/lib/getClientIp'
import type { User } from '@/entities/user'

export async function register(input: unknown): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const clientIp = getClientIp(await headers())
    if (clientIp) {
      const rl = await isRateLimited({
        key: clientIp,
        limit: RATE_LIMIT_REGISTER,
        windowMs: RATE_LIMIT_REGISTER_WINDOW_MS,
      })
      if (!rl.allowed) {
        return { success: false, error: formatRateLimitMessage(rl.reset) }
      }
    }

    const { name, email, password } = parsed.data

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
    if (existing) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const passwordHash = await hashPassword(password)

    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email, tokenVersion: users.tokenVersion })

    const token = signSessionToken({ userId: created.id, tokenVersion: created.tokenVersion })
    await setSessionCookie(token)

    return { success: true, user: created }
  } catch (err) {
    console.error('register: ошибка регистрации', err)
    return { success: false, error: 'Не удалось создать аккаунт. Попробуйте позже' }
  }
}