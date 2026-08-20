'use server'

import { headers } from 'next/headers'
import { resendSchema } from '@/features/auth/types'
import {
  generateConfirmationCode,
  savePendingRegistration,
  getPendingRegistration,
  getLastSentMs,
  setLastSentMs,
  getResendCooldownRemainingMs,
} from '@/features/auth/lib/registrationCode'
import { getEmailSender } from '@/shared/lib/email'
import { isRateLimited, formatRateLimitMessage } from '@/shared/lib/redis'
import { getClientIp } from '@/shared/lib/getClientIp'
import { RATE_LIMIT_RESEND, RATE_LIMIT_RESEND_WINDOW_MS } from '@/shared/lib/auth'

export async function resendRegistrationCode(
  input: unknown,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = resendSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { email } = parsed.data

    const clientIp = getClientIp(await headers())
    if (clientIp) {
      const rl = await isRateLimited({
        key: clientIp,
        limit: RATE_LIMIT_RESEND,
        windowMs: RATE_LIMIT_RESEND_WINDOW_MS,
      })
      if (!rl.allowed) {
        return { success: false, error: formatRateLimitMessage(rl.reset) }
      }
    }

    const pending = await getPendingRegistration(email)
    if (!pending) {
      return { success: false, error: 'Время вышло. Начните регистрацию заново' }
    }

    const remainingMs = getResendCooldownRemainingMs(await getLastSentMs(email))
    if (remainingMs > 0) {
      return { success: false, error: `Новый код можно запросить через ${Math.ceil(remainingMs / 1000)} с` }
    }

    const code = generateConfirmationCode()
    await savePendingRegistration({ ...pending, code })

    await getEmailSender().send({
      to: email,
      subject: 'Код подтверждения',
      html: `<p>Ваш код подтверждения:</p><p><strong>${code}</strong></p><p>Код действителен 15 минут.</p>`,
    })

    await setLastSentMs(email)

    return { success: true }
  } catch (err) {
    console.error('resendRegistrationCode: ошибка', err)
    return { success: false, error: 'Не удалось отправить письмо. Попробуйте позже' }
  }
}