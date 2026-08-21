import { consoleSender } from './consoleSender'
import { createResendSender } from './resendSender'
import type { EmailSender } from './types'
import { env } from '@/shared/lib/env'

const getEmailSender = (): EmailSender => {
  if (env.RESEND_API_KEY) {
    return createResendSender(env.RESEND_API_KEY)
  }

  return consoleSender
}

export { getEmailSender }
