'use server'

import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { registerSchema } from '@/features/auth/types'
import { hashPassword, RATE_LIMIT_REGISTER, RATE_LIMIT_REGISTER_WINDOW_MS } from '@/shared/lib/auth'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'
import { generateConfirmationCode, savePendingRegistration, deletePendingRegistration } from '@/features/auth/lib/registrationCode'
import { getEmailSender } from '@/shared/lib/email'

export async function register(
  input: unknown,
): Promise<{ success: true; email: string } | { success: false; error: string }> {
  try {
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const clientIp = getClientIp(await headers())
    if (clientIp) {
      const rl = await isRateLimited({
        key: `register:${clientIp}`,
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
    const code = generateConfirmationCode()

    await savePendingRegistration({ name, email, passwordHash, code })

    try {
      await getEmailSender().send({
        to: email,
        subject: 'Код подтверждения',
        html: `<p>Ваш код подтверждения:</p><p><strong>${code}</strong></p><p>Код действителен 15 минут.</p>`,
      })
    } catch (emailErr) {
      await deletePendingRegistration(email)
      console.error('register: не удалось отправить письмо', emailErr)
      return { success: false, error: 'Не удалось отправить письмо. Попробуйте позже' }
    }

    return { success: true, email }
  } catch (err) {
    console.error('register: ошибка регистрации', err)
    return { success: false, error: 'Не удалось создать аккаунт. Попробуйте позже' }
  }
}
