'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { requestResetSchema } from '@/features/auth/types'
import { getEmailSender } from '@/shared/lib/email'
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS, RATE_LIMIT_RESET, RATE_LIMIT_RESET_WINDOW_MS } from '@/shared/lib/auth'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'

const getAppOrigin = async (): Promise<string> => {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export async function requestPasswordReset(
  input: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = requestResetSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { email } = parsed.data

    const clientIp = getClientIp(await headers())

    if (clientIp) {
      const rl = await isRateLimited({
        key: `reset:${clientIp}`,
        limit: RATE_LIMIT_RESET,
        windowMs: RATE_LIMIT_RESET_WINDOW_MS,
      })
      if (!rl.allowed) {
        return { success: false, error: formatRateLimitMessage(rl.reset) }
      }
    }

    const [found] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))

    if (found) {
      const rlEmail = await isRateLimited({
        key: `reset:${email}`,
        limit: RATE_LIMIT_RESET,
        windowMs: RATE_LIMIT_RESET_WINDOW_MS,
      })
      if (!rlEmail.allowed) {
        return { success: false, error: formatRateLimitMessage(rlEmail.reset) }
      }

      const token = generateResetToken()
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString()

      await db
        .update(users)
        .set({ passwordResetTokenHash: hashResetToken(token), passwordResetExpiresAt: expiresAt })
        .where(eq(users.id, found.id))

      const origin = await getAppOrigin()
      const resetUrl = `${origin}/?reset=${encodeURIComponent(token)}`

      await getEmailSender().send({
        to: found.email,
        subject: 'Сброс пароля',
        html: `<p>Кто-то запросил сброс пароля для вашего аккаунта.</p>
               <p>Перейдите по ссылке: <a href="${resetUrl}">${resetUrl}</a></p>
               <p>Ссылка действительна 30 минут. Если вы не запрашивали сброс — проигнорируйте письмо.</p>`,
      })
    }

    return { success: true }
  } catch (err) {
    console.error('requestPasswordReset: ошибка', err)
    return { success: false, error: 'Не удалось отправить письмо. Попробуйте позже' }
  }
}
