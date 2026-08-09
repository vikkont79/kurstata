import { Resend } from 'resend'
import type { EmailMessage, EmailSender } from './types'

const FROM_ADDRESS = 'onboarding@resend.dev'

const createResendSender = (apiKey: string): EmailSender => {
  const resend = new Resend(apiKey)

  return {
    send: async (message: EmailMessage) => {
      const { error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: message.to,
        subject: message.subject,
        html: message.html,
      })

      if (error) {
        throw new Error(`Resend error: ${error.message}`)
      }
    },
  }
}

export { createResendSender }
