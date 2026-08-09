import { consoleSender } from './consoleSender'
import { createResendSender } from './resendSender'
import type { EmailSender } from './types'

const isEmailDeliveryEnabled = (): boolean => {
  return Boolean(process.env.RESEND_API_KEY)
}

const getEmailSender = (): EmailSender => {
  if (isEmailDeliveryEnabled()) {
    return createResendSender(process.env.RESEND_API_KEY as string)
  }

  return consoleSender
}

export { getEmailSender, isEmailDeliveryEnabled }
