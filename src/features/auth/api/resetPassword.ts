'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { resetPasswordSchema, INVALID_LINK_MESSAGE } from '@/features/auth/types'
import {
  hashPassword,
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  hashResetToken,
  isResetTokenExpired,
  RATE_LIMIT_RESET_PASSWORD,
  RATE_LIMIT_RESET_PASSWORD_WINDOW_MS,
} from '@/shared/lib/auth'
import { getEmailSender } from '@/shared/lib/email'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'
import { headers } from 'next/headers'

export async function resetPassword(
  token: string,
  input: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = resetPasswordSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const clientIp = getClientIp(await headers())

    if (clientIp) {
      const rl = await isRateLimited({
        key: `reset-password:${clientIp}`,
        limit: RATE_LIMIT_RESET_PASSWORD,
        windowMs: RATE_LIMIT_RESET_PASSWORD_WINDOW_MS,
      })
      if (!rl.allowed) {
        return { success: false, error: formatRateLimitMessage(rl.reset) }
      }
    }

    const tokenHash = hashResetToken(token)

    const [found] = await db
      .select({
        id: users.id,
        email: users.email,
        passwordResetExpiresAt: users.passwordResetExpiresAt,
      })
      .from(users)
      .where(eq(users.passwordResetTokenHash, tokenHash))

    if (!found || !found.passwordResetExpiresAt || isResetTokenExpired(found.passwordResetExpiresAt)) {
      return { success: false, error: INVALID_LINK_MESSAGE }
    }

    const passwordHash = await hashPassword(parsed.data.password)

    const [updated] = await db
      .update(users)
      .set({
        passwordHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        tokenVersion: sql`${users.tokenVersion} + 1`,
      })
      .where(eq(users.id, found.id))
      .returning({ id: users.id, tokenVersion: users.tokenVersion })

    await clearSessionCookie()
    await setSessionCookie(signSessionToken({ userId: updated.id, tokenVersion: updated.tokenVersion }))

    await getEmailSender().send({
      to: found.email,
      subject: 'Пароль изменён',
      html: `<p>Пароль от вашего аккаунта был изменён.</p>
             <p>Если это были не вы — срочно запросите восстановление пароля и проверьте устройство.</p>`,
    })

    return { success: true }
  } catch (err) {
    console.error('resetPassword: ошибка', err)
    return { success: false, error: 'Не удалось изменить пароль. Попробуйте позже' }
  }
}
