'use server'

import { headers } from 'next/headers'
import { LibsqlError } from '@libsql/client'
import { db } from '@db/client'
import { users } from '@db/schema'
import { confirmSchema, INVALID_CODE_MESSAGE } from '@/features/auth/types'
import { signSessionToken, setSessionCookie, RATE_LIMIT_CONFIRM, RATE_LIMIT_CONFIRM_WINDOW_MS } from '@/shared/lib/auth'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'
import { getPendingRegistration, deletePendingRegistration } from '@/features/auth/lib/registrationCode'

export async function confirmRegistration(
  input: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = confirmSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const clientIp = getClientIp(await headers())
    if (clientIp) {
      const rl = await isRateLimited({
        key: `confirm:${clientIp}:${parsed.data.email}`,
        limit: RATE_LIMIT_CONFIRM,
        windowMs: RATE_LIMIT_CONFIRM_WINDOW_MS,
      })
      if (!rl.allowed) {
        return { success: false, error: formatRateLimitMessage(rl.reset) }
      }
    }

    const { email, code } = parsed.data

    const pending = await getPendingRegistration(email)
    if (!pending || pending.code !== code) {
      return { success: false, error: INVALID_CODE_MESSAGE }
    }

    await deletePendingRegistration(email)

    let created: { id: string; tokenVersion: number }
    try {
      ;[created] = await db
        .insert(users)
        .values({ name: pending.name, email, passwordHash: pending.passwordHash })
        .returning({ id: users.id, tokenVersion: users.tokenVersion })
    } catch (insertErr) {
      if (insertErr instanceof LibsqlError && insertErr.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, error: 'Пользователь с таким email уже зарегистрирован' }
      }
      throw insertErr
    }

    const token = signSessionToken({ userId: created.id, tokenVersion: created.tokenVersion })
    await setSessionCookie(token)

    return { success: true }
  } catch (err) {
    console.error('confirmRegistration: ошибка', err)
    return { success: false, error: 'Не удалось завершить регистрацию. Попробуйте позже' }
  }
}
